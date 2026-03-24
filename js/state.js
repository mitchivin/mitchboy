/**
 * Centralized state management — single source of truth for all app state.
 */
class StateManager {
    constructor() {
        this.data = {
            currentMode: 'menu',       // 'menu' | 'rom'
            gbEmulator: null,
            isGameLoaded: false,
            currentGame: null,
            isUploadedGame: false,
            selectedROMIndex: 0,
            selectedActionIndex: 0,
            romList: [],
            romsUnlocked: false,
            currentSpeed: 1.0,
            currentVolume: 100,
            mobileWarningShown: false,
        };

        this.listeners = {};
    }

    init() {
        const savedSpeed = localStorage.getItem('gameboy_speed');
        this.data.currentSpeed = savedSpeed !== null ? parseFloat(savedSpeed) : 1.0;
        if (savedSpeed === null) localStorage.setItem('gameboy_speed', '1');

        const savedVolume = localStorage.getItem('gameboy_volume');
        this.data.currentVolume = savedVolume !== null ? parseInt(savedVolume) : 100;
        if (savedVolume === null) localStorage.setItem('gameboy_volume', '100');
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        const oldValue = this.data[key];
        this.data[key] = value;
        this.listeners[key]?.forEach(cb => cb(value, oldValue));
    }

    on(key, callback) {
        if (!this.listeners[key]) this.listeners[key] = [];
        this.listeners[key].push(callback);
    }
}

export const State = new StateManager();
