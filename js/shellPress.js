/**
 * Shell-demo only: physical face press visuals (A/B sink, Start/Select oval, D-pad rocker).
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

  function setupHelpMenu() {
    const chrome = byId('shell-chrome');
    const helpRoot = byId('shell-help');
    const helpToggle = byId('shell-help-toggle');
    const helpPanel = byId('shell-help-panel');
    const faceMark = byId('gb-keys-toggle');
    if (!chrome || !helpRoot || !helpToggle || !helpPanel) return;

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

    const syncFaceMark = (open) => {
      if (!faceMark) return;
      faceMark.classList.toggle('is-menu-open', open);
      faceMark.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const setHelpOpen = (open) => {
      helpRoot.classList.toggle('is-open', open);
      helpToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      helpPanel.hidden = !open;
      syncFaceMark(open);
      if (open) showChrome();
    };

    const toggleHelp = () => {
      showChrome();
      setHelpOpen(!helpRoot.classList.contains('is-open'));
    };

    const scheduleIdleHide = () => {
      clearIdleTimer();
      if (chrome.contains(document.activeElement)) return;
      idleTimer = setTimeout(() => {
        idleTimer = null;
        if (chrome.contains(document.activeElement)) return;
        setHelpOpen(false);
        chrome.classList.add('is-idle');
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

    chrome.addEventListener('pointerenter', showChrome);
    chrome.addEventListener('pointerleave', scheduleIdleHide);
    document.documentElement.addEventListener('mouseleave', scheduleIdleHide);
    document.documentElement.addEventListener('mouseenter', showChrome);
    window.addEventListener('blur', scheduleIdleHide);

    document.addEventListener('click', (e) => {
      if (!helpRoot.classList.contains('is-open')) return;
      if (chrome.contains(e.target)) return;
      if (faceMark?.contains(e.target)) return;
      setHelpOpen(false);
      scheduleIdleHide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!helpRoot.classList.contains('is-open')) return;
      setHelpOpen(false);
      helpToggle.focus();
      showChrome();
    });

    setHelpOpen(false);
    scheduleIdleHide();
  }

  function start() {
    setupFaceButtons();
    setupDpad();
    setupKeyboard();
    setupHelpMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
