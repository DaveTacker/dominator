document.addEventListener('DOMContentLoaded', function () {
  // Load saved character options
  chrome.storage.sync.get(['speed', 'jumpHeight'], function (items) {
    document.getElementById('speed').value = items.speed || 'normal';
    document.getElementById('jumpHeight').value = items.jumpHeight || 'normal';
  });

  // Save options when apply button is clicked
  document.getElementById('characterForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let speed = document.getElementById('speed').value;
    let jumpHeight = document.getElementById('jumpHeight').value;

    chrome.storage.sync.set(
      {
        speed: speed,
        jumpHeight: jumpHeight,
      },
      function () {
        alert('Character options saved!');
      },
    );
  });

  // Load saved API options
  chrome.storage.sync.get(['apiUrl', 'apiKey', 'model'], function (items) {
    document.getElementById('apiUrl').value = items.apiUrl || 'https://api.openai.com/v1/chat/completions';
    document.getElementById('apiKey').value = items.apiKey || '';
    document.getElementById('model').value = items.model || 'gpt-3.5-turbo';
  });

  document.getElementById('apiForm').addEventListener('submit', function (e) {
    e.preventDefault();
    chrome.storage.sync.set(
      {
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('model').value,
      },
      function () {
        alert('API settings saved!');
      },
    );
  });
});
