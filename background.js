/*
 * @author Warren Harrison / http://hungry-media.com/
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript( null, { code: "main();" } );
});

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.command == "getOptions")
      sendResponse({answer: JSON.parse( localStorage['ExtensionOptions'] ) });
  });

