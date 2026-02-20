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

// Wait for custom element to be ready
customElements.whenDefined('exported-content').then(async () => {
    setupDevChromeToggle();

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

    // 7. Show mobile warning early on page load
    UI.maybeShowMobileWarningOnLoad();

    // 8. Scan ROMs
    const roms = await scanROMs();
    State.set('romList', roms);

    // 9. Reveal shell after first stable paint
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            hideGameboyLoader();
        });
    });
});
