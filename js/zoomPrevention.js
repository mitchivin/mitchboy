/**
 * zoomPrevention.js — Complete mobile zoom prevention for iOS 10+ and Android.
 *
 * Apple deliberately ignores user-scalable=no in viewport meta tag on iOS 10+.
 * This module provides the required JavaScript layer to prevent:
 * - Pinch-zoom gestures
 * - Double-tap zoom
 * - Smart Zoom (tap on element)
 */

let initialized = false;

export function initZoomPrevention() {
    if (initialized) return;
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    // Prevent pinch-zoom on touchmove
    document.addEventListener('touchmove', (event) => {
        if (event.scale !== 1 && event.scale !== undefined) {
            event.preventDefault();
        }
    }, { passive: false });

    // Prevent iOS gesture events
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(eventName => {
        document.addEventListener(eventName, (e) => e.preventDefault(), { passive: false });
    });

    // Prevent double-tap zoom
    let lastTouchStart = 0;
    document.addEventListener('touchstart', (event) => {
        const now = Date.now();
        if (now - lastTouchStart <= 300 && event.cancelable) {
            event.preventDefault();
        }
        lastTouchStart = now;
    }, { passive: false });

    // Context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // NUCLEAR: Reset zoom if it ever changes (only fires when zoom actually happens)
    const resetZoom = () => {
        const scale = window.visualViewport?.scale || 1;
        if (scale !== 1) {
            // Force zoom back to 1
            if (document.documentElement.style.zoom) {
                document.documentElement.style.zoom = 1;
            }
            // Scroll to top-left to reset view
            window.scrollTo(0, 0);
        }
    };

    // Listen for visual viewport changes (fires only on zoom/pan)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', resetZoom, { passive: true });
    }

    // Backup: orientationchange can trigger zoom
    window.addEventListener('orientationchange', () => {
        setTimeout(resetZoom, 100);
    }, { passive: true });

    initialized = true;
}
