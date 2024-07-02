
function loadOptions() {
  chrome.storage.sync.get(["speed", "jumpHeight"], function (items) {
    options.speed = items.speed || "normal";
    options.jumpHeight = items.jumpHeight || "normal";
    console.log(options);
    applyOptions();
  });
}

function applyOptions() {
  // Apply speed
  switch (options.speed) {
    case "slow":
      friction = 0.95;
      break;
    case "normal":
      friction = 0.92;
      break;
    case "fast":
      friction = 0.88;
      break;
  }

  // Apply jump height
  switch (options.jumpHeight) {
    case "low":
      gravity = 0.7;
      break;
    case "normal":
      gravity = 0.5;
      break;
    case "high":
      gravity = 0.3;
      break;
  }
}

window.loadOptions = loadOptions;
window.applyOptions = applyOptions;
