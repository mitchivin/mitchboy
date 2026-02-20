/**
 * Centralized state management
 * Single source of truth for all app state
 */

class StateManager {
    constructor() {
        this.data = {
            // Mode
            currentMode: 'menu', // 'menu' or 'rom'

            // Emulator
            gbEmulator: null,
            isGameLoaded: false,
            currentGame: null,
            isUploadedGame: false, // Track if current game is uploaded vs library

            // Menu navigation
            selectedROMIndex: 0,
            selectedActionIndex: 0, // 0: Play/Eject
            romList: [],
            romsUnlocked: false, // Track if cheat code has been entered

            // Settings
            currentSpeed: 1.0,
            currentVolume: 100,

            // UI State
            mobileWarningShown: false
        };

        this.listeners = {};
    }

    init() {
        // Load saved settings - ensure defaults are 1.0 for speed and 100 for volume
        const savedSpeed = localStorage.getItem('gameboy_speed');
        if (savedSpeed !== null) {
            this.data.currentSpeed = parseFloat(savedSpeed);
        } else {
            // Set default and save it
            this.data.currentSpeed = 1.0;
            localStorage.setItem('gameboy_speed', '1');
        }

        const savedVolume = localStorage.getItem('gameboy_volume');
        if (savedVolume !== null) {
            this.data.currentVolume = parseInt(savedVolume);
        } else {
            // Set default and save it
            this.data.currentVolume = 100;
            localStorage.setItem('gameboy_volume', '100');
        }
    }

    /**
     * Get state value
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Set state value and notify listeners
     */
    set(key, value) {
        const oldValue = this.data[key];
        this.data[key] = value;

        // Notify listeners
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value, oldValue));
        }
    }

    /**
     * Listen for state changes
     */
    on(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }
}

export const State = new StateManager();
