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

### Functions

### Broker table

### Flow

### Setting up Pixyle tags with Geins Product Meta Data

## Suggested usecases
