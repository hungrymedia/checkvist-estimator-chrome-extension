/*
 * @author Warren Harrison / http://hungry-media.com/
 */

// if no options saved to local storage, yet. Set defaults and save to storage
var defaultOptions = {
  'hours' : {
    'tag' : 'h', 
    'prefix' : true, 
    'generate' : true
  },
  'days' : {
    'tag' : 'd', 
    'prefix' : true, 
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
