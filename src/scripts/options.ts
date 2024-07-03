import * as bootstrap from 'bootstrap';

/**
 * Displays JSON data in a specified element by creating child elements.
 *
 * @param {string} elementId - The ID of the DOM element where the JSON will be displayed.
 * @param {any} jsonData - The JSON data to display.
 */
function displayJsonInElement(elementId: string, jsonData: any): void {
  const element = document.getElementById(elementId) as HTMLDivElement | null;
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  // Clear existing content
  element.innerHTML = '';

  // Convert JSON data to a readable string
  const formattedJson = JSON.stringify(jsonData, null, 2);

  // Create a pre element to display formatted JSON
  const pre = document.createElement('pre');

  // Insert formatted JSON into the pre element
  pre.textContent = formattedJson;

  // Append the pre element to the target element
  element.appendChild(pre);
}

document.addEventListener('DOMContentLoaded', () => {
  const toastLiveExample = document.getElementById('liveToast');
  const apiForm = document.getElementById('apiForm');
  const heroForm = document.getElementById('heroForm');

  // Load saved options
  chrome.storage.sync.get(['apiEnabled', 'apiUrl', 'apiKey', 'model', 'heroEnabled', 'speed', 'jumpHeight'], (items) => {
    // console.log(items);

    const apiEnabledInput = document.getElementById('apiEnabled') as HTMLInputElement;
    const apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const modelInput = document.getElementById('model') as HTMLInputElement;
    const heroEnabledInput = document.getElementById('heroEnabled') as HTMLInputElement;
    const speedInput = document.getElementById('speed') as HTMLInputElement;
    const jumpHeightInput = document.getElementById('jumpHeight') as HTMLInputElement;

    if (apiEnabledInput) apiEnabledInput.checked = items.apiEnabled || false;
    if (apiUrlInput) apiUrlInput.value = items.apiUrl || '';
    if (apiKeyInput) apiKeyInput.value = items.apiKey || '';
    if (modelInput) modelInput.value = items.model || 'gpt-3.5-turbo';
    if (heroEnabledInput) heroEnabledInput.checked = items.heroEnabled || false;
    if (speedInput) speedInput.value = items.speed || 'normal';
    if (jumpHeightInput) jumpHeightInput.value = items.jumpHeight || 'normal';
  });

  // Load history
  chrome.storage.local.get(['immediateCheck', 'immediateCheckHistory', 'latestAnalysis', 'analysisHistory'], (data) => {
    const { immediateCheck, immediateCheckHistory, latestAnalysis, analysisHistory } = data;
    // console.log(data);

    if (immediateCheckHistory) {
      displayJsonInElement('immediateCheckHistory', immediateCheck);
      displayJsonInElement('immediateCheckHistory', immediateCheckHistory);
    }

    if (analysisHistory) {
      displayJsonInElement('analysisHistory', latestAnalysis);
      displayJsonInElement('analysisHistory', analysisHistory);
    }
  });

  // Save options
  if (apiForm) {
    apiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const apiEnabled = (document.getElementById('apiEnabled') as HTMLInputElement).checked;
      const apiUrl = (document.getElementById('apiUrl') as HTMLInputElement).value;
      const apiKey = (document.getElementById('apiKey') as HTMLInputElement).value;
      const model = (document.getElementById('model') as HTMLInputElement).value;

      chrome.storage.sync.set({ apiEnabled, apiUrl, apiKey, model }, () => {
        if (toastLiveExample) {
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
          toastBootstrap?.show();
        }
      });
    });
  }

  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const heroEnabled = (document.getElementById('heroEnabled') as HTMLInputElement).checked;
      const speed = (document.getElementById('speed') as HTMLInputElement).value;
      const jumpHeight = (document.getElementById('jumpHeight') as HTMLInputElement).value;

      chrome.storage.sync.set({ heroEnabled, speed, jumpHeight }, () => {
        if (toastLiveExample) {
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
          toastBootstrap?.show();
        }
      });
    });
  }
});
