/**
 * Input handling - keyboard and button events
 * Handles both menu navigation and game controls
 */

import { State } from './state.js';
import { DOM } from './dom.js';
import { UI } from './ui.js';
import { Keybinds } from './keybinds.js';
import { scanROMs } from './romScanner.js';

class InputManager {
    constructor() {
        this.keyHandlers = null;

        // Cheat code tracking
        this.cheatSequence = ['up', 'down', 'left', 'right', 'b', 'down', 'up'];
        this.cheatBuffer = []; // Accumulates all inputs before comparing
        this.isCheatInputMode = false; // True when user is actively entering the cheat
        this.isMobileWarningMode = false;
        this.selectHeld = false;
    }

    init() {
        this.setupKeyboard();
        this.setupButtons();
        this.setupDpad();

        // Overlay-driven cheat state
        window.addEventListener('cheat-overlay-opened', () => {
            this.isCheatInputMode = true;
            this.cheatBuffer = [];
        });
        window.addEventListener('cheat-overlay-closed', () => {
            this.isCheatInputMode = false;
            this.cheatBuffer = [];
        });
        window.addEventListener('mobile-warning-opened', () => {
            this.isMobileWarningMode = true;
        });
        window.addEventListener('mobile-warning-closed', () => {
            this.isMobileWarningMode = false;
        });
        window.addEventListener('cheat-submit', () => this.tryActivateCheat());
    }

    _mobileWarningConfirmFocused() {
        const overlay = document.querySelector('#mobile-warning-overlay');
        if (!overlay) return;
        const proceedBtn = overlay.querySelector('.mobile-warning-btn-proceed');
        if (proceedBtn) proceedBtn.click();
    }

    setupKeyboard() {
        const handleKeyDown = (e) => this.handleKey(e, true);
        const handleKeyUp = (e) => this.handleKey(e, false);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        this.keyHandlers = { handleKeyDown, handleKeyUp };
    }

    handleKey(e, isPressed) {
        // Check if we're waiting for a key rebind
        if (Keybinds.handleKeyPress(e)) {
            return; // Key was captured for rebinding
        }

        const key = e.key;

        // Tab = toggle mode (check against custom keybind)
        if (key === Keybinds.getKey('toggle') && isPressed) {
            e.preventDefault();

            if (this.isCheatInputMode) {
                this.exitCheatInputMode();
                return;
            }

            UI.toggleMode();
            return;
        }

        // Keys overlay active — block all other input
        if (UI.isKeysModeEnabled) return;

        const currentMode = State.get('currentMode');

        // Track Select key state
        if (key === Keybinds.getKey('select')) {
            this.selectHeld = isPressed;
        }

        // D-pad keys - check against custom keybinds
        const dpadMap = {
            [Keybinds.getKey('up')]: { direction: 'up', code: 38 },
            [Keybinds.getKey('down')]: { direction: 'down', code: 40 },
            [Keybinds.getKey('left')]: { direction: 'left', code: 37 },
            [Keybinds.getKey('right')]: { direction: 'right', code: 39 }
        };

        if (dpadMap[key]) {
            e.preventDefault();

            const mapping = dpadMap[key];
            const direction = mapping.direction;

            if (isPressed) {
                // Visual feedback for d-pad
                this.applyDpadVisuals(direction, true);

                if (currentMode === 'menu') {
                    if (this.isMobileWarningMode) {
                        return;
                    }

                    if (this.isCheatInputMode) {
                        // In cheat input mode: feed direction into sequence
                        this.feedCheatInput(direction);
                    } else if (!this.selectHeld) {
                        UI.handleMenuNavigation(direction);
                    }
                } else if (currentMode === 'rom') {
                    this.sendGameButton(mapping.code, true);
                }
            } else {
                // Reset d-pad visuals
                this.applyDpadVisuals(direction, false);

                if (currentMode === 'rom') {
                    this.sendGameButton(mapping.code, false);
                }
            }
            return;
        }

        // Action keys - build dynamically from current keybinds
        const actionMap = {
            [Keybinds.getKey('b')]: { code: 88, button: 'b' },
            [Keybinds.getKey('a')]: { code: 90, button: 'a' },
            [Keybinds.getKey('start')]: { code: 13, button: 'start' },
            [Keybinds.getKey('select')]: { code: 16, button: 'select' }
        };

        if (actionMap[key]) {
            e.preventDefault();

            const mapping = actionMap[key];

            if (isPressed) {
                // Visual feedback for button
                this.applyButtonVisuals(mapping.button, true);

                if (currentMode === 'menu') {
                    if (this.isMobileWarningMode) {
                        if (mapping.button === 'a' || mapping.button === 'start') {
                            this._mobileWarningConfirmFocused();
                        }
                        return;
                    }

                    const selectedCard = DOM.carousel?.querySelectorAll('.rom-card')[State.get('selectedROMIndex')];
                    const isCheatCardSelected = selectedCard?.dataset?.cheat === 'true';

                    if (isCheatCardSelected && !this.isCheatInputMode) {
                        // A/Start on the cheat card when not in input mode: ENTER input mode
                        if (mapping.button === 'a' || mapping.button === 'start') {
                            this.enterCheatInputMode();
                        }
                    } else if (this.isCheatInputMode) {
                        // Overlay is open — any action button feeds into sequence.
                        // This prevents "A/Start" from being dead keys, which would leak the code.
                        this.feedCheatInput(mapping.button);
                    } else {
                        if (mapping.button === 'a' || mapping.button === 'start') {
                            UI.activateMenuItem();
                        }
                    }
                } else if (currentMode === 'rom') {
                    this.sendGameButton(mapping.code, true);
                }
            } else {
                // Reset button visuals
                this.applyButtonVisuals(mapping.button, false);

                if (currentMode === 'rom') {
                    this.sendGameButton(mapping.code, false);
                }
            }
        }
    }

