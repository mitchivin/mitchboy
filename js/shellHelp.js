/**
 * Floating top-left help / controls chrome for the standalone page shell.
 */

import { UI } from './ui.js';
import { isMobileDevice } from './device.js';

export const LINK_CONFIRMS = {
  doodledev: {
    url: 'https://doodledev.app',
    message: 'Opens DoodleDev in a new tab. This device is available in the Preset menu.',
  },
  github: {
    url: 'https://github.com/mitchivin',
    message: "Opens Mitch's Github in a new tab.",
  },
  githubRepo: {
    url: 'https://github.com/mitchivin/mitchboy',
    message: 'Opens the Mitch Boy Color GitHub repo in a new tab.',
  },
  instagram: {
    url: 'https://www.instagram.com/mitchivin/',
    message: "Opens Mitch's Instagram in a new tab.",
  },
  linkedin: {
    url: 'https://www.linkedin.com/in/mitchivin/',
    message: "Opens Mitch's LinkedIn in a new tab.",
  },
  author: {
    url: 'https://mitchivin.com/',
    message: "Opens Mitch's Portfolio in a new tab.",
  },
};

let showConfirmFn = null;

/** Shared confirm dialog used by the top-left menu and Extras. */
export function confirmExternalLink(config) {
  if (showConfirmFn) {
    showConfirmFn(config);
    return;
  }
  if (config?.url) window.open(config.url, '_blank', 'noopener,noreferrer');
}

const KEYS_GREEN = '#00ff66';
const KEYS_GREEN_HOVER = '#66ff99';

function paintKeysAccent(button, color) {
  if (!button) return;
  const icon = button.querySelector('.shell-help-icon');
  const label = button.querySelector('.shell-help-label');
  button.style.setProperty('color', color, 'important');
  button.style.setProperty('-webkit-text-fill-color', color, 'important');
  if (icon) {
    icon.style.setProperty('color', color, 'important');
    icon.style.setProperty('-webkit-text-fill-color', color, 'important');
    icon.style.setProperty('opacity', '1', 'important');
  }
  if (label) {
    label.style.setProperty('color', color, 'important');
    label.style.setProperty('-webkit-text-fill-color', color, 'important');
  }
}

function clearKeysAccent(button) {
  if (!button) return;
  const icon = button.querySelector('.shell-help-icon');
  const label = button.querySelector('.shell-help-label');
  button.style.removeProperty('color');
  button.style.removeProperty('-webkit-text-fill-color');
  if (icon) {
    icon.style.removeProperty('color');
    icon.style.removeProperty('-webkit-text-fill-color');
    icon.style.removeProperty('opacity');
  }
  if (label) {
    label.style.removeProperty('color');
    label.style.removeProperty('-webkit-text-fill-color');
  }
}

function syncKeysLabel(button) {
  if (!button) return;
  const on = !!UI.isKeysModeEnabled;
  const hovering = button.matches(':hover');
  button.classList.toggle('is-active', on);
  button.setAttribute('aria-pressed', on ? 'true' : 'false');

  const label = button.querySelector('.shell-help-label');
  const icon = button.querySelector('.shell-help-icon');
  if (label) label.textContent = on ? 'Confirm Keybinds' : 'Keybinds';
  if (icon) icon.textContent = on ? 'check' : 'keyboard';

  if (on || hovering) {
    paintKeysAccent(button, hovering && on ? KEYS_GREEN_HOVER : KEYS_GREEN);
  } else {
    clearKeysAccent(button);
  }
}

function initLinkConfirms(closeMenus) {
  const root = document.getElementById('shell-confirm');
  const openBtn = document.getElementById('shell-confirm-open');
  const messageEl = document.getElementById('shell-confirm-message');
  const titleEl = document.getElementById('shell-confirm-title');
  if (!root || !openBtn || !messageEl) return;

  let pendingUrl = null;
  let ignoreDismissUntil = 0;

  const setOpen = (open) => {
    root.hidden = !open;
    root.classList.toggle('is-open', open);
    if (open) {
      if (!isMobileDevice()) openBtn.focus({ preventScroll: true });
    }
    if (!open) pendingUrl = null;
  };

  const showConfirm = (config) => {
    closeMenus?.();
    pendingUrl = config.url;
    if (titleEl) titleEl.textContent = 'Open Link';
    messageEl.textContent = config.message;
    ignoreDismissUntil = Date.now() + 450;
    setOpen(true);
  };

  showConfirmFn = showConfirm;

  const bindConfirm = (id, config) => {
    const link = document.getElementById(id);
    link?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showConfirm(config);
    });
  };

  bindConfirm('shell-help-doodledev', LINK_CONFIRMS.doodledev);
  bindConfirm('shell-help-github', LINK_CONFIRMS.github);
  bindConfirm('shell-help-instagram', LINK_CONFIRMS.instagram);
  bindConfirm('shell-help-linkedin', LINK_CONFIRMS.linkedin);
  bindConfirm('shell-help-author', LINK_CONFIRMS.author);

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = pendingUrl;
    setOpen(false);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  });

  root.querySelectorAll('[data-shell-confirm-dismiss]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() < ignoreDismissUntil) return;
      setOpen(false);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) {
      setOpen(false);
    }
  });
}

