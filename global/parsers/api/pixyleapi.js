const https = require('follow-redirects').https;
const FormData = require('form-data');
const fs = require('fs');

class PixyleAPI {
  constructor() {
    // pixyle API Setup
    this.username = process.env['PIXYLE_USERMAME'];
    this.password = process.env['PIXYLE_PASSWORD'];
    this.token = '';
    this.host = 'pva.pixyle.ai/v4';
  }

  async getToken() {
    return new Promise((resolve, reject) => {
      // if token is present return it
      if (this.token.length > 0) {
        resolve(this.token);
        return;
      }
      // set this.token to empty string
      this.token = '';

      var options = {
        method: 'POST',
        hostname: 'pva.pixyle.ai',
        path: '/v4/users/login',
        headers: {
          'Content-Type': 'application/json'
        },
        maxRedirects: 20
      };

      var req = https.request(options, res => {
        var chunks = [];

        res.on('data', chunk => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          var body = Buffer.concat(chunks);
          const parsedBody = JSON.parse(body.toString());

          if (parsedBody && parsedBody.access_token) {
            this.token = parsedBody.access_token;
            resolve(this.token);
          } else {
            reject(new Error('Token not found in response'));
          }
        });

        res.on('error', error => {
          console.error(error);
          reject(error);
        });
      });

      const postData = JSON.stringify({
        username: this.username,
        password: this.password
      });

      req.write(postData);
      req.end();
    });
  }

  async createDataset(jsonObject, filePrefix = 'file') {
    return new Promise(async (resolve, reject) => {
      if (!this.token) {
        try {
          await this.getToken();
        } catch (error) {
          reject(error);
          return;
        }
      }

      const jsonString = JSON.stringify(jsonObject);
      const buffer = Buffer.from(jsonString, 'utf-8');
      const formData = new FormData();
      formData.append('file', buffer, {
        contentType: 'application/json',
        filename: `${filePrefix}.json`
      });

      const options = {
        method: 'POST',
        hostname: 'pva.pixyle.ai',
        path: '/v4/datasets',
        headers: {
          Authorization: `Bearer ${this.token}`,
          ...formData.getHeaders()
        }
      };

      const req = https.request(options, res => {
        let chunks = [];

        res.on('data', chunk => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          let body = Buffer.concat(chunks);
          const parsedBody = JSON.parse(body.toString());
          if (parsedBody && parsedBody.dataset_id) {
            resolve(parsedBody.dataset_id);
          } else {
            reject(new Error('Response does not contain dataset ID'));
          }
        });

        res.on('error', error => {
          reject(error);
        });
      });

      formData.pipe(req);
      req.end();
    });
  }

  async startDatasetTagging(datasetId) {
    return new Promise(async (resolve, reject) => {
      if (!this.token) {
        try {
          await this.getToken();
        } catch (error) {
          reject(error);
          return;
        }
      }

      const options = {
        method: 'GET',
        hostname: 'pva.pixyle.ai',
        path: `/v4/datasets/${datasetId}/solutions/auto-tag`,
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      };

      const req = https.request(options, res => {
        let chunks = [];

        res.on('data', chunk => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          let body = Buffer.concat(chunks);
          const parsedBody = JSON.parse(body.toString());
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedBody);
          } else {
            reject(
              new Error(
                `Server responded with status code ${
                  res.statusCode
                }: ${parsedBody.detail || ''}`
              )
            );
          }
        });

        res.on('error', error => {
          reject(error);
        });
      });

      req.end();
    });
  }

  async getDatasetStatus(datasetId) {
    return new Promise(async (resolve, reject) => {
      if (!this.token) {
        try {
          await this.getToken();
        } catch (error) {
          reject(error);
          return;
        }
      }

      const options = {
        method: 'GET',
        hostname: 'pva.pixyle.ai',
        path: `/v4/datasets/${datasetId}/status`,
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      };

      const req = https.request(options, res => {
        let chunks = [];

        res.on('data', chunk => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          let body = Buffer.concat(chunks);
          const parsedBody = JSON.parse(body.toString());

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedBody);
          } else {
            reject(
              new Error(
                `Server responded with status code ${
                  res.statusCode
                }: ${parsedBody.detail || ''}`
              )
            );
          }
        });

        res.on('error', error => {
          reject(error);
        });
      });

      req.end();
    });
  }

  async getDatasetTaggingStatus(datasetId) {
    return new Promise(async (resolve, reject) => {
      if (!this.token) {
        try {
          await this.getToken();
        } catch (error) {
          reject(error);
          return;
        }
      }

      const options = {
        method: 'GET',
        hostname: 'pva.pixyle.ai',
        path: `/v4/datasets/${datasetId}/solutions/auto-tag/status`,
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      };

      const req = https.request(options, res => {
        let chunks = [];

        res.on('data', chunk => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          let body = Buffer.concat(chunks);
          const parsedBody = JSON.parse(body.toString());

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedBody);
          } else {
            reject(
              new Error(
                `Server responded with status code ${
                  res.statusCode
                }: ${parsedBody.detail || ''}`
              )
            );
          }
        });

        res.on('error', error => {
          reject(error);
        });
      });

      req.end();
    });
  }

  async getProductResult(datasetId, productId) {
    return new Promise(async (resolve, reject) => {
      if (!this.token) {
        try {
          await this.getToken();
        } catch (error) {
          reject(error);
          return;
        }
      }

      const options = {
        method: 'GET',
        hostname: 'pva.pixyle.ai',
        path: `/v4/datasets/${datasetId}/solutions/auto-tag/products/${productId}`,
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      };

      const req = https.request(options, res => {
        let chunks = [];

        res.on('data', chunk => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          let body = Buffer.concat(chunks);
          const parsedBody = JSON.parse(body.toString());
          if (res.statusCode >= 200 && res.statusCode < 300) {
            if (parsedBody && parsedBody.result) {
              resolve(parsedBody.result);
            } else {
              reject(new Error('Response does not contain dataset ID'));
            }
            resolve(parsedBody);
          } else {
            reject(
              new Error(
                `Server responded with status code ${
                  res.statusCode
                }: ${parsedBody.detail || ''}`
              )
            );
          }
        });

        res.on('error', error => {
          reject(error);
        });
      });

      req.end();
    });
  }
}
module.exports = PixyleAPI;
