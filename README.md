[![NPM Package][npm]][npm-url]
[![NPM Downloads][npm-downloads-per-month]][npm-trends]
![Geins][mit-shield]

[![Start Geins Free Trial][geins-tiral-img]][geins-tiral-url] [![Geins Docs][geins-docs-img]][geins-docs-url]

[![geins-banner](https://raw.githubusercontent.com/geins-io/resources/master/images/banners/repos/pixyle-io.jpg)](https://www.geins.io)

# Introduction

Skip tedious manual work and automate the process of tagging products with meta data from product images in Geins with AI technology by Pixyle.

Try the demo from Pixyle here: [https://www.pixyle.ai/demo](https://demo.pixyle.ai/) to see how it works on your product catalog.


## Pre-requisites

- Node.js
- Azure Account (Storage Account, Table Storage, Queue Storage) [Get a free account here](https://azure.microsoft.com/en-us/free/)
- Geins Management API Account. [Get a free trial here](https://www.geins.io)
- Pixyle Account. [Get one here](https://www.pixyle.ai)

## Features

Auto tag products with meta data from product images in Geins with AI technology by Pixyle.

"Replace manual, repetitive and costly labeling with our state-of-the art visual AI than can auto-tag and process your entire catalogue in minutes instead of hours." - Pixyle

## Suggested usecase
Use this to automatically tag your products with meta data from product images. For example, you can use this to tag your products with color, pattern, material, style, etc. From this you can create filters and search for your products. This will most likely increase your conversion rate and customer satisfaction.


## Getting started

Run the following command to install the dependencies:

```bash
npm install
```

Add the `local.settings.json` file to the root of the project. The `local.settings.json` file is used to store the credentials for the Azure Storage Account and Geins Management API. The `local.settings.json` file is not checked in to the repository.

```json
{
  "IsEncrypted": false,
  "Values": {
   "ENVIRONMENT" : "development",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "my-storage-connection-string",

    "AZURE_ACCOUNT_NAME": "my-account-name",
    "AZURE_ACCOUNT_KEY": "my-key",
    "AZURE_TABLE_NAME": "log",
    "AZURE_QUEUE_NAME": "queue-items",

    "GEINS_MGMT_API_KEY": "my-key",
    "GEINS_MGMT_API_USERMAME": "my-username",
    "GEINS_MGMT_API_PASSWORD": "my-pwd",

    "PIXYLE_USERMAME": "my-username",
    "PIXYLE_PASSWORD": "my-pwd",
  },
  "Host": {
    "CORS": "*"
  }
}
```

Run the following command to start the function app:

```bash
func start
```

### Authentication

@azure/core-auth is used for authentication. You can find more information here: https://www.npmjs.com/package/@azure/core-auth

- For the table storage and queue storage, you can use the connection string or credentials.
- For the Geins API, you use api-user credentialas and api-key. Read more at docs.geins.io.

Update the `local.settings.json` file with your credentials:

```json
{
  "IsEncrypted": false,
  "Values": {
    "ENVIRONMENT" : "development",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "my-storage-connection-string",

    "AZURE_ACCOUNT_NAME": "my-account-name",
    "AZURE_ACCOUNT_KEY": "my-key",
    "AZURE_TABLE_NAME": "log",
    "AZURE_QUEUE_NAME": "queue-items",

    "GEINS_MGMT_API_KEY": "my-key",
    "GEINS_MGMT_API_USERMAME": "my-username",
    "GEINS_MGMT_API_PASSWORD": "my-pwd",

    "PIXYLE_USERMAME": "my-username",
    "PIXYLE_PASSWORD": "my-pwd",
  }
}
```

## How it works 

The serverless function app is triggered by a message in the queue. The message contains the product id and the image url. The function app then downloads the image from the url and sends it to Pixyle for processing. Pixyle returns the meta data for the image. The function app then updates the product in Geins with the meta data.

### Parsers

#### PixyleParser
This is a wrapper around the Pixyle API. It handles authentication and parsing of the response. The parser returns a list of PixyleAttributes.

##### createDataset()
Creates an dataset out of the product images and stores the dataset id in the process table.

##### processDataset()
Gets the dataset id from the `processTable` and starts the processing of the dataset if datset is uploaded and ready for processing. 

##### resultDataset()
Gets the dataset id from the `processTable` and gets the result of the processing. The result is stored in the `processTable`.


#### GeinsParser
This is a wrapper around the Geins Management API. It handles authentication and parsing of the response. The parser returns a list of GeinsAttributes.

##### productSave()
Saves the result of the processing to the product in Geins.

##### parameterBroker()
Gets the parmeterId from the `brokerTable` based on the pixyle attribute.


### Broker table
The broker table is used to translate pixyle attributes into your own attributes. For example, if Pixyle returns the attribute `color` and you want to map it to a parmeter of choice in Geins. Application automaticly creates an azure stroage table called `brokerTable`.

The table has the following structure:
- PartitionKey: `pixyle attribute`
- RowKey: `pixyle attribute`
- paramterId: `geins parameter id`


### Process table
The table has the following structure:
- PartitionKey: `pixyle datasetid`
- RowKey: `geins product id`
- status: `status of the process` can be `creating`, `processing`, `saving`, `saved`
- data: `json data from pixyle`


### Flow
1. Create dataset in pixyle  - from webhook to `httpTrigger` to `queueTrigger`
3. Process dataset in pixyle - form `timerTrigger` to `queueTrigger`
4. Get result of dataset from pixyle - from `timerTrigger` to `queueTrigger`
5. Update product in geins with result - from `timerTrigger` to `queueTrigger`


### Setting up Pixyle tags with Geins Product Meta Data
Create a new parameter/properties group in geins or use an existing one. Add the parameters/properties you want to use in the group. Add the id of the parameter/properties to the `brokerTable` with the pixyle attribute as `PartitionKey` and `RowKey`. 

All returned pixyle attributes will be added to the `brokerTable`. You can then map the pixyle attributes to your geins `parmeterId` in the broker table.




[npm]: https://img.shields.io/npm/v/@geins/pixyle-ai-geins-integration-serverless
[npm-url]: https://www.npmjs.com/package/@geins/pixyle-ai-geins-integration-serverless
[npm-downloads-per-month]: https://img.shields.io/npm/dm/@geins/pixyle-ai-geins-integration-serverless.svg
[npm-trends]: https://npmtrends.com/@geins/pixyle-ai-geins-integration-serverless
[geins-docs-url]: https://docs.geins.io
[geins-docs-img]: https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/geins-io/resources/master/sheilds/geins-docs-read-v3.json
[geins-tiral-url]: https://www.geins.io
[geins-tiral-img]: https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/geins-io/resources/master/sheilds/geins-fee-tiral.json
[mit-shield]: https://img.shields.io/badge/license-MIT-green
[mit-url]: https://en.wikipedia.org/wiki/MIT_License
