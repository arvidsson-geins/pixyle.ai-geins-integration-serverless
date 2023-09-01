const util = require('../global/util.js');
module.exports = async function(context, myTimer) {
  // Array of messages for queue
  let messages = [];

  // Handle datasets that are in status creating
  const dataCreating = await util.dataStore.processTable.fetchData({
    status: 'creating'
  });
  if (dataCreating && dataCreating.length > 0) {
    for (let index = 0; index < dataCreating.length; index++) {
      const dataset = dataCreating[index];
      const datasetId = dataset.partitionKey;
      // create queue message
      const message = {
        action: 'products-process',
        payload: datasetId,
        origin: 'timer-trigger'
      };
      messages.push(message);
    }
  }

  // Handle datasets that are in status processing
  const dataProcessing = await util.dataStore.processTable.fetchData({
    status: 'processing'
  });

  if (dataProcessing && dataProcessing.length > 0) {
    for (let index = 0; index < dataProcessing.length; index++) {
      const dataset = dataProcessing[index];
      const datasetId = dataset.partitionKey;
      // create queue message
      const message = {
        action: 'products-result',
        payload: datasetId,
        origin: 'timer-trigger'
      };
      messages.push(message);
    }
  }

  // Put in queue
  if (messages.length > 0) {
    // This will be a batch of messages with throttle 100ms
    util.queue.enqueueMessages(messages, 100);
  }
};
