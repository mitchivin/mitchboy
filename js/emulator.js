/**
 * Emulator management - handles GameBoy emulation
 * Clean interface to GameBoy-Online core
 */

import { State } from './state.js';
import { DOM } from './dom.js';

class EmulatorManager {
    init() {
        // Wait for GameBoy core to load
        setTimeout(() => {
            if (typeof window.start === 'undefined') {
                return;
            }

            if (typeof window.GameBoyCore === 'undefined') {
                return;
            }

            // Set initial volume in settings array before any ROM loads
            const initialVolume = State.get('currentVolume');
            if (window.settings) {
                window.settings[3] = initialVolume / 100;
            }

            State.set('gbEmulator', {
                canvas: DOM.screen,
                initialized: true
            });
        }, 500);

        // Setup ROM file input
        if (DOM.romFileInput) {
            DOM.romFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.loadFromFile(file);
            });
        }

        // Setup save state file input
        if (DOM.saveStateInput) {
            DOM.saveStateInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.loadStateFromFile(file);
                e.target.value = ''; // Reset input so same file can be loaded again
            });
        }
    }

    loadFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const title = file.name.replace(/\.gbc?$/i, '');
            State.set('currentGame', title);
            State.set('isUploadedGame', true); // Mark as uploaded
            this.loadROM(e.target.result);
            window.dispatchEvent(new CustomEvent('refresh-rom-list'));
        };
        reader.readAsArrayBuffer(file);
    }

    loadFromPath(filePath) {
        // Treat anything that isn't a Windows absolute path as a web URL
        const isAbsoluteWindowsPath = /^[A-Za-z]:[/\\]/.test(filePath);
        const isURL = !isAbsoluteWindowsPath;

        if (isURL) {
            // Web build: fetch the ROM file as ArrayBuffer
            const fileName = filePath.split(/[/\\]/).pop();
            const title = fileName.replace(/\.gbc?$/i, '');
            State.set('currentGame', title);
            State.set('isUploadedGame', false);

            fetch(filePath)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.arrayBuffer();
                })
                .then(buffer => this.loadROM(buffer))
                .catch(err => {
                    console.error('[Emulator] Failed to fetch ROM:', err);
                    alert('Error loading ROM: ' + err.message);
                });
            return;
        }

        // Electron build: read via Node.js fs
        const fs = window.require?.('fs');
        if (!fs) {
            return;
        }

        try {
            const romData = fs.readFileSync(filePath);
            const fileName = filePath.split(/[/\\]/).pop();
            const title = fileName.replace(/\.gbc?$/i, '');
            State.set('currentGame', title);
            State.set('isUploadedGame', false);
            this.loadROM(romData.buffer);
        } catch (error) {
            console.error('[Emulator] Error loading ROM:', error);
            alert('Error loading ROM: ' + error.message);
        }
    }


    loadROM(romData) {
        const emulator = State.get('gbEmulator');
        if (!emulator?.initialized) {
            console.error('[Emulator] Not initialized');
            return;
        }

        try {
            const romArray = new Uint8Array(romData);
            const chunkSize = 8192;
            let romString = '';
            for (let i = 0; i < romArray.length; i += chunkSize) {
                const chunk = romArray.slice(i, i + chunkSize);
                romString += String.fromCharCode.apply(null, chunk);
            }

            State.set('currentMode', 'rom');

            setTimeout(() => {
                window.start(DOM.screen, romString);
                State.set('isGameLoaded', true);
                this.restoreSettings();

                if (typeof window.initNewCanvas === 'function') {
                    window.initNewCanvas();
                }
            }, 100);
        } catch (error) {
            console.error('[Emulator] Error loading ROM:', error);
            alert('Error loading ROM: ' + error.message);
        }
    }

    eject() {
        if (window.gameboy) {
            if (typeof window.clearLastEmulation === 'function') {
                window.clearLastEmulation();
            }
            window.gameboy = null;
        }

        State.set('isGameLoaded', false);
        State.set('currentGame', null);
        State.set('currentMode', 'menu');

        if (DOM.screen) {
            const ctx = DOM.screen.getContext('2d');
            // Clear to transparent instead of green
            ctx.clearRect(0, 0, DOM.screen.width, DOM.screen.height);
        }

        window.dispatchEvent(new CustomEvent('refresh-rom-list'));
    }

    setSpeed(speed) {
        State.set('currentSpeed', speed);

        if (window.gameboy?.setSpeed) {
            window.gameboy.setSpeed(speed);
        }

        localStorage.setItem('gameboy_speed', speed.toString());
    }

    setVolume(volume) {
        State.set('currentVolume', volume);
        const volumeDecimal = volume / 100;

        // Always set in settings array first
        if (window.settings) {
            window.settings[3] = volumeDecimal;
        }

        // Then update running gameboy if it exists
        if (window.gameboy) {
            if (window.gameboy.changeVolume) {
                window.gameboy.changeVolume();
            } else if (window.gameboy.audioHandle?.changeVolume) {
                window.gameboy.audioHandle.changeVolume(volumeDecimal);
            }
        }

        localStorage.setItem('gameboy_volume', volume.toString());
    }

    restoreSettings() {
        const speed = State.get('currentSpeed');
        const volume = State.get('currentVolume');

        if (window.gameboy) {
            // Only call setSpeed if non-default — start() initialises at 1.0 and
            // setSpeed re-initialises the audio pipeline, so skip the redundant call.
            if (window.gameboy.setSpeed && speed !== 1) {
                window.gameboy.setSpeed(speed);
            }

            const volumeDecimal = volume / 100;
            if (window.settings) {
                window.settings[3] = volumeDecimal;
            }

            if (window.gameboy.changeVolume) {
                window.gameboy.changeVolume();
            } else if (window.gameboy.audioHandle?.changeVolume) {
                window.gameboy.audioHandle.changeVolume(volumeDecimal);
            }
        }
    }

    saveState() {
        if (!window.gameboy || !State.get('isGameLoaded')) return;

        try {
            const saveData = window.gameboy.saveState();
            const gameName = State.get('currentGame') || 'gameboy';
            const fileName = `${gameName}_save.sav`;
            const jsonString = JSON.stringify(saveData);

            // Electron: use native save dialog
            if (typeof window.require === 'function') {
                try {
                    const { ipcRenderer } = window.require('electron');
                    ipcRenderer.invoke('show-save-dialog', fileName).then(filePath => {
                        if (filePath) {
                            const fs = window.require('fs');
                            fs.writeFileSync(filePath, jsonString, 'utf8');
                        }
                    });
                    return;
                } catch (e) { /* fall through to web download */ }
            }

            // Web: trigger browser download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('[Emulator] Save error:', error);
        }
    }

    loadState() {
        if (DOM.saveStateInput) {
            DOM.saveStateInput.click();
        }
    }

    loadStateFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target.result;

                if (!jsonString || jsonString.trim().length === 0) {
                    throw new Error('Save file is empty');
                }

                const saveData = JSON.parse(jsonString);

                if (!Array.isArray(saveData) || saveData.length === 0) {
                    throw new Error('Invalid save state format');
                }

                // Derive game name from filename (strip _save.sav or extension)
                const gameName = file.name.replace(/_save\.sav$/i, '').replace(/\.[^.]+$/, '') || 'Unknown';
                State.set('currentGame', gameName);
                State.set('isUploadedGame', true);

                // Extract ROM from save state
                const romData = saveData[0];
                let romString = '';
                for (let i = 0; i < romData.length; i++) {
                    romString += String.fromCharCode(romData[i]);
                }

                // Switch to gameplay mode first so canvas is visible
                State.set('currentMode', 'rom');

                // Wait for UI update, then load
                setTimeout(() => {
                    if (typeof window.clearLastEmulation === 'function') {
                        window.clearLastEmulation();
                    }

                    window.start(DOM.screen, romString);
                    window.gameboy.returnFromState(saveData);
                    State.set('isGameLoaded', true);
                }, 100);
            } catch (error) {
                console.error('[Emulator] Load state error:', error);
                alert('Error loading state: ' + (error instanceof SyntaxError ? 'File is corrupted' : error.message));
            }
        };
        reader.onerror = () => alert('Error reading save file');
        reader.readAsText(file);
    }
}

export const Emulator = new EmulatorManager();
