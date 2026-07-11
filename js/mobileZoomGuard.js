/**
 * Mobile browser zoom guard — pinch, double-tap, and scale recovery.
 * Load synchronously in <head> before other scripts (classic script, not module).
 *
 * Modes (set window.__MITCHIVIN_ZOOM_GUARD_MODE__ before this script):
 * - 'strict'   — Game Boy / iPod: block all touchmove (arcade controls)
 * - 'standard' — shell + most apps: block multi-touch only
 * - 'pan'      — image viewer: multi-touch block only; keep single-finger pan
 *
 * @module js/mobileZoomGuard
 */
(function initMobileZoomGuard(global) {
  if (global.__MITCHIVIN_ZOOM_GUARD__) return;
  global.__MITCHIVIN_ZOOM_GUARD__ = true;

  const mode = global.__MITCHIVIN_ZOOM_GUARD_MODE__ || 'standard';
  const opts = { passive: false, capture: true };
  const DOUBLE_TAP_MS = 350;

  ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
    global.document.addEventListener(type, (e) => e.preventDefault(), opts);
  });

  global.document.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    opts,
  );

  global.document.addEventListener(
    'touchmove',
    (e) => {
      if (mode === 'strict') {
        e.preventDefault();
        return;
      }
      if (e.touches.length > 1) e.preventDefault();
    },
    opts,
  );

  let lastTouchEnd = 0;
  global.document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= DOUBLE_TAP_MS) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    opts,
  );

  global.document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) e.preventDefault();
    },
    opts,
  );

  global.document.addEventListener('contextmenu', (e) => e.preventDefault(), opts);

  try {
    if (!global.document.getElementById('mobile-zoom-guard-style')) {
      const style = global.document.createElement('style');
      style.id = 'mobile-zoom-guard-style';
      // strict (iPod / GBC): touch-action none — no browser pan/zoom gestures at all
      // standard/pan: manipulation — still blocks double-tap zoom, allows intentional pan where needed
      const touchAction = mode === 'strict' ? 'none' : 'manipulation';
      style.textContent =
        `html,body{touch-action:${touchAction};overscroll-behavior:none;-webkit-text-size-adjust:100%;text-size-adjust:100%;}` +
        (mode === 'strict'
          ? 'html,body,*{touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;}'
          : '');
      global.document.head.appendChild(style);
    }
  } catch (_) {
    /* ignore */
  }

  // Extra belt: block dblclick zoom paths some mobile browsers still honor
  global.document.addEventListener('dblclick', (e) => e.preventDefault(), opts);

  function hardenViewportMeta() {
    const meta = global.document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const keepWidget = /interactive-widget=resizes-content/.test(meta.content);
    let next =
      'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    if (keepWidget) next += ', interactive-widget=resizes-content';
    if (meta.content !== next) meta.content = next;
  }

  function resetPageScale() {
    const vv = global.visualViewport;
    if (!vv || vv.scale <= 1.001) return;

    hardenViewportMeta();
    try {
      global.scrollTo(0, 0);
    } catch (_) {
      /* ignore */
    }
    if (typeof global.setRealVh === 'function') {
      global.setRealVh();
    }
    if (typeof global.forceViewportRecalc === 'function') {
      try {
        global.forceViewportRecalc();
      } catch (_) {
        /* ignore */
      }
    }
  }

  hardenViewportMeta();

  if (global.visualViewport) {
    global.visualViewport.addEventListener('resize', resetPageScale);
    global.visualViewport.addEventListener('scroll', resetPageScale);
  }

  global.addEventListener('orientationchange', () => {
    setTimeout(() => {
      hardenViewportMeta();
      resetPageScale();
    }, 100);
  });

  global.__resetPageScale = resetPageScale;
})(typeof window !== 'undefined' ? window : globalThis);
