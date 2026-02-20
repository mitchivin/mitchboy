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

// Wait for custom element to be ready
customElements.whenDefined('exported-content').then(async () => {
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

    // 7. Scan ROMs
    const roms = await scanROMs();
    State.set('romList', roms);
});