export function initShellHelp() {
  const chrome = document.getElementById('shell-chrome');
  const helpRoot = document.getElementById('shell-help');
  const helpToggle = document.getElementById('shell-help-toggle');
  const helpPanel = document.getElementById('shell-help-panel');
  const controlsRoot = document.getElementById('shell-controls');
  const controlsToggle = document.getElementById('shell-controls-toggle');
  const controlsPanel = document.getElementById('shell-controls-panel');
  const keysBtn = document.getElementById('shell-help-keys');
  if (!chrome || !helpRoot || !helpToggle || !helpPanel) return;

  const mobile = isMobileDevice();
  if (mobile) {
    document.body.classList.add('is-mobile-device');
    document.querySelectorAll('[data-shell-desktop-only]').forEach((el) => el.remove());
  }

  const IDLE_MS = 3000;
  let idleTimer = null;

  const clearIdleTimer = () => {
    if (idleTimer !== null) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const showChrome = () => {
    clearIdleTimer();
    chrome.classList.remove('is-idle');
  };

  const setHelpOpen = (open) => {
    helpRoot.classList.toggle('is-open', open);
    helpToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    helpPanel.hidden = !open;
    if (open) {
      showChrome();
      if (controlsRoot && controlsToggle && controlsPanel) {
        controlsRoot.classList.remove('is-open');
        controlsToggle.setAttribute('aria-expanded', 'false');
        controlsPanel.hidden = true;
      }
    }
  };

  const setControlsOpen = (open) => {
    if (!controlsRoot || !controlsToggle || !controlsPanel) return;
    controlsRoot.classList.toggle('is-open', open);
    controlsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    controlsPanel.hidden = !open;
    if (open) {
      showChrome();
      helpRoot.classList.remove('is-open');
      helpToggle.setAttribute('aria-expanded', 'false');
      helpPanel.hidden = true;
      if (keysBtn) syncKeysLabel(keysBtn);
    }
  };

  const closeAllMenus = () => {
    setHelpOpen(false);
    setControlsOpen(false);
  };

  const scheduleIdleHide = () => {
    clearIdleTimer();
    if (chrome.contains(document.activeElement)) return;
    idleTimer = setTimeout(() => {
      idleTimer = null;
      if (chrome.contains(document.activeElement)) return;
      closeAllMenus();
      chrome.classList.add('is-idle');
    }, IDLE_MS);
  };

  helpToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    showChrome();
    setHelpOpen(!helpRoot.classList.contains('is-open'));
  });

  if (controlsToggle && controlsRoot) {
    controlsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      showChrome();
      setControlsOpen(!controlsRoot.classList.contains('is-open'));
    });
  }

  chrome.addEventListener('pointerenter', showChrome);
  chrome.addEventListener('pointerleave', scheduleIdleHide);

  document.documentElement.addEventListener('mouseleave', scheduleIdleHide);
  document.documentElement.addEventListener('mouseenter', showChrome);
  window.addEventListener('blur', scheduleIdleHide);

  if (keysBtn && !mobile) {
    keysBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      UI.toggleKeysMode();
      syncKeysLabel(keysBtn);
    });

    keysBtn.addEventListener('pointerenter', () => {
      paintKeysAccent(keysBtn, UI.isKeysModeEnabled ? KEYS_GREEN_HOVER : KEYS_GREEN);
    });

    keysBtn.addEventListener('pointerleave', () => {
      syncKeysLabel(keysBtn);
    });

    window.addEventListener('keys-mode-changed', () => {
      syncKeysLabel(keysBtn);
    });
  }

  document.addEventListener('click', (e) => {
    const helpOpen = helpRoot.classList.contains('is-open');
    const controlsOpen = !!controlsRoot?.classList.contains('is-open');
    if (!helpOpen && !controlsOpen) return;
    if (chrome.contains(e.target)) return;
    closeAllMenus();
    scheduleIdleHide();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const helpOpen = helpRoot.classList.contains('is-open');
    const controlsOpen = !!controlsRoot?.classList.contains('is-open');
    if (!helpOpen && !controlsOpen) return;
    closeAllMenus();
    (helpOpen ? helpToggle : controlsToggle)?.focus();
    showChrome();
  });

  initLinkConfirms(closeAllMenus);
  if (keysBtn && !mobile) syncKeysLabel(keysBtn);
  closeAllMenus();
  scheduleIdleHide();
}
