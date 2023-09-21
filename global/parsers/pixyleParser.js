const util = require('../util.js');
class PixyleParser {
  constructor() {}

  async parse(output, action) {
    // parse the output type and process it
    switch (output.type) {
      case util.OutputType.API_PUSH:
        this.handler(action);
        break;
    }
  }

  async handler(actionObject) {
    // push the action to the api
    const family = actionObject.family;
    const payload = actionObject.payload;
    const action = actionObject.action;

    switch (action) {
      case 'run':
        this.createDataset(actionObject);
        break;
      case 'process':
        this.processDataset(actionObject);
        break;
      case 'result':
        this.resultDataset(actionObject);
        break;
      default:
        // log error
        util.logger.saveLog(
          'error-no-action/' + actionObject.origin,
          actionObject.action,
          actionObject.payload,
          'Invalid action'
        );
        break;
    }
  }

  async createDataset(actionObject) {
    const mgmtClient = new util.MgmtAPI();

    // get the product id
    const productId = actionObject.payload;

    // get the product from the mgmt api
    var p = await mgmtClient.getProduct(actionObject.payload);

    // if product is not found log error and return
    if (!p || !p.Resource || !p.Resource[0]) {
      util.logger.saveLog(
        'error-no-product/' + actionObject.origin,
        actionObject.action,
        actionObject.payload,
        'Product not found'
      );
      return;
    }

    // create dataset for pixyle in JSON format
    const product = p.Resource[0];
    const dataset = await this.getDatasetFormatFromProduct(product);

    // get token from pixyle api
    const pixyleAPI = new util.PixyleAPI();
    const token = await pixyleAPI
      .getToken()
      .then(token => {
        return token;
      })
      .catch(err => {
        console.error(`Failed to get token: ${err}`);
      });

    // create dataset in pixyle
    const datasetId = await pixyleAPI
      .createDataset(dataset, productId)
      .then(dataset => {
        return dataset;
      });

    // save in datastore
    const dataStore = util.dataStore;
    dataStore.processTable.createOrUpdateEntity({
      partitionKey: datasetId,
      rowKey: productId,
      status: 'creating'
    });


  }

  async processDataset(actionObject) {
    const datasetId = actionObject.payload;

    const dataset = await util.dataStore.processTable
      .fetchData({ partitionKey: datasetId })
      .then(async data => {
        if (data && data.length > 0) {
          return data[0];
        }
        return null;
      });
    if (!dataset) {
      return;
    }
    if (dataset.status != 'creating') {
      return;
    }

    // use api to get status
    const pixyleAPI = new util.PixyleAPI();
    const datasetStatus = await pixyleAPI
      .getDatasetStatus(dataset.partitionKey)
      .then(status => {
        if (status && status.meta) {
          return status.meta;
        }
        return null;
      });

    // if processed_images_percentage not 100% return
    if (!datasetStatus.processed_images_percentage == 100) {
      return;
    }

    // start tagging
    const startTagging = await pixyleAPI
      .startDatasetTagging(datasetId)
      .then(result => {
        return result;
      });

    if (startTagging && startTagging.status == 'OK') {
      // update status in datastore
      util.dataStore.processTable.createOrUpdateEntity({
        partitionKey: datasetId,
        rowKey: dataset.rowKey,
        status: 'processing'
      });
    }
  }

  async resultDataset(actionObject) {
    const datasetId = actionObject.payload;

    // check if dataset is processed
    const ds = await util.dataStore.processTable.fetchData({
      partitionKey: datasetId
    });

    // check if dataset is present in datastore
    if (!ds || ds.length == 0) {
      return;
    }

    // check status of dataset
    if (ds[0].status != 'processing') {
      //return;
    }

    // get status from api
    const pixyleAPI = new util.PixyleAPI();
    const datasetStatus = await pixyleAPI
      .getDatasetTaggingStatus(datasetId)
      .then(status => {
        if (status && status.meta) {
          return status.meta;
        }
        return null;
      });

    // if dataset is not processed return
    if (!datasetStatus.processed_images_percentage == 100) {
      return;
    }

    const productId = ds[0].rowKey;

    // get result from api
    const productResult = await pixyleAPI
      .getProductResult(datasetId, productId)
      .then(result => {
        return result;
      });

    if (!productResult || productResult.length == 0) {
      return;
    }

    // prepare result for payload
    const resultPayload = {
      productId: productId,
      datasetId: datasetId,
      result: productResult[0]
    };

    // update status in datastore to saveing
    util.dataStore.processTable.createOrUpdateEntity({
      partitionKey: datasetId,
      rowKey: ds[0].rowKey,
      status: 'saving',
      data: JSON.stringify(productResult)
    });

    // place in queue to save
    const object = {
      action: 'product-save',
      payload: resultPayload,
      origin: 'pixyleParser-result/' + actionObject.origin
    };
    util.queue.enqueueMessage(object);
  }

  async getDatasetFormatFromProduct(product) {
    // docs: https://drive.google.com/file/d/1wJH6omTK4g2cmohX9sMA3s0lAl3_ywT_/view

    const images = product.Images;

    const dataset = [];
    const item = {
      id: product.ProductId
    };

    // add image urls
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i].Url;
      if (imageUrl) {
        item[`image_url_${i + 1}`] = imageUrl;
      }
    }
    dataset.push(item);
    return dataset;
  }
}
module.exports = PixyleParser;
