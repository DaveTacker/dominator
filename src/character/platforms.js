const MIN_PLATFORM_WIDTH = 100;
const MIN_PLATFORM_HEIGHT = 20;
let platforms = [];

/**
 * Checks if an element is visible on the screen.
 *
 * @param {Element} element - The element to check visibility for.
 * @returns {boolean} Returns true if the element is visible, false otherwise.
 */
function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}

/**
 * Checks if an element has a visible border.
 *
 * @param {Element} element - The element to check.
 * @returns {boolean} - Returns true if the element has a visible border, false otherwise.
 */
function hasVisibleBorder(element) {
  const style = window.getComputedStyle(element);
  return (
    parseInt(style.borderWidth) > 0 &&
    style.borderStyle !== "none" &&
    style.borderColor !== "transparent"
  );
}

/**
 * Checks if the given element has a visible background.
 *
 * @param {Element} element - The element to check.
 * @returns {boolean} Returns true if the element has a visible background, false otherwise.
 */
function hasVisibleBackground(element) {
  const style = window.getComputedStyle(element);
  return (
    style.backgroundColor !== "transparent" &&
    style.backgroundColor !== "rgba(0, 0, 0, 0)"
  );
}

/**
 * Detects visible platforms on the page.
 * @returns {Array} An array of platform objects containing x, y, width, and height properties.
 */
function detectPlatforms() {
  platforms = [];
  const elements = document.body.getElementsByTagName("*");
  for (let element of elements) {
    if (!isElementVisible(element)) continue;

    const rect = element.getBoundingClientRect();
    if (
      rect.width >= MIN_PLATFORM_WIDTH &&
      rect.height >= MIN_PLATFORM_HEIGHT
    ) {
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

  console.log("Detected visible platforms:", platforms.length);
  return platforms;
}

/**
 * Checks if the character is on a platform.
 * @param {Element} character - The character element.
 * @returns {boolean} True if the character is on a platform, false otherwise.
 */
function isOnPlatform(character) {
  if (!character) return false;
  const charRect = character.getBoundingClientRect();
  for (let platform of platforms) {
    if (
      charRect.bottom >= platform.y &&
      charRect.bottom <= platform.y + 5 &&
      charRect.right > platform.x &&
      charRect.left < platform.x + platform.width
    ) {
      return true;
    }
  }
  return false;
}

// export { platforms, detectPlatforms, isOnPlatform };

window.platforms = platforms;
window.detectPlatforms = detectPlatforms;
window.isOnPlatform = isOnPlatform;
