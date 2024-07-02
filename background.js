chrome.action.onClicked.addListener((tab) => {
  console.log(tab);
  chrome.tabs.sendMessage(tab.id, {action: "toggleCharacter"});
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeDom") {
    console.log(JSON.stringify({ dom: request.dom }));

    chrome.storage.sync.get(['apiUrl', 'apiKey', 'model'], function(items) {
      fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Url': items.apiUrl || '',
          'X-API-Key': items.apiKey || '',
          'X-Model': items.model || 'gpt-3.5-turbo'
        },
        body: JSON.stringify({ dom: request.dom }),
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.analysis) {
          // chrome.browserAction.setBadgeText({ text: "!" });
          chrome.storage.local.set({ latestReport: data });
        } else {
          // chrome.browserAction.setBadgeText({ text: "" });
        }
      })
      .catch(error => console.error('Error:', error));
    });
  }
});
