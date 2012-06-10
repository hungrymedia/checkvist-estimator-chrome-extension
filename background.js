/*
 * @author Warren Harrison / http://hungry-media.com/
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript( null, { file: "jquery.js" } );
  chrome.tabs.executeScript( null, { file: "default_options.js" } );
  chrome.tabs.executeScript( null, { file: "content_script.js" } );

});

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.command == "getOptions")
      sendResponse({answer: JSON.parse( localStorage['ExtensionOptions'] ) });
  });

