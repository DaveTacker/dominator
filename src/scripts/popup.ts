document.addEventListener('DOMContentLoaded', () => {
  const toggleCharacterButton = document.getElementById('toggleCharacter') as HTMLButtonElement | null;
  const analyzeDomButton = document.getElementById('analyzeDom') as HTMLButtonElement | null;
  const latestAnalysisElement = document.getElementById('latestAnalysis') as HTMLParagraphElement | null;
  const immediateCheckElement = document.getElementById('immediateCheck') as HTMLParagraphElement | null;

  chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log(request);
    // console.log(sender);
    // console.log(character);
    // console.log(options);

    if (request.action === 'analysisWorking') {
      if (latestAnalysisElement) {
        latestAnalysisElement.classList.add('ellipsis');
      }
    }
  });

  // Reset badge text
  chrome.action.setBadgeText({ text: '' });

  // Load latest analysis and immediate check results
  chrome.storage.sync.get(['heroEnabled'], (latest) => {
    if (!latest.heroEnabled && toggleCharacterButton) {
      toggleCharacterButton.disabled = true;
    }
  });

  // Load latest analysis and immediate check results
  chrome.storage.local.get(['latestAnalysis', 'immediateCheck'], (latest) => {
    console.log(latest);

    const { latestAnalysis, immediateCheck } = latest;

    if (latestAnalysisElement && immediateCheckElement) {
      if (latestAnalysis) {
        latestAnalysisElement.classList.remove('ellipsis');
        latestAnalysisElement.textContent = latestAnalysis.data?.analysis?.message?.content;
      }

      if (immediateCheck) {
        immediateCheckElement.textContent = immediateCheck.report;
      }
    }
  });

  // Toggle character when button is clicked
  toggleCharacterButton?.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].id) chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleCharacter' });
    });
  });

  // Analyze DOM when button is clicked
  analyzeDomButton?.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log(tabs);
      if (tabs[0].id) {
        // chrome.tabs.sendMessage(tabs[0].id, { action: 'analysisWorking' });
        chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeDom', title: tabs[0].title, url: tabs[0].url });
      }
    });
  });
});