    applyButtonVisuals(buttonName, isPressed) {
        const button = DOM.buttons?.[buttonName];
        if (!button) return;

        // Use class-based state to trigger CSS animations
        // This targets the specific internal elements defined in CSS
        // avoiding parent-level scaling that distorts shadows
        if (isPressed) {
            button.classList.add('btn-pressed');
        } else {
            button.classList.remove('btn-pressed');
        }
    }

    applyDpadVisuals(direction, isPressed) {
        // Dynamic Gradient Feedback for D-pad Rocker Effect
        const gradient = DOM.findElement('stroke-grad-4');
        const dpadContainer = DOM.findElement('directional');
        const strokePath = dpadContainer?.querySelector('.stroke-path');

        if (strokePath) {
            strokePath.style.transition = 'opacity 0.1s ease-out';
        }

        if (gradient) {
            if (isPressed) {
                // Fade stroke slightly
                if (strokePath) strokePath.style.opacity = '0.6';

                // Shift gradient based on direction
                switch (direction) {
                    case 'up':
                        gradient.setAttribute('x1', '50%'); gradient.setAttribute('y1', '100%');
                        gradient.setAttribute('x2', '50%'); gradient.setAttribute('y2', '0%');
                        break;
                    case 'down':
                        gradient.setAttribute('x1', '50%'); gradient.setAttribute('y1', '0%');
                        gradient.setAttribute('x2', '50%'); gradient.setAttribute('y2', '100%');
                        break;
                    case 'left':
                        gradient.setAttribute('x1', '100%'); gradient.setAttribute('y1', '50%');
                        gradient.setAttribute('x2', '0%'); gradient.setAttribute('y2', '50%');
                        break;
                    case 'right':
                        gradient.setAttribute('x1', '0%'); gradient.setAttribute('y1', '50%');
                        gradient.setAttribute('x2', '100%'); gradient.setAttribute('y2', '50%');
                        break;
                }
            } else {
                // Reset stroke opacity
                if (strokePath) strokePath.style.opacity = '1';

                // Reset to default (top to bottom)
                gradient.setAttribute('x1', '50%'); gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '50%'); gradient.setAttribute('y2', '100%');
            }
        }
    }

    setupButtons() {
        if (!DOM.buttons) return;

        const bind = (name, element) => {
            if (!element) return;
            element.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                element.setPointerCapture(e.pointerId);
                this.handleButtonPress(name, true);
            });
            element.addEventListener('pointerup', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonPress(name, false);
            });
            element.addEventListener('pointercancel', (e) => {
                e.stopPropagation();
                this.handleButtonPress(name, false);
            });
        };

        // All input comes through visible buttons
        bind('a',      DOM.buttons.a);
        bind('b',      DOM.buttons.b);
        bind('start',  DOM.buttons.start);
        bind('select', DOM.buttons.select);
    }

    handleButtonPress(buttonName, isPressed) {
        // Keys overlay active — block button input
        if (UI.isKeysModeEnabled) return;

        const currentMode = State.get('currentMode');

        // Visual feedback
        this.applyButtonVisuals(buttonName, isPressed);

        if (currentMode === 'menu') {
            if (isPressed) {
                if (this.isMobileWarningMode) {
                    if (buttonName === 'a' || buttonName === 'start') {
                        this._mobileWarningConfirmFocused();
                    }
                    return;
                }

                const selectedCard = DOM.carousel?.querySelectorAll('.rom-card')[State.get('selectedROMIndex')];
                const isCheatCardSelected = selectedCard?.dataset?.cheat === 'true';

                if (isCheatCardSelected && !this.isCheatInputMode) {
                    if (buttonName === 'a' || buttonName === 'start') {
                        this.enterCheatInputMode();
                    }
                } else if (this.isCheatInputMode) {
                    // Overlay open — all action buttons feed sequence to keep the code secret
                    this.feedCheatInput(buttonName);
                } else {
                    if (buttonName === 'a' || buttonName === 'start') {
                        UI.activateMenuItem();
                    }
                }
            }
        } else if (currentMode === 'rom') {
            const keyMap = {
                'a': 90,
                'b': 88,
                'start': 13,
                'select': 16
            };

            if (keyMap[buttonName]) {
                this.sendGameButton(keyMap[buttonName], isPressed);
            }
        }
    }

    setupDpad() {
        const dpad = DOM.dpad?.container;
        if (!dpad) return;

        // Single overlay covers the whole dpad. On pointer down/move we calculate
        // which quadrant was hit using the pointer position relative to the centre.
        // Diagonal threshold: if |x| and |y| are both > 20% of half-width we pick
        // the dominant axis, so corners still register cleanly.

        let activeDirection = null;

        const getDirection = (e) => {
            const rect = dpad.getBoundingClientRect();
            const cx = rect.left + rect.width  / 2;
            const cy = rect.top  + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;

            // Dead zone — ignore taps right on the centre
            if (Math.abs(dx) < rect.width * 0.08 && Math.abs(dy) < rect.height * 0.08) return null;

            // Pick dominant axis
            return Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? 'right' : 'left')
                : (dy > 0 ? 'down'  : 'up');
        };

        dpad.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            dpad.setPointerCapture(e.pointerId);
            const dir = getDirection(e);
            if (!dir) return;
            activeDirection = dir;
            this.handleDpadPress(dir, true);
        });

        dpad.addEventListener('pointermove', (e) => {
            if (!activeDirection) return;
            e.preventDefault();
            const dir = getDirection(e);
            if (!dir || dir === activeDirection) return;
            // Direction changed — release old, press new
            this.handleDpadPress(activeDirection, false);
            activeDirection = dir;
            this.handleDpadPress(dir, true);
        });

        const release = (e) => {
            if (!activeDirection) return;
            this.handleDpadPress(activeDirection, false);
            activeDirection = null;
        };

        dpad.addEventListener('pointerup',     release);
        dpad.addEventListener('pointercancel', release);
    }

    handleDpadPress(direction, isPressed) {
        // Keys overlay active — block d-pad input
        if (UI.isKeysModeEnabled) return;

        const currentMode = State.get('currentMode');

        // Visual feedback
        this.applyDpadVisuals(direction, isPressed);

        if (currentMode === 'menu') {
            if (isPressed) {
                if (this.isMobileWarningMode) {
                    return;
                }

                if (this.isCheatInputMode) {
                    this.feedCheatInput(direction);
                } else {
                    UI.handleMenuNavigation(direction);
                }
            }
        } else if (currentMode === 'rom') {
            const keyMap = {
                'up': 38,
                'down': 40,
                'left': 37,
                'right': 39
            };

            this.sendGameButton(keyMap[direction], isPressed);
        }
    }

    sendGameButton(keyCode, isPressed) {
        if (!State.get('isGameLoaded')) return;

        const buttonMap = {
            39: 0,  // Right
            37: 1,  // Left
            38: 2,  // Up
            40: 3,  // Down
            90: 4,  // A
            88: 5,  // B
            16: 6,  // Select
            13: 7   // Start
        };

        const buttonIndex = buttonMap[keyCode];
        if (buttonIndex !== undefined) {
            if (typeof GameBoyJoyPadEvent === 'function') {
                GameBoyJoyPadEvent(buttonIndex, isPressed);
            } else if (window.gameboy?.JoyPadEvent) {
                window.gameboy.JoyPadEvent(buttonIndex, isPressed);
            }
        }
    }

    enterCheatInputMode() {
        if (State.get('romsUnlocked')) return;
        // Open overlay — isCheatInputMode set by event listener
        UI.openCheatOverlay();
    }

    exitCheatInputMode() {
        // Close overlay — isCheatInputMode cleared by event listener
        UI.closeCheatOverlay();
    }

    feedCheatInput(input) {
        if (State.get('romsUnlocked')) return;

        // Buffer approach: record every input, fill dots, auto-submit when buffer is full
        this.cheatBuffer.push(input);
        UI.updateCheatProgress(this.cheatBuffer.length);

        if (this.cheatBuffer.length === this.cheatSequence.length) {
            setTimeout(() => this.tryActivateCheat(), 200);
        }
    }

    tryActivateCheat() {
        if (State.get('romsUnlocked')) return;

        // Compare buffer against expected sequence
        const correct = this.cheatBuffer.length === this.cheatSequence.length &&
            this.cheatBuffer.every((v, i) => v === this.cheatSequence[i]);

        this.cheatBuffer = [];

        if (correct) {
            this.isCheatInputMode = false;
            this.activateCheatCode();
        } else {
            // Wrong code — shake overlay then close it, return to menu
            const box = DOM.menuContainer?.querySelector('.cheat-overlay-box');
            if (box) {
                box.classList.add('cheat-card-shake');
                setTimeout(() => {
                    UI.closeCheatOverlay();
                }, 600);
            } else {
                UI.closeCheatOverlay();
            }
        }
    }

    activateCheatCode() {
        State.set('romsUnlocked', true);
        this.cheatBuffer = [];

        // Show success message inside overlay
        UI.showCheatSuccess();

        setTimeout(async () => {
            const roms = await scanROMs();

            // Reset selection to the first item (likely the first ROM)
            State.set('selectedROMIndex', 0);
            State.set('selectedActionIndex', 0);

            State.set('romList', roms);
        }, 1500);
    }
}

export const Input = new InputManager();
