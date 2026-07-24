/**
 * Shell-demo only: physical face press visuals (A/B sink, Start/Select oval, D-pad rocker)
 * and full-width help menu (panel auto-close; header always visible).
 * No emulator, menus, or Controls logic.
 */
(function initShellPress() {
  const DPAD_STROKE_REST = 'url(#stroke-grad-4)';
  const DPAD_STROKE_PRESS = {
    up: 'url(#stroke-grad-4-up)',
    down: 'url(#stroke-grad-4-down)',
    left: 'url(#stroke-grad-4-left)',
    right: 'url(#stroke-grad-4-right)',
  };

  const KEY_TO_FACE = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'a',
    W: 'a',
    q: 'b',
    Q: 'b',
    Alt: 'start',
    Control: 'select',
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function detectMobileViewport() {
    const ua = navigator.userAgent || '';
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua);
    const isAppleTablet = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
    const isTouchPhysicalScreen =
      ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.screen.width <= 1024;
    if (isMobileUA || isAppleTablet || isTouchPhysicalScreen) {
      document.documentElement.classList.add('mobile-viewport');
    }
  }

  function applyButtonVisual(name, pressed) {
    const node = byId(name);
    if (!node) return;
    node.classList.toggle('btn-pressed', pressed);
  }

  function applyDpadVisual(direction, pressed) {
    const strokePath = byId('directional')?.querySelector('.stroke-path');
    if (!strokePath) return;
    if (pressed && DPAD_STROKE_PRESS[direction]) {
      strokePath.setAttribute('stroke', DPAD_STROKE_PRESS[direction]);
      strokePath.style.opacity = '0.6';
    } else {
      strokePath.setAttribute('stroke', DPAD_STROKE_REST);
      strokePath.style.opacity = '';
    }
  }

  function bindPressTarget(el, onDown, onUp) {
    if (!el) return;
    let down = false;
    const release = (e) => {
      if (!down) return;
      down = false;
      e?.preventDefault?.();
      onUp();
    };
    const press = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      down = true;
      try {
        el.setPointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
      onDown(e);
    };
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('lostpointercapture', release);
    el.addEventListener('pointerleave', (e) => {
      // Only release if we no longer have capture (mouse drag-off without capture).
      if (!down) return;
      if (el.hasPointerCapture?.(e.pointerId)) return;
      release(e);
    });
  }

  function setupFaceButtons() {
    const buttons = [
      { name: 'a', els: [byId('a-hitarea'), byId('a')] },
      { name: 'b', els: [byId('b-hitarea'), byId('b')] },
      { name: 'start', els: [byId('start-hitarea'), byId('start')] },
      { name: 'select', els: [byId('select-hitarea'), byId('select')] },
    ];

    for (const { name, els } of buttons) {
      for (const el of els) {
        if (!el) continue;
        bindPressTarget(
          el,
          () => applyButtonVisual(name, true),
          () => applyButtonVisual(name, false),
        );
      }
    }
  }

  function setupDpad() {
    const hitarea = byId('dpad-hitarea') || byId('dpad');
    if (!hitarea) return;

    /** @type {Map<number, string|null>} */
    const activeByPointer = new Map();

    const getDirection = (e) => {
      const rect = hitarea.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.abs(dx) < rect.width * 0.08 && Math.abs(dy) < rect.height * 0.08) return null;
      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    };

    const setDir = (pointerId, dir) => {
      const prev = activeByPointer.has(pointerId) ? activeByPointer.get(pointerId) : undefined;
      if (prev === dir) return;
      if (prev) applyDpadVisual(prev, false);
      activeByPointer.set(pointerId, dir);
      if (dir) applyDpadVisual(dir, true);
    };

    const releasePointer = (e) => {
      if (!activeByPointer.has(e.pointerId)) return;
      e.preventDefault?.();
      const prev = activeByPointer.get(e.pointerId);
      activeByPointer.delete(e.pointerId);
      if (prev) applyDpadVisual(prev, false);
    };

    window.addEventListener('pointerup', releasePointer, true);
    window.addEventListener('pointercancel', releasePointer, true);

    hitarea.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        hitarea.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const dir = getDirection(e);
      activeByPointer.set(e.pointerId, dir);
      if (dir) applyDpadVisual(dir, true);
    });

    hitarea.addEventListener('pointermove', (e) => {
      if (!activeByPointer.has(e.pointerId)) return;
      e.preventDefault();
      setDir(e.pointerId, getDirection(e));
    });

    hitarea.addEventListener('pointerup', releasePointer);
    hitarea.addEventListener('pointercancel', releasePointer);
    hitarea.addEventListener('lostpointercapture', releasePointer);
  }

  function setupKeyboard() {
    /** @type {Set<string>} */
    const held = new Set();

    const onKey = (e, pressed) => {
      const face = KEY_TO_FACE[e.key];
      if (!face) return;
      e.preventDefault();
      if (pressed) {
        if (e.repeat || held.has(face)) return;
        held.add(face);
      } else if (!held.delete(face)) {
        return;
      }
      if (face === 'up' || face === 'down' || face === 'left' || face === 'right') {
        applyDpadVisual(face, pressed);
      } else {
        applyButtonVisual(face, pressed);
      }
    };

    window.addEventListener('keydown', (e) => onKey(e, true));
    window.addEventListener('keyup', (e) => onKey(e, false));
    window.addEventListener('blur', () => {
      for (const face of held) {
        if (face === 'up' || face === 'down' || face === 'left' || face === 'right') {
          applyDpadVisual(face, false);
        } else {
          applyButtonVisual(face, false);
        }
      }
      held.clear();
    });
  }

  const LINK_CONFIRMS = {
    doodledev: {
      url: 'https://doodledev.app',
      message: 'Opens DoodleDev in a new tab. This device is available in the Preset menu.',
    },
    github: {
      url: 'https://github.com/mitchivin',
      message: "Opens Mitch's Github in a new tab.",
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

  function initLinkConfirms(closeHelp) {
    const root = byId('shell-confirm');
    const openBtn = byId('shell-confirm-open');
    const messageEl = byId('shell-confirm-message');
    const titleEl = byId('shell-confirm-title');
    if (!root || !openBtn || !messageEl) return;

    let pendingUrl = null;
    let ignoreDismissUntil = 0;

    const setConfirmOpen = (open) => {
      root.hidden = !open;
      root.classList.toggle('is-open', open);
      if (open) {
        const isMobile = document.documentElement.classList.contains('mobile-viewport');
        if (!isMobile) openBtn.focus({ preventScroll: true });
      }
      if (!open) pendingUrl = null;
    };

    const showConfirm = (config) => {
      closeHelp?.();
      pendingUrl = config.url;
      if (titleEl) titleEl.textContent = 'Open Link';
      messageEl.textContent = config.message;
      ignoreDismissUntil = Date.now() + 450;
      setConfirmOpen(true);
    };

    const bindConfirm = (id, config) => {
      const link = byId(id);
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
      setConfirmOpen(false);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });

    root.querySelectorAll('[data-shell-confirm-dismiss]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (Date.now() < ignoreDismissUntil) return;
        setConfirmOpen(false);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        setConfirmOpen(false);
      }
    });
  }

  function setupHelpMenu() {
    const helpRoot = byId('shell-help');
    const helpToggle = byId('shell-help-toggle');
    const helpPanel = byId('shell-help-panel');
    const faceMark = byId('gb-keys-toggle');
    if (!helpRoot || !helpToggle || !helpPanel) return;

    // Shell OSS has no Controls/Save/Load app actions
    document.querySelectorAll('[data-shell-desktop-only]').forEach((el) => el.remove());

    const IDLE_MS = 3000;
    let idleTimer = null;

    const clearIdleTimer = () => {
      if (idleTimer !== null) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    };

    const syncFaceMark = (open) => {
      if (!faceMark) return;
      faceMark.classList.toggle('is-menu-open', open);
      faceMark.setAttribute('aria-expanded', open ? 'true' : 'false');
      // Touch leaves sticky :hover after tap — drop focus so the highlight clears.
      if (!open) faceMark.blur();
    };

    const setHelpOpen = (open) => {
      helpRoot.classList.toggle('is-open', open);
      helpToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      helpPanel.hidden = !open;
      syncFaceMark(open);
      if (open) clearIdleTimer();
    };

    const toggleHelp = () => {
      setHelpOpen(!helpRoot.classList.contains('is-open'));
    };

    /** Auto-close dropdown only; header always stays visible. */
    const schedulePanelClose = () => {
      clearIdleTimer();
      if (helpRoot.contains(document.activeElement)) return;
      idleTimer = setTimeout(() => {
        idleTimer = null;
        if (helpRoot.contains(document.activeElement)) return;
        setHelpOpen(false);
      }, IDLE_MS);
    };

    helpToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHelp();
    });

    if (faceMark) {
      faceMark.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleHelp();
      });
      faceMark.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        toggleHelp();
      });
    }

    helpRoot.addEventListener('pointerleave', schedulePanelClose);
    window.addEventListener('blur', schedulePanelClose);

    document.addEventListener('click', (e) => {
      if (!helpRoot.classList.contains('is-open')) return;
      if (helpRoot.contains(e.target)) return;
      if (faceMark?.contains(e.target)) return;
      setHelpOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!helpRoot.classList.contains('is-open')) return;
      setHelpOpen(false);
      helpToggle.focus();
    });

    initLinkConfirms(() => setHelpOpen(false));
    setHelpOpen(false);
  }

  const BOOT_MIN_MS = 480;
  const BOOT_FADE_MS = 420;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function hideShellLoader() {
    document.body.classList.remove('app-loading');
    const loader = byId('app-shell-loader');
    if (!loader) return;
    loader.classList.add('is-hidden');
    await wait(BOOT_FADE_MS);
    loader.remove();
  }

  async function start() {
    const bootStartedAt = performance.now();
    detectMobileViewport();
    setupFaceButtons();
    setupDpad();
    setupKeyboard();
    setupHelpMenu();
    const remaining = Math.max(0, BOOT_MIN_MS - (performance.now() - bootStartedAt));
    await wait(remaining);
    await hideShellLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      start();
    }, { once: true });
  } else {
    start();
  }
})();
