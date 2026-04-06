/**
 * zoomPrevention.js — ABSOLUTE nuclear zoom prevention for iOS
 * 
 * This module runs at the document level and intercepts ALL zoom attempts
 */

(function() {
    // Only run on touch devices
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    // Prevent pinch-zoom gestures
    document.addEventListener('gesturestart', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false, capture: true });
    document.addEventListener('gesturechange', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false, capture: true });
    document.addEventListener('gestureend', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false, capture: true });

    // Prevent double-tap zoom by tracking timing
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        const isDoubleTap = now - lastTouchEnd < 300;
        lastTouchEnd = now;
        
        if (isDoubleTap && e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false, capture: true });

    // Block context menu
    document.addEventListener('contextmenu', (e) => { e.preventDefault(); }, true);

    // NUCLEAR: If zoom ever happens, reset it immediately
    const resetZoom = () => {
        if (window.visualViewport && window.visualViewport.scale !== 1) {
            // Force scale back to 1
            document.documentElement.style.transform = 'scale(1)';
            document.documentElement.style.transformOrigin = '0 0';
            window.scrollTo(0, 0);
            
            // Remove transform after reset
            requestAnimationFrame(() => {
                document.documentElement.style.transform = '';
            });
        }
    };

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', resetZoom, { passive: true });
    }

    // Backup on scroll (zoom often triggers scroll)
    window.addEventListener('scroll', resetZoom, { passive: true });

    // Orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(resetZoom, 0);
        setTimeout(resetZoom, 100);
        setTimeout(resetZoom, 300);
    });

    // If zoom somehow happens, force reset
    Object.defineProperty(window, 'devicePixelRatio', {
        get: () => 1,
        configurable: true
    });

})();
