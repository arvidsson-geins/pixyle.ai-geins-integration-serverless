const util = require('../util.js');
class GeinsParser {
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
    switch (family) {
      case 'product':
        this.productSave(payload);
        break;
      case 'products':
        this.productsSave(payload);
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

  async productSave(payload) {
    const productId = payload.productId;
    const datasetId = payload.datasetId;
    const tagResult = payload.result;
    const attributes = tagResult.detected_attributes_types;

    const prameters = [];
    prameters.push(
      this.parameterUpdateObject(
        await this.parameterBroker('category'),
        tagResult.category
      )
    );

    for (let index = 0; index < attributes.length; index++) {
      const at = attributes[index];
      const pid = await this.parameterBroker(at.attribute_type);
      const attrbs = at.attributes.correct;
      const value =
        attrbs.length > 0 ? attrbs.map(obj => obj.attribute).join(',') : '';

      prameters.push({ parameterId: pid, value: value });
    }
    // update parameters
    const mgmtClient = new util.MgmtAPI();
    let updates = 0;
    for (let index = 0; index < prameters.length; index++) {
      const parameter = prameters[index];
      if (parameter.parameterId == 0 || parameter.value == '') continue;
      const success = await mgmtClient.updateParameter(
        productId,
        parameter.parameterId,
        parameter.value
      );
      if (success) updates++;
    }

    // If not all parameters was updated
    if (updates != prameters.length) {
      // handle dicrepancy
    }

    // update dataset
    util.dataStore.processTable.createOrUpdateEntity({
      partitionKey: datasetId,
      rowKey: productId,
      status: 'saved'
    });
  }

  async parameterBroker(attributeName) {
    // get parameter id from attribute name in broker table
    const dataStore = util.dataStore;
    const entity = await dataStore.brokerTable.fetchData({
      partitionKey: attributeName
    });

    if (entity && entity.length > 0) {
      return entity[0].parameterId;
    }

    // if not found add name to broker table for future use and return 0
    await dataStore.brokerTable.createOrUpdateEntity({
      partitionKey: attributeName,
      rowKey: attributeName,
      parameterId: 0
    });

    return 0;
  }

  parameterUpdateObject(parameterId, value, extra) {
    return {
      parameterId: parameterId,
      value: value,
      extra: extra
    };
  }
}
module.exports = GeinsParser;
