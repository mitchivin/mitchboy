/**
 * UI Management - handles all visual updates
 * No business logic, just DOM manipulation
 */

import { State } from './state.js';
import { DOM } from './dom.js';
import { Emulator } from './emulator.js';

const SPEED_OPTIONS = [1, 2, 3, 4];
const VOLUME_OPTIONS = [0, 33, 66, 100];

class UIManager {
    init() {
        // Listen for state changes
        State.on('currentMode', () => {
            this.updatePowerVisuals();
            this.updateModeVisuals();
        });
        State.on('selectedROMIndex', () => this.updateMenuSelection());
        State.on('selectedActionIndex', () => this.updateMenuSelection());
        State.on('currentGame', () => {
            this.updatePlayButtons();
            if (State.get('currentMode') === 'rom') this._updateHeader();
        });
        State.on('isGameLoaded', () => {
            this.updatePlayButtons();
            this.updateModeVisuals();
        });

        // Always ensure ROM list is rendered
        State.on('romList', (list) => {
            this.renderROMList(list || []);
        });

        // Initial render
        this.updatePowerVisuals();
        this.updateModeVisuals();

        // Render current list
        const currentList = State.get('romList') || [];
        this.renderROMList(currentList);

        // Listen for speed/volume changes to update footer stats
        State.on('currentSpeed', () => this._updateFooterStats());
        State.on('currentVolume', () => this._updateFooterStats());

        // Sync initial keys status & footer
        this.setKeysMode(this.isKeysModeEnabled);

        // Re-center selected card on window resize
        this._resizeObserver = new ResizeObserver(() => {
            if (State.get('currentMode') !== 'menu') return;

            if (this._resizeSelectionRAF !== null) {
                cancelAnimationFrame(this._resizeSelectionRAF);
            }

            this._resizeSelectionRAF = requestAnimationFrame(() => {
                this._resizeSelectionRAF = null;
                this.updateMenuSelection(true);
            });
        });
        const carouselParent = DOM.carousel?.parentElement;
        if (carouselParent) {
            this._resizeObserver.observe(carouselParent);
        }
    }

