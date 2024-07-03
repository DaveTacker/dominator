import { drag, endDrag, handleScroll, moveCharacter, setCharacter, startAnimationCycle, startDrag, updatePosition } from './hero/animate';
import { loadOptions, options } from './hero/options';

let speech_bubble: HTMLElement | null = null;
let character: HTMLElement | null = null;
const groundLevel = window.innerHeight - 128; // Character is 128px tall
let animationInterval: number;

function createCharacter(): void {
  // console.log(character);
  let options = loadOptions();
  // console.log(options);
  if (!options.heroEnabled) return;

  if (character) {
    console.log('Character already exists');
    return;
  }

  console.log('Creating character...');
  character = document.createElement('div');
  character.id = 'pixel-art-character';
  document.body.appendChild(character);
  setCharacter(character);

  speech_bubble = document.createElement('div');
  speech_bubble.id = 'speech-bubble';
  character.appendChild(speech_bubble);

  console.log('Character element created:', character);
  // console.log('Character dimensions:', character.offsetWidth, character.offsetHeight);
  // console.log('Character position:', character.style.left, character.style.top);

  character.addEventListener('mousedown', startDrag);
  character.addEventListener('touchstart', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  animationInterval = startAnimationCycle();
  moveCharacter(100, groundLevel);
  updatePosition();

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
}

function removeCharacter(): void {
  if (!character) {
    console.error('Character element not found');
    return;
  }

  if (character) {
    document.body.removeChild(character);
    character = null;

    // Remove scroll event listener
    window.removeEventListener('scroll', handleScroll);
  }

  // Clear animation interval
  clearInterval(animationInterval);
  console.info('Character removed!');
}

chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log(request);

  if (request.action === 'toggleCharacter') {
    if (character) {
      removeCharacter();
    } else {
      createCharacter();
    }
  } else if (request.action === 'latestAnalysisResults') {
    console.log('request.data:', request.data);
    if (speech_bubble) {
      speech_bubble.style.setProperty('display', 'block');
      speech_bubble.textContent = request.data?.analysis?.message?.content;

      setTimeout(() => {
        speech_bubble?.style.setProperty('display', 'none');
      }, 5000);
    }
  }
});
