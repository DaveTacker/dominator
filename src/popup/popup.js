document.addEventListener('DOMContentLoaded', function () {
  // Toggle character when button is clicked
  document.getElementById('toggleCharacter').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleCharacter' });
    });
  });
  document.getElementById('analyzeDom').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeDom' });
    });
  });

  chrome.storage.local.get(['latestReport'], function (result) {
    const reportDiv = document.getElementById('report');
    if (result.latestReport && result.latestReport.analysis) {
      reportDiv.innerHTML = `<h2>Analysis Report</h2><p>${result.latestReport.analysis}</p>`;
    } else {
      reportDiv.innerHTML = '<p>No issues found. This page looks good!</p>';
    }
  });

  document.getElementById('optionsBtn').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
  });
});
