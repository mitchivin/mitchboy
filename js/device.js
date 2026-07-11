/**
 * Device detection for the Game Boy app.
 * Matches MitchIvin XP shell heuristics so upload/save/footer gates stay consistent.
 */

let _isMobileCache = null;

export function isMobileDevice() {
  if (_isMobileCache !== null) return _isMobileCache;

  const ua = navigator.userAgent || '';
  const isUserAgentMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua);
  const isAppleTabletPretender = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;

  if (isUserAgentMobile || isAppleTabletPretender) {
    _isMobileCache = true;
    return true;
  }

  const isDevToolsMobile =
    'ontouchstart' in window && navigator.maxTouchPoints > 0 && window.innerWidth <= 768;
  if (isDevToolsMobile) {
    _isMobileCache = true;
    return true;
  }

  try {
    const touchCapable = navigator.maxTouchPoints > 0;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minDim = Math.min(vw, vh);
    const notLargeScreen = vw <= 1200 && vh <= 1200;
    _isMobileCache = touchCapable && minDim < 780 && notLargeScreen;
  } catch (_) {
    _isMobileCache = false;
  }

  return _isMobileCache;
}
