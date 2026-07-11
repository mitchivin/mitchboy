/**
 * Centralized state management — single source of truth for all app state.
 */
class StateManager {
  constructor() {
    this.data = {
      currentMode: 'menu', // 'menu' | 'rom'
      isGameLoaded: false,
      currentGame: null,
      isUploadedGame: false,
      selectedROMIndex: 0,
      romList: [],
      menuView: 'main', // 'main' | 'games' | 'about' | 'socials' | 'settings'
      romsUnlocked: false,
      currentSpeed: 1.0,
      currentVolume: 100,
    };

    this.listeners = {};
  }

  init() {
    const savedSpeed = localStorage.getItem('gameboy_speed');
    this.data.currentSpeed = savedSpeed !== null ? parseFloat(savedSpeed) : 1.0;
    if (savedSpeed === null) localStorage.setItem('gameboy_speed', '1');

    // Volume is session-only: sound prompt sets 100 (Yes) or 0 (No) each boot.
    this.data.currentVolume = 100;
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    const oldValue = this.data[key];
    this.data[key] = value;
    this.listeners[key]?.forEach((cb) => cb(value, oldValue));
  }

  on(key, callback) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(callback);
  }
}

export const State = new StateManager();
