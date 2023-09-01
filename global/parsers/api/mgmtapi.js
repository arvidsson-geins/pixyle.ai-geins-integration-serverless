// Geins Mgmt API Wrapper
// https://github.com/geins-io/sdk-api-mgmt-javascript
const GeinsMgmtAPI = require('@geins/sdk-api-mgmt-javascript');
class MgmtAPI {
  constructor() {
    // Geins Mgmt API Setup
    this.api = GeinsMgmtAPI;
    this.client = GeinsMgmtAPI.ApiClient.instance;
    this.apiKey = this.client.authentications['apiKey'];
    this.basicAuth = this.client.authentications['basicAuth'];
    this.apiKey.apiKey = process.env['GEINS_MGMT_API_KEY'];
    this.basicAuth.username = process.env['GEINS_MGMT_API_USERMAME'];
    this.basicAuth.password = process.env['GEINS_MGMT_API_PASSWORD'];
  }

  async getProduct(id) {
    let api = new this.api.ProductApi();
    let query = new this.api.ProductModelsProductQuery();
    query.ProductIds = [];
    query.ProductIds.push(id);
    let opts = {};
    opts.include = 'images';

    //return the products
    return await new Promise((resolve, reject) => {
      api.queryProducts(query, opts, (error, data, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async updateParameter(productId, parameterId, value) {
    return await new Promise((resolve, reject) => {
      try {
        let api = new this.api.ProductParameterApi();
        let ppv = new this.api.ProductParameterModelsWriteProductParameterValue();
        ppv.parameterId = parameterId;
        ppv.productId = productId;
        ppv.value = value;
        api.createOrUpdateProductParameterValue(
          ppv,
          (error, data, response) => {
            if (error) {
              reject(false);
            } else {
              resolve(true);
            }
          }
        );
      } catch (error) {
        reject(false);
      }
    });
  }
}
module.exports = MgmtAPI;
