/**
 * Main entry point — orchestrates app initialization (standalone page shell).
 */

import { DOM } from './dom.js';
import { State } from './state.js';
import { UI } from './ui.js';
import { Emulator } from './emulator.js';
import { Input } from './input.js';
import { Keybinds } from './keybinds.js';
import { scanROMs } from './romScanner.js';
import {
  startMenuMusic,
  stopMenuMusic,
  syncAudioVolume,
} from './audio.js';
import { initShellHelp } from './shellHelp.js';

/** Soft floor so the spinner is readable, not a one-frame flash. */
const BOOT_MIN_MS = 720;
const BOOT_FADE_MS = 420;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDevEnvironment() {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || window.location.protocol === 'file:';
}

function setupDevChromeToggle() {
  if (!isDevEnvironment()) return;

  window.addEventListener('keydown', (e) => {
    const target = e.target;
    const isTypingTarget =
      target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (isTypingTarget) return;

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      document.body.classList.toggle('dev-chrome-hidden');
    }

    if (e.ctrlKey && e.shiftKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      document.body.classList.toggle('bg-cutting-mat');
    }
  });
}

async function hideGameboyLoader() {
  const loader = document.getElementById('app-shell-loader');
  document.body.classList.remove('app-loading');
  if (!loader) return;
  loader.classList.add('is-hidden');
  await wait(BOOT_FADE_MS);
  loader.remove();
}

async function bootstrap() {
  const bootStartedAt = performance.now();

  if (typeof window.__resetPageScale === 'function') {
    window.__resetPageScale();
  }

  setupDevChromeToggle();

  UI.preloadAvatars();

  DOM.init();
  DOM.mountContainers();
  State.init();
  UI.init();
  Emulator.init();
  Input.init();
  Keybinds.init();
  initShellHelp();
  const roms = await scanROMs();
  State.set('romList', roms);

  State.on('currentMode', (mode) => {
    if (mode === 'rom') stopMenuMusic();
    else if (mode === 'menu') startMenuMusic();
  });

  State.on('currentVolume', (vol, prevVol) => {
    if (vol === 0) {
      stopMenuMusic();
    } else if (prevVol === 0 && State.get('currentMode') === 'menu') {
      startMenuMusic();
    } else {
      syncAudioVolume(vol);
    }
  });

  const remaining = Math.max(0, BOOT_MIN_MS - (performance.now() - bootStartedAt));
  await wait(remaining);

  // Mount sound prompt while device is still hidden so main menu never flashes first.
  UI.openSoundOverlay();
  await hideGameboyLoader();
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  document.body.classList.remove('app-loading');
});
