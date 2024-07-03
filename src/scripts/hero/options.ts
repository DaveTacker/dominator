export interface Options {
  heroEnabled: boolean;
  speed: 'slow' | 'normal' | 'fast';
  jumpHeight: 'low' | 'normal' | 'high';
  friction: number;
  gravity: number;
}

export const options: Options = {
  heroEnabled: false,
  speed: 'normal',
  jumpHeight: 'normal',
  friction: 0.92,
  gravity: 0.5,
};

/**
 * Loads the options from the Chrome storage and applies them.
 */
export function loadOptions(): Options {
  chrome.storage.sync.get(['heroEnabled', 'speed', 'jumpHeight'], function (items: { heroEnabled?: Options['heroEnabled']; speed?: Options['speed']; jumpHeight?: Options['jumpHeight'] }) {
    options.heroEnabled = items.heroEnabled || false;
    options.speed = items.speed || 'normal';
    options.jumpHeight = items.jumpHeight || 'normal';
    console.log(options);
    applyOptions();
  });

  return options;
}

/**
 * Applies the selected options to the hero.
 */
export function applyOptions(): void {
  // Apply speed
  switch (options.speed) {
    case 'slow':
      options.friction = 0.95;
      break;
    case 'normal':
      options.friction = 0.92;
      break;
    case 'fast':
      options.friction = 0.88;
      break;
  }

  // Apply jump height
  switch (options.jumpHeight) {
    case 'low':
      options.gravity = 0.7;
      break;
    case 'normal':
      options.gravity = 0.5;
      break;
    case 'high':
      options.gravity = 0.3;
      break;
  }
}
