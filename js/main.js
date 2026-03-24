/**
 * Main entry point - orchestrates initialization
 * Clean, linear startup sequence
 */

import { DOM } from './dom.js';
import { State } from './state.js';
import { UI } from './ui.js';
import { Emulator } from './emulator.js';
import { Input } from './input.js';
import { Keybinds } from './keybinds.js';
import { scanROMs } from './romScanner.js';

function isMobileDevice() {
    const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(navigator.userAgent || '');
    const uaDataMobile = navigator.userAgentData?.mobile === true;
    const touchPoints = (navigator.maxTouchPoints || 0) > 0;
    const coarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    return uaDataMobile || uaMobile || (touchPoints && coarsePointer);
}

function isDevEnvironment() {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || window.location.protocol === 'file:';
}

function setupDevChromeToggle() {
    if (!isDevEnvironment()) return;

    window.addEventListener('keydown', (e) => {
        const target = e.target;
        const isTypingTarget = target && (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        );
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

function hideGameboyLoader() {
    const loader = document.getElementById('app-shell-loader');

    document.body.classList.remove('app-loading');

    if (!loader) return;

    loader.classList.add('is-hidden');
    setTimeout(() => {
        loader.remove();
    }, 260);
}

function showPreloadMobileWarning() {
    return new Promise((resolve) => {
        const existing = document.querySelector('#mobile-warning-overlay');
        if (existing) {
            resolve(true);
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'mobile-warning-overlay';
        overlay.innerHTML = `
            <div class="mobile-warning-box">
                <div class="mobile-warning-title">MOBILE WARNING</div>
                <div class="mobile-warning-text">
                    This emulator may run poorly on mobile and audio can stutter.
                </div>
                <div class="mobile-warning-actions">
                    <button class="mobile-warning-btn mobile-warning-btn-proceed">PROCEED</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.offsetHeight;
        overlay.classList.add('visible');

        const close = () => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                resolve(true);
            }, 300);
        };

        overlay.querySelector('.mobile-warning-btn-proceed')?.addEventListener('click', (e) => {
            e.stopPropagation();
            close();
        });
    });
}

async function bootstrap() {
    setupDevChromeToggle();

    const isMobile = isMobileDevice();

    document.body.classList.remove('awaiting-mobile-confirm');

    // Gameboy design is now inline HTML — no custom element needed

    // 1. Initialize DOM references
    DOM.init();
    DOM.mountToShadow();

    // 2. Initialize state
    State.init();

    // 3. Initialize UI
    UI.init();

    // 4. Initialize emulator
    Emulator.init();

    // 5. Initialize input handlers
    Input.init();

    // 6. Initialize keybinds
    Keybinds.init();

    if (isMobile) {
        State.set('mobileWarningShown', true);
    }

    // 8. Scan ROMs
    const roms = await scanROMs();
    State.set('romList', roms);

    // 9. Reveal shell after first stable paint
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            hideGameboyLoader();
        });
    });
}

bootstrap().catch((error) => {
    console.error('Game Boy bootstrap failed:', error);
});
