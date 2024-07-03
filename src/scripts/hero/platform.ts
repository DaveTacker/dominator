const MIN_PLATFORM_WIDTH = 100;
const MIN_PLATFORM_HEIGHT = 20;

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

function isElementVisible(element: Element): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && (element instanceof HTMLElement ? element.offsetWidth > 0 && element.offsetHeight > 0 : true);
}

function hasVisibleBorder(element: Element): boolean {
  const style = window.getComputedStyle(element);
  return parseInt(style.borderWidth) > 0 && style.borderStyle !== 'none' && style.borderColor !== 'transparent';
}

function hasVisibleBackground(element: Element): boolean {
  const style = window.getComputedStyle(element);
  return style.backgroundColor !== 'transparent' && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
}

/**
 * Detects visible platforms on the page.
 * @returns {Platform[]} An array of Platform objects representing the detected platforms.
 */
export function detectPlatforms(): Platform[] {
  const platforms = [];
  const elements = document.body.getElementsByTagName('*');
  for (let element of elements) {
    if (!isElementVisible(element)) continue;

    const rect = element.getBoundingClientRect();
    if (rect.width >= MIN_PLATFORM_WIDTH && rect.height >= MIN_PLATFORM_HEIGHT) {
      if (hasVisibleBorder(element) || hasVisibleBackground(element)) {
        platforms.push({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        });
      }
    }
  }

  console.log('Detected visible platforms:', platforms.length);
  return platforms;
}

/**
 * Checks if the character is on any of the given platforms.
 * @param {HTMLElement} character - The HTMLElement representing the character.
 * @param {Platform[]} platforms - An array of Platform objects representing the platforms.
 * @returns {boolean} A boolean indicating whether the character is on a platform.
 */
export function isOnPlatform(character: HTMLElement, platforms: Platform[]): boolean {
  const charRect = character.getBoundingClientRect();
  for (let platform of platforms) {
    if (charRect.bottom >= platform.y && charRect.bottom <= platform.y + 5 && charRect.right > platform.x && charRect.left < platform.x + platform.width) {
      return true;
    }
  }
  return false;
}
