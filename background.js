/*
 * @author Warren Harrison / http://hungry-media.com/
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript( null, { file: "jquery.js" } );
  chrome.tabs.executeScript( null, { file: "default_options.js" } );
  chrome.tabs.executeScript( null, { file: "content_script.js" } );
});