    _updateHeader() {
        if (!DOM.header) return;
        const mode = State.get('currentMode');
        const isMobile = this.isMobile();

        if (mode !== 'rom') {
            document.body.classList.remove('rom-controls-active');
            DOM.header.classList.add('is-corner');
            DOM.header.classList.remove('is-controls');
            DOM.header.innerHTML = `
                <span class="corner-label corner-top-left">Game Boy Color</span>
                <span class="corner-label corner-top-right">Preset 1</span>
            `;
            return;
        }

        document.body.classList.add('rom-controls-active');
        DOM.header.classList.remove('is-corner');
        DOM.header.classList.add('is-controls');

        if (isMobile) {
            DOM.header.innerHTML = `
                <span class="header-menu-btn footer-interactive">Home</span>
            `;
        } else {
            DOM.header.innerHTML = `
                <span class="header-menu-btn footer-interactive">Home</span>
                <span class="sep">·</span>
                <span class="header-save-btn footer-interactive">Save</span>
                <span class="sep">·</span>
                <span class="header-load-btn footer-interactive">Load</span>
            `;
        }

        DOM.header.querySelector('.header-menu-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMode();
        });
        DOM.header.querySelector('.header-save-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            Emulator.saveState();
        });
        DOM.header.querySelector('.header-load-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            Emulator.loadState();
        });
    }

    _updateFooterStats() {
        if (!DOM.footer) return;

        const mode = State.get('currentMode');

        if (mode !== 'rom') {
            DOM.footer.classList.add('is-corner');
            DOM.footer.classList.remove('is-controls');
            DOM.footer.innerHTML = `
                <span class="corner-label corner-bottom-left">built in <a href="https://doodledev.app" target="_blank" rel="noopener noreferrer">doodledev</a></span>
                <span class="corner-label corner-bottom-right">by <a href="https://mitchivin.com/" target="_blank" rel="noopener noreferrer">Mitch Ivin</a></span>
            `;
            return;
        }

        DOM.footer.classList.remove('is-corner');
        DOM.footer.classList.add('is-controls');

        const speed = State.get('currentSpeed');
        const volume = State.get('currentVolume');
        const keys = this.isKeysModeEnabled;
        const isMobile = this.isMobile();

        if (isMobile) {
            DOM.footer.innerHTML = `
                <span><span class="speed-btn footer-interactive">${speed}x</span> Speed</span>
                <span class="sep secondary">·</span>
                <span><span class="volume-btn footer-interactive">${volume}%</span> Volume</span>
            `;
        } else {
            DOM.footer.innerHTML = `
                <span>Keys <span class="keys-btn footer-interactive">${keys ? 'On' : 'Off'}</span></span>
                <span class="sep secondary">·</span>
                <span><span class="speed-btn footer-interactive">${speed}x</span> Speed</span>
                <span class="sep secondary">·</span>
                <span><span class="volume-btn footer-interactive">${volume}%</span> Volume</span>
            `;
        }

        // Bind interactive elements
        const keysBtn = DOM.footer.querySelector('.keys-btn');
        const speedBtn = DOM.footer.querySelector('.speed-btn');
        const volumeBtn = DOM.footer.querySelector('.volume-btn');

        if (keysBtn) keysBtn.onclick = (e) => { e.stopPropagation(); this.toggleKeysMode(); };
        if (speedBtn) speedBtn.onclick = (e) => {
            e.stopPropagation();
            const current = State.get('currentSpeed');
            const next = SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(current) + 1) % SPEED_OPTIONS.length];
            Emulator.setSpeed(next);
        };
        if (volumeBtn) volumeBtn.onclick = (e) => {
            e.stopPropagation();
            const current = State.get('currentVolume');
            const next = VOLUME_OPTIONS[(VOLUME_OPTIONS.indexOf(current) + 1) % VOLUME_OPTIONS.length];
            Emulator.setVolume(next);
        };
    }

    toggleMode() {
        const currentMode = State.get('currentMode');
        const isGameLoaded = State.get('isGameLoaded');

        // Can only switch to ROM mode if a game is loaded
        if (currentMode === 'menu') {
            if (!isGameLoaded) {
                // No game loaded, can't switch to game screen
                return;
            }
            State.set('currentMode', 'rom');
        } else {
            // Always allow going back to menu — turn off keys overlay
            this.setKeysMode(false);

            // Pause emulation immediately before switching to menu to reduce UI contention
            if (State.get('isGameLoaded')) {
                if (typeof window.pause === 'function' && typeof window.GameBoyEmulatorPlaying === 'function') {
                    if (window.GameBoyEmulatorPlaying()) {
                        window.pause();
                    }
                }
            }

            State.set('currentMode', 'menu');
        }
    }

    updatePowerVisuals() {
        const currentMode = State.get('currentMode');

        // Power LED - Always ON
        if (DOM.powerLED) {
            const fillPath = DOM.powerLED.querySelector('.fill-path');
            const strokePath = DOM.powerLED.querySelector('.stroke-path');

            DOM.powerLED.classList.remove('led-on', 'led-on-menu');

            if (currentMode === 'menu') {
                DOM.powerLED.classList.add('led-on-menu');
                if (fillPath) fillPath.setAttribute('fill', 'url(#grad-yellow)');
                if (strokePath) strokePath.setAttribute('stroke', 'url(#stroke-grad-yellow)');
            } else {
                DOM.powerLED.classList.add('led-on');
                if (fillPath) fillPath.setAttribute('fill', 'url(#grad-41)');
                if (strokePath) strokePath.setAttribute('stroke', 'url(#stroke-grad-41)');
            }
            // Reset filter when on
            DOM.powerLED.style.filter = '';
            DOM.powerLED.style.opacity = '1';
        }

        // Screen is always interactive and transparent (no off overlay)
        if (DOM.screenGlare) {
            DOM.screenGlare.style.pointerEvents = 'none';
        }
        if (DOM.screenMain) {
            DOM.screenMain.style.pointerEvents = 'none';
            const path = DOM.screenMain.querySelector('.fill-path');
            if (path) {
                path.setAttribute('fill', 'none');
            }
        }

        // Tooltip visibility is now controlled exclusively by setKeysMode()

    }

    updateModeVisuals() {
        const currentMode = State.get('currentMode');

        // Power is always on, so we only handle mode switching

        // Show correct container and controls
        if (currentMode === 'rom') {
            this.closeCheatOverlay();

            // Resume the game when entering ROM mode — only if not already playing
            if (typeof window.run === 'function' && State.get('isGameLoaded')) {
                if (typeof window.GameBoyEmulatorPlaying !== 'function' || !window.GameBoyEmulatorPlaying()) {
                    window.run();
                }
            }

            if (DOM.romContainer) {
                DOM.romContainer.classList.remove('hidden');
                DOM.romContainer.style.display = 'flex'; // Force display (was set to none by mountToShadow)
                DOM.romContainer.style.pointerEvents = 'auto';
            }
            if (DOM.menuContainer) {
                DOM.menuContainer.classList.add('hidden');
                DOM.menuContainer.style.display = 'none';
            }
        } else {
            if (DOM.romContainer) DOM.romContainer.style.display = 'none';
            if (DOM.menuContainer) {
                DOM.menuContainer.style.display = 'block';
                DOM.menuContainer.classList.remove('hidden');
            }
            // Re-center carousel when menu becomes visible
            requestAnimationFrame(() => {
                this.updateMenuSelection(true);
            });
        }

        // Update Page Header/Footer
        if (DOM.header) this._updateHeader();
        if (DOM.footer) this._updateFooterStats();
    }

    renderROMList(roms) {
        if (!DOM.carousel) {
            console.error('[UI] Carousel not found! Aborting render.');
            return;
        }

        DOM.carousel.innerHTML = '';

        let currentIndex = 0;

        // 1. ROM Cards
        if (State.get('romsUnlocked') && roms.length > 0) {
            roms.forEach((rom) => {
                const card = this.createROMCard(rom, currentIndex);
                DOM.carousel.appendChild(card);
                currentIndex++;
            });
        }

        // 2. Cheat Card - Hide once unlocked
        if (!State.get('romsUnlocked')) {
            const cheatCard = this.createCheatCard(currentIndex);
            DOM.carousel.appendChild(cheatCard);
            currentIndex++;
        }

        // 3. Upload Card (desktop only)
        if (!this.isMobile()) {
            const uploadCard = this.createUploadCard(currentIndex);
            DOM.carousel.appendChild(uploadCard);
            currentIndex++;
        }

        // 4. Info Card (Try DoodleDev) - At the bottom
        const infoCard = this.createInfoCard();
        DOM.carousel.appendChild(infoCard);

        // Trigger centering after cards are rendered
        this._lastSelectedIndex = -1;
        this._lastSelectedAction = -1;
        this.updateMenuSelection(true);
    }

    createCheatCard(index) {
        const card = document.createElement('div');
        card.className = 'rom-card cheat-card';
        card.dataset.index = index;
        card.dataset.cheat = 'true';

        const isUnlocked = State.get('romsUnlocked');

        card.innerHTML = `
            <div class="rom-card-header">
                <div class="rom-card-title">CHEAT CODE</div>
            </div>
            <div class="rom-card-body">
                <div class="rom-card-body-text">${isUnlocked ? 'All cheats active. God mode.' : 'Enter the cheat code to unlock all features.'}</div>
            </div>
            <div class="card-action-row">
                <div class="card-btn card-btn-play cheat-enter-btn ${isUnlocked ? 'unlocked-btn' : ''}">
                    ${isUnlocked ? 'UNLOCKED \u2713' : 'ENTER CODE'}
                </div>
            </div>
        `;

        const enterBtn = card.querySelector('.cheat-enter-btn');
        if (!isUnlocked) {
            enterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openCheatOverlay();
            });
        }

        card.addEventListener('click', () => {
            State.set('selectedROMIndex', index);
            State.set('selectedActionIndex', 0);
        });

        return card;
    }

    openCheatOverlay() {
        // Don't open if already open or already unlocked
        if (DOM.menuContainer?.querySelector('#cheat-overlay') || State.get('romsUnlocked')) return;

        const CHEAT_SEQUENCE = ['up', 'down', 'left', 'right', 'b', 'down', 'up'];
        const menuContainer = DOM.menuContainer;
        if (!menuContainer) return;

        const overlay = document.createElement('div');
        overlay.id = 'cheat-overlay';
        overlay.innerHTML = `
            <div class="cheat-overlay-box">
                <div class="cheat-overlay-view-default">
                    <div class="cheat-overlay-title">ENTER CODE</div>
                    <div class="cheat-overlay-dots">
                        ${CHEAT_SEQUENCE.map((_, i) => `<div class="cheat-dot" data-step="${i}"></div>`).join('')}
                    </div>
                </div>
                <div class="cheat-overlay-view-success">
                    <div class="cheat-overlay-success-text">CHEAT CODE SUCCESS</div>
                </div>
            </div>
        `;

        menuContainer.appendChild(overlay);

        // Start the header/footer code hint animation
        this._startCheatHint(CHEAT_SEQUENCE);

        // Signal to input.js that overlay is open
        window.dispatchEvent(new CustomEvent('cheat-overlay-opened'));
    }

    closeCheatOverlay() {
        const overlay = DOM.menuContainer?.querySelector('#cheat-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 200);
        }

        // Stop the header/footer code hint animation
        this._stopCheatHint();

        window.dispatchEvent(new CustomEvent('cheat-overlay-closed'));
    }

    updateCheatProgress(progress) {
        const dots = DOM.menuContainer?.querySelectorAll('#cheat-overlay .cheat-dot') || [];
        dots.forEach((dot, i) => {
            dot.classList.toggle('cheat-dot-filled', i < progress);
        });
    }

    showCheatSuccess() {
        const box = DOM.menuContainer?.querySelector('.cheat-overlay-box');
        if (box) {
            box.classList.add('is-success');

            // Auto-close overlay after message is seen
            setTimeout(() => {
                this.closeCheatOverlay();
            }, 1800);
        }
    }

    _startCheatHint(sequence) {
        const arrowSVG = {
            up: `<svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><polygon points="7,0 14,12 0,12"/></svg>`,
            down: `<svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><polygon points="7,12 14,0 0,0"/></svg>`,
            left: `<svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor"><polygon points="0,7 12,0 12,14"/></svg>`,
            right: `<svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor"><polygon points="12,7 0,0 0,14"/></svg>`,
        };
        const symbolMap = { a: 'A', b: 'B', select: 'SEL', start: 'STR' };
        const symbols = sequence.map(s => arrowSVG[s] ? { html: arrowSVG[s] } : { text: symbolMap[s] || s });
        const header = DOM.header;
        const footer = DOM.footer;
        if (!header || !footer) return;

        if (this._cheatHintTimers) {
            this._cheatHintTimers.forEach(t => clearTimeout(t));
        }
        if (this._cheatHintElements) {
            this._cheatHintElements.forEach(el => el.remove());
        }

        // Fade out original content
        header.classList.add('cheat-hint-active');
        footer.classList.add('cheat-hint-active');

        // Store cleanup refs
        this._cheatHintTimers = [];
        this._cheatHintElements = [];

        const isCornerMode = header.classList.contains('is-corner') && footer.classList.contains('is-corner');

        let corners;
        if (isCornerMode) {
            const edge = this.isMobile() ? '14px' : '24px';
            corners = [
                { target: document.body, fixed: true, top: edge, left: edge },
                { target: document.body, fixed: true, top: edge, right: edge },
                { target: document.body, fixed: true, bottom: edge, right: edge },
                { target: document.body, fixed: true, bottom: edge, left: edge },
            ];
        } else {
            // Corner positions cycle: header-left, header-right, footer-right, footer-left
            corners = [
                { target: header, left: '10%' },
                { target: header, left: '90%' },
                { target: footer, left: '90%' },
                { target: footer, left: '10%' },
            ];
        }

        const showDuration = 1000;
        const fadeDuration = 300;
        const stepInterval = showDuration + fadeDuration;

        symbols.forEach((sym, i) => {
            const corner = corners[i % corners.length];
            const delay = 600 + i * stepInterval;
            let hintEl = null;

            const showTimer = setTimeout(() => {
                const span = document.createElement('span');
                span.className = 'cheat-hint-char';
                hintEl = span;
                if (sym.html) {
                    span.innerHTML = sym.html;
                    span.style.display = 'inline-flex';
                    span.style.alignItems = 'center';
                    span.style.justifyContent = 'center';
                } else {
                    span.textContent = sym.text;
                }

                if (corner.fixed) {
                    span.classList.add('cheat-hint-char-fixed');
                    if (corner.top) span.style.top = corner.top;
                    if (corner.bottom) span.style.bottom = corner.bottom;
                    if (corner.left) span.style.left = corner.left;
                    if (corner.right) span.style.right = corner.right;
                } else {
                    span.style.left = corner.left;
                }

                corner.target.appendChild(span);
                this._cheatHintElements.push(span);

                span.offsetHeight;
                span.classList.add('cheat-hint-char-in');
            }, delay);

            const hideTimer = setTimeout(() => {
                if (hintEl && hintEl.isConnected) {
                    hintEl.classList.add('cheat-hint-char-out');
                    setTimeout(() => hintEl.remove(), fadeDuration);
                }
            }, delay + showDuration);

            this._cheatHintTimers.push(showTimer, hideTimer);
        });

        // After last symbol finishes, wait 3s then loop
        const totalDuration = 600 + symbols.length * stepInterval + 500;
        const fadeTimer = setTimeout(() => {
            this._cheatHintElements.forEach(el => el.remove());
            this._cheatHintElements = [];

            // Restart the loop after 3 seconds
            const restartTimer = setTimeout(() => {
                if (DOM.menuContainer?.querySelector('#cheat-overlay')) {
                    this._startCheatHint(sequence);
                }
            }, 3000);
            // Guard: timers may be null if overlay closed during the gap
            this._cheatHintTimers?.push(restartTimer);
        }, totalDuration);
        this._cheatHintTimers.push(fadeTimer);
    }

    _stopCheatHint() {
        // Clear all timers
        if (this._cheatHintTimers) {
            this._cheatHintTimers.forEach(t => clearTimeout(t));
            this._cheatHintTimers = null;
        }

        // Remove all hint characters
        if (this._cheatHintElements) {
            this._cheatHintElements.forEach(el => el.remove());
            this._cheatHintElements = null;
        }

        // Also clean up any stray hint chars
        document.querySelectorAll('.cheat-hint-char').forEach(el => el.remove());

        // Fade original content back in
        DOM.header?.classList.remove('cheat-hint-active');
        DOM.footer?.classList.remove('cheat-hint-active');
    }

    isMobile() {
        const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(navigator.userAgent || '');
        const uaDataMobile = navigator.userAgentData?.mobile === true;
        const touchPoints = (navigator.maxTouchPoints || 0) > 0;
        const coarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
        return uaDataMobile || uaMobile || (touchPoints && coarsePointer);
    }

    maybeShowMobileWarningOnLoad() {
        if (!this.isMobile()) return;
        if (State.get('mobileWarningShown')) return;

        // Delay to ensure all startup listeners are attached before opening.
        setTimeout(() => {
            if (!document.querySelector('#mobile-warning-overlay')) {
                this.openMobileWarning(() => { });
            }
        }, 0);
    }

    closeMobileWarning(shouldProceed = false) {
        const overlay = document.querySelector('#mobile-warning-overlay');
        if (!overlay) return;

        const onConfirm = this._mobileWarningOnConfirm;
        this._mobileWarningOnConfirm = null;

        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.remove();

            if (shouldProceed) {
                if (onConfirm) onConfirm();
            }

            window.dispatchEvent(new CustomEvent('mobile-warning-closed'));
        }, 300);
    }

    openMobileWarning(onConfirm) {
        State.set('mobileWarningShown', true);
        if (onConfirm) onConfirm();
        return;
    }

    createUploadCard(index) {
        const card = document.createElement('div');
        card.className = 'rom-card';
        card.dataset.index = index;
        card.dataset.upload = 'true';

        const currentGame = State.get('currentGame');
        const isGameLoaded = State.get('isGameLoaded');
        const isUploadedGame = State.get('isUploadedGame');
        const hasUploadedGame = currentGame && isGameLoaded && isUploadedGame;

        card.innerHTML = `
            <div class="rom-card-header">
                <div class="rom-card-title">${hasUploadedGame ? currentGame : 'UPLOAD ROM'}</div>
            </div>
            <div class="rom-card-body">
                <div class="rom-card-icon">
                    📁
                </div>
            </div>
            <div class="card-action-row">
                ${hasUploadedGame ? '<div class="card-btn card-btn-play return-btn">RETURN</div>' : ''}
                <div class="card-btn card-btn-play ${hasUploadedGame ? 'eject-btn' : 'upload-btn'}">
                    ${hasUploadedGame ? 'EJECT' : 'UPLOAD'}
                </div>
            </div>
        `;

        const returnBtnEl = card.querySelector('.return-btn');
        if (returnBtnEl) {
            returnBtnEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMode();
            });
        }

        const actionBtn = card.querySelector('.upload-btn, .eject-btn');
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentGame = State.get('currentGame');
            const isGameLoaded = State.get('isGameLoaded');
            const isUploadedGame = State.get('isUploadedGame');
            const hasUploadedGame = currentGame && isGameLoaded && isUploadedGame;

            if (hasUploadedGame) {
                Emulator.eject();
            } else {
                if (DOM.romFileInput) {
                    const handleUpload = () => {
                        DOM.romFileInput.click();
                    };

                    if (this.isMobile() && !State.get('mobileWarningShown')) {
                        this.openMobileWarning(handleUpload);
                    } else {
                        handleUpload();
                    }
                }
            }
        });

        card.addEventListener('click', () => {
            State.set('selectedROMIndex', 0);
            State.set('selectedActionIndex', 0);
        });

        return card;
    }

    createROMCard(rom, index) {
        const card = document.createElement('div');
        card.className = 'rom-card';
        card.dataset.index = index;
        card.dataset.romName = rom.name.replace(/\.gbc?$/i, '');
        card.dataset.romPath = rom.url ?? rom.path;

        const title = rom.name.replace(/\.gbc?$/i, '');
        const isCurrentGame = State.get('currentGame') === title;
        const isGameLoaded = State.get('isGameLoaded');
        const isThisGameLoaded = isCurrentGame && isGameLoaded;

        // Try to find a matching image in public folder
        const imageName = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with single dash
            .replace(/^-+|-+$/g, '');      // Remove leading/trailing dashes
        const imagePath = `public/${imageName}.png`;

        card.innerHTML = `
            <div class="rom-card-body">
                <div class="rom-card-icon rom-card-icon--fill" style="background: none; overflow: hidden;">
                    <img src="${imagePath}" alt="${title}" 
                         loading="lazy" decoding="async"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" 
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px; display: block;">
                    <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 22cqw;">🎮</div>
                </div>
            </div>
            <div class="card-action-row">
                ${isCurrentGame ? '<div class="card-btn card-btn-play return-btn">RETURN</div>' : ''}
                <div class="card-btn card-btn-play ${isCurrentGame ? 'eject-btn' : 'play-btn'}">
                    ${isCurrentGame ? 'EJECT' : 'PLAY'}
                </div>
            </div>
        `;

        // Event handlers - check current state dynamically
        const returnBtnEl = card.querySelector('.return-btn');
        if (returnBtnEl) {
            returnBtnEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMode();
            });
        }

        const playBtn = card.querySelector('.play-btn, .eject-btn');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentGame = State.get('currentGame');
            const romTitle = card.dataset.romName;

            if (currentGame === romTitle) {
                Emulator.eject();
            } else {
                const handlePlay = () => {
                    Emulator.loadFromPath(card.dataset.romPath);
                };

                if (this.isMobile() && !State.get('mobileWarningShown')) {
                    this.openMobileWarning(handlePlay);
                } else {
                    handlePlay();
                }
            }
        });

        card.addEventListener('click', () => {
            State.set('selectedROMIndex', index);
            State.set('selectedActionIndex', 0);
        });

        return card;
    }

    createInfoCard() {
        const card = document.createElement('div');
        card.className = 'rom-card info-card';
        card.dataset.info = 'true';

        // Calculate the index based on current cards
        const currentCards = DOM.carousel?.querySelectorAll('.rom-card').length || 0;
        card.dataset.index = currentCards;

        card.innerHTML = `
            <div class="rom-card-header">
                <div class="rom-card-title">ABOUT</div>
            </div>
            <div class="rom-card-body">
                <div class="rom-card-body-text">Game Boy Color shell built in DoodleDev. Emulator core by Grant Galitz.</div>
            </div>
            <div class="card-action-row">
                <div class="card-btn card-btn-play info-btn">
                    DOODLEDEV
                </div>
                <div class="card-btn card-btn-play github-btn">
                    EMULATOR
                </div>
            </div>
        `;

        const openUrl = (url) => {
            if (typeof window.electronAPI?.openExternal === 'function') {
                window.electronAPI.openExternal(url);
            } else if (typeof window.require === 'function') {
                try {
                    const { shell } = window.require('electron');
                    shell.openExternal(url);
                } catch (err) {
                    window.open(url, '_blank');
                }
            } else {
                window.open(url, '_blank');
            }
        };

        const infoBtn = card.querySelector('.info-btn');
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openUrl('https://doodledev.app');
        });

        const githubBtn = card.querySelector('.github-btn');
        githubBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openUrl('https://github.com/taisel/GameBoy-Online');
        });

        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index);
            State.set('selectedROMIndex', index);
            State.set('selectedActionIndex', 0);
        });

        return card;
    }

    updateMenuSelection(force = false) {
        if (State.get('currentMode') !== 'menu') return;

        const cards = DOM.carousel?.querySelectorAll('.rom-card');
        if (!cards || cards.length === 0) return;

        const selectedIndex = State.get('selectedROMIndex');
        const selectedAction = State.get('selectedActionIndex');

        // Clamp index
        if (selectedIndex >= cards.length) {
            State.set('selectedROMIndex', cards.length - 1);
            return;
        }

        const previousIndex = this._lastSelectedIndex;
        const previousAction = this._lastSelectedAction;

        if (!force && previousIndex === selectedIndex && previousAction === selectedAction) {
            return;
        }

        if (previousIndex >= 0 && cards[previousIndex]) {
            const previousCard = cards[previousIndex];
            previousCard.dataset.selected = 'false';
            previousCard.querySelectorAll('.card-btn').forEach(btn => {
                btn.dataset.active = 'false';
            });
        }

        const selectedCard = cards[selectedIndex];
        if (!selectedCard) return;

        selectedCard.dataset.selected = 'true';
        selectedCard.querySelectorAll('.card-btn').forEach(btn => {
            btn.dataset.active = 'false';
        });
        const activeBtn = this.getButtonAtIndex(selectedCard, selectedAction);
        if (activeBtn) activeBtn.dataset.active = 'true';

        this._lastSelectedIndex = selectedIndex;
        this._lastSelectedAction = selectedAction;

        if (this._menuSelectionRAF !== null) {
            cancelAnimationFrame(this._menuSelectionRAF);
        }

        this._menuSelectionRAF = requestAnimationFrame(() => {
            this._menuSelectionRAF = null;

            const carouselContainer = DOM.carousel?.parentElement;
            if (!selectedCard || !DOM.carousel || !carouselContainer) return;

            const containerCenter = carouselContainer.offsetHeight / 2;
            const cardOffsetTop = selectedCard.offsetTop;
            const cardHeight = selectedCard.offsetHeight;
            const cardCenter = cardOffsetTop + (cardHeight / 2);
            const translateY = containerCenter - cardCenter;

            DOM.carousel.style.transform = `translateY(${translateY}px)`;
            DOM.carousel.style.opacity = '1';
        });
    }

    handleMenuNavigation(direction) {
        if (State.get('currentMode') !== 'menu') return;

        const cards = DOM.carousel?.querySelectorAll('.rom-card');
        if (!cards || cards.length === 0) return;

        let selectedIndex = State.get('selectedROMIndex');
        let selectedAction = State.get('selectedActionIndex');

        // UP/DOWN navigate between cards
        if (direction === 'up') {
            selectedIndex = Math.max(0, selectedIndex - 1);
            selectedAction = 0; // Reset to Play button
        } else if (direction === 'down') {
            selectedIndex = Math.min(cards.length - 1, selectedIndex + 1);
            selectedAction = 0; // Reset to Play button
        }
        // LEFT/RIGHT navigate between buttons on current card
        else if (direction === 'left') {
            const card = cards[selectedIndex];
            let newAction = selectedAction - 1;

            // Keep going left until we find an enabled button or hit the start
            while (newAction >= 0) {
                const btn = this.getButtonAtIndex(card, newAction);
                if (btn && !btn.classList.contains('disabled')) {
                    selectedAction = newAction;
                    break;
                }
                newAction--;
            }
        } else if (direction === 'right') {
            const card = cards[selectedIndex];
            const maxAction = card.querySelectorAll('.card-btn').length - 1;
            let newAction = selectedAction + 1;

            // Keep going right until we find an enabled button or hit the end
            while (newAction <= maxAction) {
                const btn = this.getButtonAtIndex(card, newAction);
                if (btn && !btn.classList.contains('disabled')) {
                    selectedAction = newAction;
                    break;
                }
                newAction++;
            }
        }

        State.set('selectedROMIndex', selectedIndex);
        State.set('selectedActionIndex', selectedAction);
    }

    getButtonAtIndex(card, index) {
        const btns = card.querySelectorAll('.card-btn');
        return btns[index] ?? null;
    }

    activateMenuItem() {
        if (State.get('currentMode') !== 'menu') return;

        const cards = DOM.carousel?.querySelectorAll('.rom-card');
        const selectedIndex = State.get('selectedROMIndex');
        const selectedAction = State.get('selectedActionIndex');

        const card = cards?.[selectedIndex];
        if (!card) return;

        const btn = this.getButtonAtIndex(card, selectedAction);
        if (btn) btn.click();
    }

    isKeysModeEnabled = false;
    _menuSelectionRAF = null;
    _resizeSelectionRAF = null;
    _lastSelectedIndex = -1;
    _lastSelectedAction = -1;

    setKeysMode(enabled) {
        this.isKeysModeEnabled = enabled;
        window.dispatchEvent(new CustomEvent('keys-mode-changed', { detail: { enabled } }));

        // Show/hide keyboard shortcut labels
        const labels = document.querySelectorAll('.key-internal-label');
        labels.forEach(label => {
            label.style.opacity = enabled ? '1' : '0';
            label.style.pointerEvents = enabled ? 'auto' : 'none';
        });

        this._updateFooterStats();
    }

    toggleKeysMode() {
        this.setKeysMode(!this.isKeysModeEnabled);
    }

    updatePlayButtons() {
        const cards = DOM.carousel?.querySelectorAll('.rom-card');
        if (!cards) return;

        const currentGame = State.get('currentGame');
        const isGameLoaded = State.get('isGameLoaded');
        const isUploadedGame = State.get('isUploadedGame');

        cards.forEach(card => {
            const isUploadCard = card.dataset.upload === 'true';
            const romTitle = card.dataset.romName;
            const playBtn = card.querySelector('.play-btn, .eject-btn, .upload-btn');

            if (!playBtn) return;

            const actionRow = card.querySelector('.card-action-row');
            const existingReturnBtn = card.querySelector('.return-btn');

            if (isUploadCard) {
                // Update upload card - only show game if it's uploaded
                const titleEl = card.querySelector('.rom-card-title');
                const hasUploadedGame = currentGame && isGameLoaded && isUploadedGame;

                if (titleEl) {
                    titleEl.textContent = hasUploadedGame ? currentGame : 'UPLOAD ROM';
                }

                if (hasUploadedGame) {
                    playBtn.classList.remove('upload-btn', 'play-btn');
                    playBtn.classList.add('eject-btn');
                    playBtn.textContent = 'EJECT';
                } else {
                    playBtn.classList.remove('eject-btn', 'play-btn');
                    playBtn.classList.add('upload-btn');
                    playBtn.textContent = 'UPLOAD';
                }

                // Show/hide return button
                if (hasUploadedGame && !existingReturnBtn) {
                    const returnBtn = document.createElement('div');
                    returnBtn.className = 'card-btn card-btn-play return-btn';
                    returnBtn.textContent = 'RETURN';
                    returnBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMode(); });
                    actionRow.insertBefore(returnBtn, playBtn);
                } else if (!hasUploadedGame && existingReturnBtn) {
                    existingReturnBtn.remove();
                }

            } else {
                // Update regular ROM card
                const isCurrentGame = currentGame === romTitle;

                // Update play/eject button
                if (isCurrentGame) {
                    playBtn.classList.remove('play-btn');
                    playBtn.classList.add('eject-btn');
                    playBtn.textContent = 'EJECT';
                } else {
                    playBtn.classList.remove('eject-btn');
                    playBtn.classList.add('play-btn');
                    playBtn.textContent = 'PLAY';
                }

                // Show/hide return button
                if (isCurrentGame && !existingReturnBtn) {
                    const returnBtn = document.createElement('div');
                    returnBtn.className = 'card-btn card-btn-play return-btn';
                    returnBtn.textContent = 'RETURN';
                    returnBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMode(); });
                    actionRow.insertBefore(returnBtn, playBtn);
                } else if (!isCurrentGame && existingReturnBtn) {
                    existingReturnBtn.remove();
                }

            }
        });
    }

}

export const UI = new UIManager();
