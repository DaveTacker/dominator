interface ImmediateCheckResults {
  isHttps: boolean;
  cookieCount: number;
  externalScripts: number;
  inlineScripts: number;
  passwordFields: number;
  iframes: number;
  totalElements: number;
  hasH1: boolean;
  imagesWithoutAlt: number;
  hasLanguageAttribute: boolean;
  hasViewportMeta: boolean;
  hasAnalytics: boolean;
  consoleErrors: number;
  hasMixedContent: boolean;
  insecureForms: number;
}

function init(): void {
  let apiEnabled = false;

  // Get the API enabled status from storage
  chrome.storage.sync.get(['apiEnabled'], (options) => {
    apiEnabled = options.apiEnabled;
  });

  performImmediateChecks();

  // Send the DOM to the background script for analysis
  if (apiEnabled) {
    chrome.runtime.sendMessage({
      action: 'analysisWorking',
    });
    chrome.runtime.sendMessage({
      action: 'analyzeDom',
      dom: document.documentElement.outerHTML,
    });
  }
}

/**
 * Performs immediate checks on the current web page and sends the results back to the background script.
 */
function performImmediateChecks(): void {
  const results: ImmediateCheckResults = {
    isHttps: window.location.protocol === 'https:',
    cookieCount: document.cookie.split(';').length,
    externalScripts: document.querySelectorAll('script[src^="http"]').length,
    inlineScripts: document.querySelectorAll('script:not([src])').length,
    passwordFields: document.querySelectorAll('input[type="password"]').length,
    iframes: document.querySelectorAll('iframe').length,
    totalElements: document.getElementsByTagName('*').length,
    hasH1: document.querySelector('h1') !== null,
    imagesWithoutAlt: document.querySelectorAll('img:not([alt])').length,
    hasLanguageAttribute: document.documentElement.hasAttribute('lang'),
    hasViewportMeta: document.querySelector('meta[name="viewport"]') !== null,
    hasAnalytics: document.querySelector('script[src*="analytics"]') !== null,
    consoleErrors: 0,
    hasMixedContent: false,
    insecureForms: 0,
  };

  results.hasMixedContent = Array.from(document.querySelectorAll('link, script, img, iframe')).some((el) => {
    if (el instanceof HTMLScriptElement || el instanceof HTMLImageElement || el instanceof HTMLIFrameElement) {
      return el.src && el.src.startsWith('http:');
    }
    if (el instanceof HTMLLinkElement) {
      return el.href && el.href.startsWith('http:');
    }
    return false;
  });

  const forms = document.forms;

  try {
    results.insecureForms = Array.from(forms).filter((form) => form.action && form.action.startsWith('http:')).length;
  } catch {
    results.insecureForms = 0;
  }

  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    results.consoleErrors++;
    originalConsoleError.apply(console, args);
  };

  // console.log(results);

  // Send the results back to the background script
  chrome.runtime.sendMessage({ action: 'immediateCheckResults', results, location: window.location });
}

// Initialize the content script when the page has finished loading
if (document.readyState === 'complete') {
  init();
}
// If the document is still loading, wait for the load event
else {
  window.addEventListener('load', init);
}


chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === 'analyzeDom') {
    chrome.runtime.sendMessage({
      action: 'analyzeDom',
      dom: document.documentElement.outerHTML,
      location: window.location
    });
  }
});
