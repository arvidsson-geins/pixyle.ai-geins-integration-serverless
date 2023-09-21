const util = require('../global/util.js');
// My Parsers
const { PixyleParser, GeinsParser } = require('../global/parsers/');
module.exports = async function(context, item) {
  try {

    let origin = 'queue-trigger';
    if (item.origin) {
      origin += `/${item.origin}`;
    }
    // get the queue message and process it
    let action = new util.Action(origin, item.action, item.payload);
    console.log('========== action:');
    console.log(action);
    console.log('===================');
    if(!action) {
      context.log('Error in "new util.Action(origin, item.action, item.payload)":', error);
      return;
    }

    // log the action and payload
    // util.logger.saveActionToLog(action);

    // process the action
    //context.log('*-* Processing action:', action);
    //context.log('*-* action.familyAndAction():', action.familyAndAction());


    switch (action.familyAndAction()) {
      // Status creating -> processing
      case 'product-run':
      case 'products-run':
        action.output.push(
          new util.Output(util.OutputType.API_PUSH, new PixyleParser())
        );
        break;
      // Status processing - > proccessed
      case 'product-process':
      case 'products-process':
        action.output.push(
          new util.Output(util.OutputType.API_PUSH, new PixyleParser())
        );
        break;
      // Status proccessed -> saveing
      case 'product-result':
      case 'products-result':
        action.output.push(
          new util.Output(util.OutputType.API_PUSH, new PixyleParser())
        );
        break;
      // Status saveing -> saved
      case 'product-save':
      case 'products-save':
        action.output.push(
          new util.Output(util.OutputType.API_PUSH, new GeinsParser())
        );
        break;
      default:
        // log error
        context.log('Invalid action:', action);
        break;
    }



  // run action and catch any errors
    action.run();
  } catch (error) {
    // log the error
    console.log('========== error:');
    console.log(error);
    console.log('===================');
  }
};
