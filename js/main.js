/**
 * Main entry point — orchestrates app initialization.
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
    setTimeout(() => loader.remove(), 260);
}

async function bootstrap() {
    setupDevChromeToggle();

    const isMobile = isMobileDevice();
    document.body.classList.remove('awaiting-mobile-confirm');

    DOM.init();
    DOM.mountContainers();
    State.init();
    UI.init();
    Emulator.init();
    Input.init();
    Keybinds.init();

    if (isMobile) {
        State.set('mobileWarningShown', true);
    }

    const roms = await scanROMs();
    State.set('romList', roms);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            hideGameboyLoader();
        });
    });
}

bootstrap().catch((err) => {
    console.error('Bootstrap failed:', err);
});
