/**
 * zoomPrevention.js — Complete mobile zoom prevention for iOS 10+ and Android.
 *
 * Apple deliberately ignores user-scalable=no in viewport meta tag on iOS 10+.
 * This module provides the required JavaScript layer to prevent:
 * - Pinch-zoom gestures
 * - Double-tap zoom
 */

let initialized = false;

export function initZoomPrevention() {
    if (initialized) return;
    if (!window.matchMedia('(pointer: coarse)').matches) return; // Skip on non-touch devices

    // Prevent pinch-zoom on touchmove (iOS 10+)
    document.addEventListener('touchmove', (event) => {
        if (event.scale !== 1 && event.scale !== undefined) {
            event.preventDefault();
        }
    }, { passive: false });

    // Prevent iOS gesture events (pinch open/close)
    document.addEventListener('gesturestart', (event) => {
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturechange', (event) => {
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('gestureend', (event) => {
        event.preventDefault();
    }, { passive: false });

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            if (event.cancelable) {
                event.preventDefault();
            }
        }
        lastTouchEnd = now;
    }, false);

    // Prevent context menu on long press
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    initialized = true;
}
