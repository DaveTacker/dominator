let character;
let isDragging = false;
let dragOffsetX, dragOffsetY;
let positionX = 100,
  positionY = 100;
let previousX = 100;
let velocityX = 0;
let velocityY = 0;
let gravity = 0.5;
let friction = 0.92;
let bounce = 0.8;
let isOnGround = false;
let currentAnimation = 'idle';
let animationFrame = 0;
let animationTimer = 0;
const ANIMATION_SPEED = 150; // milliseconds per frame
const groundLevel = window.innerHeight - 128; // Character is 128px tall

let walkCycle = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6', 'walk7'];
let runCycle = ['run0', 'run1', 'run2'];
let currentWalkIndex = 0;
let currentRunIndex = 0;
let animationInterval;

let options = {
  speed: 'normal',
  jumpHeight: 'normal',
};

let isScrolling = false;
let scrollTimeout;

function handleScroll() {
  isScrolling = true;
  clearTimeout(scrollTimeout);

  // Adjust character position to stay in viewport
  const viewportBottom = window.innerHeight;
  if (positionY > viewportBottom - character.offsetHeight) {
    moveCharacter(positionX, viewportBottom - character.offsetHeight);
  }

  // Make the character fall if it's not at the bottom
  if (positionY < viewportBottom - character.offsetHeight) {
    isOnGround = false;
    velocityY = 10; // Adjust this value to control fall speed
  }

  // Reset isScrolling after a short delay
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 100);

  // Redetect platforms after scrolling
  platforms = detectPlatforms();
}

function createCharacter() {
  console.log('Creating character');
  if (character) {
    console.log('Character already exists');
    return;
  }

  character = document.createElement('div');
  character.id = 'pixel-art-character';
  document.body.appendChild(character);

  speech_bubble = document.createElement('div');
  speech_bubble.id = 'speech-bubble';
  character.appendChild(speech_bubble);
  report = document.createElement('p');
  report.id = 'report';
  speech_bubble.appendChild(report);

  console.log('Character element created:', character);
  console.log('Character dimensions:', character.offsetWidth, character.offsetHeight);
  console.log('Character position:', character.style.left, character.style.top);

  character.addEventListener('mousedown', startDrag);
  character.addEventListener('touchstart', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  platforms = detectPlatforms();
  moveCharacter(100, groundLevel);
  updatePosition();
  startAnimationCycle();
  loadOptions();

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
}

function removeCharacter() {
  console.log(character);
  if (character) {
    document.body.removeChild(character);
    character = null;

    // Remove scroll event listener
    window.removeEventListener('scroll', handleScroll);
  }
  clearInterval(animationInterval);
}

function moveCharacter(x, y) {
  previousX = positionX;
  positionX = x;
  positionY = y;
  character.style.left = `${x}px`;
  character.style.top = `${y}px`; // No need to adjust for scroll here
  updateCharacterDirection();
}

function updateCharacterDirection() {
  if (positionX < previousX) {
    character.classList.add('flip');
  } else if (positionX > previousX) {
    character.classList.remove('flip');
  }
}

function updateAnimation() {
  if (!character) {
    console.log("Character doesn't exist in updateAnimation");
    return;
  }

  const now = Date.now();
  if (now - animationTimer > ANIMATION_SPEED) {
    animationTimer = now;
    animationFrame++;
  }

  let newAnimation;
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

function startAnimationCycle() {
  animationInterval = setInterval(() => {
    if (Math.abs(velocityX) > 5) {
      currentRunIndex = (currentRunIndex + 1) % runCycle.length;
    } else if (Math.abs(velocityX) > 0.5) {
      currentWalkIndex = (currentWalkIndex + 1) % walkCycle.length;
    }
  }, 100);
}

function updatePosition() {
  if (!character) {
    console.log("Character doesn't exist in updatePosition");
    return;
  }

  if (!isDragging) {
    let newX = positionX + velocityX;
    let newY = positionY + velocityY;

    if (!isScrolling) {
      if (isOnPlatform(character) || newY + character.offsetHeight >= window.innerHeight) {
        isOnGround = true;
        velocityY = 0;
        if (newY + character.offsetHeight > window.innerHeight) {
          newY = window.innerHeight - character.offsetHeight;
        }
      } else {
        isOnGround = false;
        velocityY += gravity;
      }
    }

    velocityX *= friction;

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

function startDrag(e) {
  isDragging = true;
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  dragOffsetX = clientX - positionX;
  dragOffsetY = clientY - positionY;
  velocityX = 0;
  velocityY = 0;
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    moveCharacter(clientX - dragOffsetX, clientY - dragOffsetY);
  }
}

function endDrag() {
  isDragging = false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  console.log(sender);
  console.log(character);
  console.log(options);
  // console.log(sendResponse);

  if (request.action === 'toggleCharacter') {
    if (character) {
      removeCharacter();
    } else {
      loadOptions();
      createCharacter();
    }
  } else if (request.action === 'updateOptions') {
    options = request.options;
    applyOptions();
  }
});

// At the end of the file, add this:
// window.addEventListener('load', () => {
//   console.log('Window loaded, creating character');
//   loadOptions();
//   createCharacter();
// });

// Re-detect platforms on window resize
window.addEventListener('resize', () => {
  platforms = detectPlatforms();
});
