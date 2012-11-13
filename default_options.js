/*
 * @author Warren Harrison / http://hungry-media.com/
 */

// if no options saved to local storage, yet. Set defaults and save to storage
var defaultOptions = {
  'minutes' : {
    'tag' : 'm', 
    'prefix' : false, 
    'generate' : false
  },
  'hours' : {
    'tag' : 'h', 
    'prefix' : false, 
    'generate' : true, 
    'minsPer' : 60
  },
  'days' : {
    'tag' : 'd', 
    'prefix' : false, 
    'generate' : false, 
    'hoursPer' : 8
  }, 
  'includeClosed' : true
}
// load options from storage
var extensionOptions = localStorage['ExtensionOptions'];
if( extensionOptions == undefined ){
  localStorage['ExtensionOptions'] = JSON.stringify(defaultOptions);
  extensionOptions = defaultOptions;
}else{
  extensionOptions = JSON.parse(localStorage['ExtensionOptions']);
}
