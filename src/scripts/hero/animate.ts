import { options } from './options';
import { Platform, detectPlatforms, isOnPlatform } from './platform';

const ANIMATION_SPEED = 150; // milliseconds per frame

let isDragging = false;
let velocityX = 0;
let velocityY = 0;
let bounce = 0.8;
let isOnGround = false;
let currentAnimation = 'idle';
let animationFrame = 0;
let animationTimer = 0;
let platforms: Platform[] = [];
let walkCycle = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6', 'walk7'];
let runCycle = ['run0', 'run1', 'run2'];
let currentWalkIndex = 0;
let currentRunIndex = 0;
let positionX = 100;
let positionY = 100;
let previousX = 100;
let isScrolling = false;
let scrollTimeout: number;
let dragOffsetX: number;
let dragOffsetY: number;
let character: HTMLElement | null = null;

function updateAnimation(): void {
  if (!character) {
    console.error('Character element not found');
    return;
  }

  const now = Date.now();
  if (now - animationTimer > ANIMATION_SPEED) {
    animationTimer = now;
    animationFrame++;
  }

  let newAnimation: string;
  if (isDragging) {
    newAnimation = 'drag';
  } else if (!isOnGround && velocityY > 0.5) {
    newAnimation = 'fall';
  } else if (!isOnGround && velocityY < -0.5) {
    newAnimation = 'jump';
  } else if (Math.abs(velocityX) > 5) {
    newAnimation = 'run' + (animationFrame % 3);
  } else if (Math.abs(velocityX) > 0.5) {
    newAnimation = 'walk' + (animationFrame % 8);
  } else {
    newAnimation = 'idle';
  }

  // Only update the class if the animation has changed
  if (newAnimation !== currentAnimation) {
    character.classList.remove(currentAnimation);
    character.classList.add(newAnimation);
    currentAnimation = newAnimation;
  }

  // Handle flipping separately
  if (velocityX < -0.1) {
    character.classList.add('flip');
  } else if (velocityX > 0.1) {
    character.classList.remove('flip');
  }
}

export function startAnimationCycle(): number {
  platforms = detectPlatforms();

  return window.setInterval(() => {
    if (Math.abs(velocityX) > 5) {
      currentRunIndex = (currentRunIndex + 1) % runCycle.length;
    } else if (Math.abs(velocityX) > 0.5) {
      currentWalkIndex = (currentWalkIndex + 1) % walkCycle.length;
    }
  }, 100);
}

export function updatePosition(): void {
  if (!character) {
    console.error('Character element not found');
    return;
  }

  if (!isDragging) {
    let newX = positionX + velocityX;
    let newY = positionY + velocityY;

    if (!isScrolling) {
      if (isOnPlatform(character, platforms) || newY + character.offsetHeight >= window.innerHeight) {
        isOnGround = true;
        velocityY = 0;
        if (newY + character.offsetHeight > window.innerHeight) {
          newY = window.innerHeight - character.offsetHeight;
        }
      } else {
        isOnGround = false;
        velocityY += options.gravity;
      }
    }

    velocityX *= options.friction;

    // Collision detection with platforms
    for (let platform of platforms) {
      const adjustedPlatformY = platform.y - window.scrollY;
      if (newX + character.offsetWidth > platform.x && newX < platform.x + platform.width && newY + character.offsetHeight > adjustedPlatformY && newY < adjustedPlatformY + platform.height) {
        // Collision detected, adjust position
        if (positionX + character.offsetWidth <= platform.x) {
          newX = platform.x - character.offsetWidth;
          velocityX = -velocityX * bounce;
        } else if (positionX >= platform.x + platform.width) {
          newX = platform.x + platform.width;
          velocityX = -velocityX * bounce;
        }
        if (positionY + character.offsetHeight <= adjustedPlatformY) {
          newY = adjustedPlatformY - character.offsetHeight;
          velocityY = 0;
          isOnGround = true;
        } else if (positionY >= adjustedPlatformY + platform.height) {
          newY = adjustedPlatformY + platform.height;
          velocityY = -velocityY * bounce;
        }
      }
    }

    // Screen boundaries
    if (newX < 0 || newX + character.offsetWidth > window.innerWidth) {
      velocityX *= -bounce;
      newX = newX < 0 ? 0 : window.innerWidth - character.offsetWidth;
    }

    // Bottom boundary (adjust for viewport)
    if (newY + character.offsetHeight > window.innerHeight) {
      newY = window.innerHeight - character.offsetHeight;
      velocityY = 0;
      isOnGround = true;
    }

    // Top boundary (prevent going above viewport)
    if (newY < 0) {
      newY = 0;
      velocityY = 0;
    }

    moveCharacter(newX, newY);

    if (isOnGround && !isScrolling) {
      if (Math.random() < 0.02) {
        velocityY = -12; // Jump
        isOnGround = false;
      } else if (Math.random() < 0.05) {
        velocityX += (Math.random() - 0.5) * 3;
      }
    }
  }

  updateAnimation();
  requestAnimationFrame(updatePosition);
}

export function handleScroll(): void {
  if (!character) {
    console.error('Character element not found');
    return;
  }

  isScrolling = true;
  clearTimeout(scrollTimeout);

  // Adjust character position to stay in viewport
  const viewportBottom = window.innerHeight;
  if (character && positionY > viewportBottom - character.offsetHeight) {
    moveCharacter(positionX, viewportBottom - character.offsetHeight);
  }

  // Make the character fall if it's not at the bottom
  if (character && positionY < viewportBottom - character.offsetHeight) {
    isOnGround = false;
    velocityY = 10; // Adjust this value to control fall speed
  }

  // Reset isScrolling after a short delay
  scrollTimeout = window.setTimeout(() => {
    isScrolling = false;
  }, 100);

  // Redetect platforms after scrolling
  platforms = detectPlatforms();
}

export function startDrag(e: MouseEvent | TouchEvent): void {
  isDragging = true;
  const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
  const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
  dragOffsetX = clientX - positionX;
  dragOffsetY = clientY - positionY;
  velocityX = 0;
  velocityY = 0;
}

export function drag(e: MouseEvent | TouchEvent): void {
  if (isDragging) {
    e.preventDefault();
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    moveCharacter(clientX - dragOffsetX, clientY - dragOffsetY);
  }
}

export function endDrag(): void {
  isDragging = false;
}

export function setCharacter(characterElement: HTMLElement): void {
  character = characterElement;
}

export function moveCharacter(x: number, y: number): void {
  if (!character) {
    console.error('Character element not found');
    return;
  }

  previousX = positionX;
  positionX = x;
  positionY = y;
  character.style.left = `${x}px`;
  character.style.top = `${y}px`; // No need to adjust for scroll here
  updateCharacterDirection();
}

function updateCharacterDirection(): void {
  if (!character) {
    console.error('Character element not found');
    return;
  }

  if (positionX < previousX) {
    character.classList.add('flip');
  } else if (positionX > previousX) {
    character.classList.remove('flip');
  }
}

// Re-detect platforms on window resize
window.addEventListener('resize', () => {
  platforms = detectPlatforms();
});
