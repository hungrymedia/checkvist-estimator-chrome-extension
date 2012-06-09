/*
 * @author Warren Harrison / http://hungry-media.com/
 */

// if no options saved to local storage, yet. Set defaults and save to storage
var defaultOptions = {
  'hours' : {
    'tag' : '', 
    'prefix' : false, 
    'generate' : true
  },
  'days' : {
    'tag' : '', 
    'prefix' : false, 
    'generate' : false, 
    'hoursPer' : 8
  }
}
// load options from storage
var extensionOptions = localStorage['ExtensionOptions'];
if( extensionOptions == undefined ){
  localStorage['ExtensionOptions'] = JSON.stringify(defaultOptions);
  extensionOptions = defaultOptions;
}else{
  extensionOptions = JSON.parse(localStorage['ExtensionOptions']);
}