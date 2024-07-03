chrome.action.onClicked.addListener((tab) => {
  console.log(tab);
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleCharacter' });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  // console.error(request.action);

  if (request.action === 'analyzeDom') {
    chrome.storage.sync.get(['apiUrl', 'apiKey', 'model'], function (items) {
      fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Url': items.apiUrl || '',
          'X-API-Key': items.apiKey || '',
          'X-Model': items.model || 'gpt-3.5-turbo',
        },
        body: JSON.stringify({ dom: request.dom }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.analysis) {
            chrome.storage.local.set({ latestAnalysis: {data, request} });

            // Save the analysis to history
            chrome.storage.local.get(['latestAnalysis', 'analysisHistory'], (history) => {
              console.log(history);
              const { latestAnalysis, analysisHistory } = history;
              const updatedHistory = analysisHistory ? [...analysisHistory, latestAnalysis] : [latestAnalysis];
              chrome.storage.local.set({ analysisHistory: updatedHistory });
            });

            // Send the latest analysis results to the popup and the hero
            chrome.runtime.sendMessage({ action: 'latestAnalysisResults', data });
          }
        })
        .catch((error) => console.error('Error:', error));
    });
  } else if (request.action === 'immediateCheckResults') {
    const results = request.results;

    let issues: string[] = [];
    if (!results.isHttps) issues.push('Page is not served over HTTPS.');
    if (results.hasMixedContent) issues.push('Page has mixed content.');
    if (results.inlineScripts > 0) issues.push(`Page has ${results.inlineScripts} inline scripts.`);
    if (results.insecureForms > 0) issues.push(`Page has ${results.insecureForms} insecure forms.`);
    if (results.imagesWithoutAlt > 0) issues.push(`${results.imagesWithoutAlt} images are missing alt text.`);
    if (!results.hasLanguageAttribute) issues.push('Page is missing language attribute.');
    if (!results.hasViewportMeta) issues.push('Page is missing viewport meta tag.');
    if (results.consoleErrors > 0) issues.push(`Page has ${results.consoleErrors} console errors.`);

    let report = issues.length > 0 ? issues.join('\n ') : 'Great news! This page looks super secure and well-structured!';

    chrome.storage.local.set({ immediateCheck: { report, issues, request } });
    chrome.action.setBadgeText({ text: issues.length.toString() });
    chrome.action.setBadgeBackgroundColor({ color: issues.length > 0 ? '#f00' : '#0f0' });

    // Add latest report to history
    chrome.storage.local.get(['immediateCheck', 'immediateCheckHistory'], (history) => {
      console.log(history);
      const { immediateCheck, immediateCheckHistory } = history;
      const updatedHistory = immediateCheckHistory ? [...immediateCheckHistory, immediateCheck] : [immediateCheck];
      chrome.storage.local.set({ immediateCheckHistory: updatedHistory });
    });
  }
});
