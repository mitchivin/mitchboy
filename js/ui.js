/**
 * UI Management - handles all visual updates
 * No business logic, just DOM manipulation
 */

import { State } from './state.js';
import { DOM } from './dom.js';
import { isMobileDevice } from './device.js';
import { Emulator } from './emulator.js';
import { Keybinds } from './keybinds.js';
import { confirmExternalLink, LINK_CONFIRMS } from './shellHelp.js';
import {
  playSelectSound,
  playNavBlip,
  startMenuMusic,
  playCheatOpenSound,
  playCheatSuccessSound,
  playBackSound,
  enableShellAudio,
} from './audio.js';

class UIManager {
  static CHEAT_HINT_TIMING = {
    INITIAL_DELAY: 600,
    SHOW_DURATION: 1000,
    FADE_DURATION: 300,
    LOOP_DELAY: 500,
  };

  static getCheatHintStepInterval() {
    return this.CHEAT_HINT_TIMING.SHOW_DURATION + this.CHEAT_HINT_TIMING.FADE_DURATION;
  }

  static getCheatHintTotalDuration(sequenceLength) {
    return (
      this.CHEAT_HINT_TIMING.INITIAL_DELAY +
      sequenceLength * this.getCheatHintStepInterval() +
      this.CHEAT_HINT_TIMING.LOOP_DELAY
    );
  }

  init() {
    // Listen for state changes
    State.on('currentMode', () => {
      this.updatePowerVisuals();
      this.updateModeVisuals();
    });
    State.on('selectedROMIndex', () => this.updateMenuSelection());
    State.on('currentGame', () => this.updatePlayButtons());
    State.on('isGameLoaded', () => {
      this.updatePlayButtons();
      this.updateModeVisuals();
    });

    State.on('romList', (list) => {
      this.renderROMList(list || []);
    });

    State.on('menuView', () => {
      this.renderROMList(State.get('romList') || []);
    });

    State.on('romsUnlocked', () => {
      this.renderROMList(State.get('romList') || []);
    });

    State.on('currentVolume', () => {
      if (State.get('menuView') === 'settings') {
        this.renderROMList(State.get('romList') || []);
      }
    });

    State.on('currentSpeed', () => {
      if (State.get('menuView') === 'settings') {
        this.renderROMList(State.get('romList') || []);
      }
    });

    window.addEventListener('keys-mode-changed', () => {
      if (State.get('menuView') === 'settings') {
        this.renderROMList(State.get('romList') || []);
      }
    });

    window.addEventListener('keybinds-changed', () => {
      if (State.get('menuView') === 'settings') {
        this.renderROMList(State.get('romList') || []);
      }
      if (this.isKeysModeEnabled) {
        this._syncKeyLabelVisibility();
      }
    });

    window.addEventListener('keys-mode-confirm-request', () => {
      this.setKeysMode(false);
    });

    this.updatePowerVisuals();
    this.updateModeVisuals();
    this.renderROMList(State.get('romList') || []);
    this.setKeysMode(this.isKeysModeEnabled);

    // Re-center selected item on viewport resize
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

      // Eject game when returning to menu to prevent old game flash
      if (State.get('isGameLoaded')) {
        Emulator.eject();
      }

      State.set('currentMode', 'menu');
      startMenuMusic();
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

    // POWER label becomes EJECT while a game is on screen, or while keybinds mode is open
    this.updatePowerLabel();

    // Show correct container and controls
    if (currentMode === 'rom') {
      this.closeCheatOverlay();

      // Set avatar to game-specific avatar before entering ROM mode
      const currentGame = State.get('currentGame');
      if (currentGame) {
        const gameName = currentGame.toLowerCase();
        if (gameName.includes('mario')) {
          this._renderAvatarHeader('public/mario.webp');
        } else if (gameName.includes('pokemon')) {
          this._renderAvatarHeader('public/pokemon.webp');
        } else if (gameName.includes('rampage')) {
          this._renderAvatarHeader('public/rampage.webp');
        }
      }

      // Resume the game when entering ROM mode — only if not already playing
      if (typeof window.run === 'function' && State.get('isGameLoaded')) {
        if (
          typeof window.GameBoyEmulatorPlaying !== 'function' ||
          !window.GameBoyEmulatorPlaying()
        ) {
          window.run();
        }
      }

      if (DOM.romContainer) {
        DOM.romContainer.classList.remove('hidden');
        DOM.romContainer.style.display = 'flex'; // Force display (was set to none by mountContainers)
        DOM.romContainer.style.pointerEvents = 'auto';
      }
      if (DOM.menuContainer) {
        DOM.menuContainer.classList.add('hidden');
        DOM.menuContainer.style.display = 'none';
      }
    } else {
      if (DOM.romContainer) DOM.romContainer.style.display = 'none';
      if (DOM.menuContainer) {
        DOM.menuContainer.style.display = 'flex';
        DOM.menuContainer.classList.remove('hidden');
      }
      // Re-center carousel when menu becomes visible
      requestAnimationFrame(() => {
        this.updateMenuSelection(true);
      });
    }
  }

  renderROMList(roms) {
    if (!DOM.carousel) {
      console.error('[UI] Carousel not found! Aborting render.');
      return;
    }

    DOM.carousel.innerHTML = '';

    const menuView = State.get('menuView');
    DOM.menuContainer?.classList.toggle('gb-games-menu', menuView === 'games');

    if (menuView === 'games') {
      this.renderGamesMenu(roms);
    } else if (menuView === 'about') {
      this.renderAboutMenu();
    } else if (menuView === 'socials') {
      this.renderSocialsMenu();
    } else if (menuView === 'settings') {
      this.renderSettingsMenu();
    } else {
      this.renderMainMenu();
    }

    // Credit marquee on menu screens except MY GAMES; wait until sound prompt is done
    // so the animation starts fresh on the real menu (not mid-cycle under the overlay).
    this._syncExtrasCredit(menuView !== 'games' && this._soundPromptResolved);

    this._lastSelectedIndex = -1;
    this.updateMenuSelection(true);
  }

  _syncExtrasCredit(show) {
    const container = DOM.menuContainer;
    if (!container) return;

    let credit = container.querySelector('.gb-extras-credit');
    if (show) {
      if (!credit) {
        credit = document.createElement('div');
        credit.className = 'gb-extras-credit';
        credit.setAttribute('aria-hidden', 'true');

        const makeLane = (side) => {
          const lane = document.createElement('div');
          lane.className = `gb-extras-credit-lane gb-extras-credit-lane--${side}`;
          const text = document.createElement('span');
          text.className = 'gb-extras-credit-text';
          text.textContent = 'BUILT BY MITCH IVIN';
          lane.appendChild(text);
          return lane;
        };

        credit.appendChild(makeLane('top'));
        credit.appendChild(makeLane('bottom'));
        container.insertBefore(credit, container.firstChild);
      } else {
        // Restart marquee immediately on re-entry
        credit.querySelectorAll('.gb-extras-credit-text').forEach((text) => {
          text.style.animation = 'none';
          void text.offsetWidth;
          text.style.animation = '';
        });
      }
      container.classList.add('has-extras-credit');
    } else {
      credit?.remove();
      container.classList.remove('has-extras-credit');
    }
  }

  preloadAvatars() {
    const assets = [
      // Critical UI assets
      'public/base.webp',
      'public/button-a.webp',
      'public/button-b.webp',
      // Avatars
      'public/avatar.webp',
      'public/avatar-shh.webp',
      'public/avatar-success.webp',
      'public/mario.webp',
      'public/pokemon.webp',
      'public/rampage.webp',
    ];
    assets.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  _renderAvatarHeader(src = 'public/avatar.webp') {
    const container = DOM.menuContainer;
    if (container) {
      // Preload to ensure smooth switch without empty frame flash
      const tempImg = new Image();
      tempImg.onload = () => {
        container.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18)), url('${src}'), linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`;
        container.style.backgroundSize = 'cover, cover, 100% 4px, 6px 100%';
        container.style.backgroundPosition = 'center';
      };
      tempImg.src = src;
    }
  }

  createMenuItem({ index, label, textHtml, datasets = {}, onSelect, disabled = false }) {
    const item = document.createElement('div');
    item.className = `gb-menu-item${disabled ? ' is-disabled' : ''}`;
    item.dataset.index = String(index);
    if (disabled) item.dataset.disabled = 'true';
    Object.entries(datasets).forEach(([key, value]) => {
      item.dataset[key] = value;
    });
    item.innerHTML =
      textHtml ??
      `
        <div class="gb-menu-cursor"></div>
        <div class="gb-menu-text">${label}</div>
        <div class="gb-menu-cursor gb-menu-cursor--right"></div>
    `;
    item.addEventListener('click', (e) => {
      if (disabled) return;
      if (!e.isTrusted && State.get('selectedROMIndex') !== index) return;
      e.stopPropagation();
      const wasSelected = State.get('selectedROMIndex') === index;
      State.set('selectedROMIndex', index);
      if (wasSelected && e.isTrusted) {
        const isBack = item.dataset.back === 'true';
        if (isBack) playBackSound();
        else playSelectSound();
        onSelect?.(item);
      } else if (!wasSelected) {
        playNavBlip();
      } else {
        onSelect?.(item);
      }
    });
    return item;
  }

  renderMainMenu() {
    let currentIndex = 0;

    this._renderAvatarHeader();

    if (State.get('romsUnlocked')) {
      const myGamesCard = this.createMyGamesCard(currentIndex);
      DOM.carousel.appendChild(myGamesCard);
      currentIndex++;
    }

    // UPLOAD ROM above cheat code
    const uploadCard = this.createUploadCard(currentIndex);
    DOM.carousel.appendChild(uploadCard);
    currentIndex++;

    if (!State.get('romsUnlocked')) {
      const cheatCard = this.createCheatCard(currentIndex);
      DOM.carousel.appendChild(cheatCard);
      currentIndex++;
    }

    // EXTRAS above settings
    const aboutCard = this.createAboutCard(currentIndex);
    DOM.carousel.appendChild(aboutCard);
    currentIndex++;

    const settingsCard = this.createSettingsCard(currentIndex);
    DOM.carousel.appendChild(settingsCard);
  }

  createAboutCard(index) {
    return this.createMenuItem({
      index,
      label: 'EXTRAS',
      datasets: { about: 'true' },
      onSelect: () => this.openAboutMenu(),
    });
  }

  openAboutMenu() {
    State.set('selectedROMIndex', 0);
    State.set('menuView', 'about');
  }

  openSocialsMenu() {
    State.set('selectedROMIndex', 0);
    State.set('menuView', 'socials');
  }

  renderAboutMenu() {
    let currentIndex = 0;

    this._renderAvatarHeader();

    DOM.carousel.appendChild(
      this.createMenuItem({
        index: currentIndex++,
        label: 'REPOSITORY',
        datasets: { github: 'true' },
        onSelect: () => confirmExternalLink(LINK_CONFIRMS.githubRepo),
      }),
    );

    DOM.carousel.appendChild(
      this.createMenuItem({
        index: currentIndex++,
        label: 'DOODLEDEV',
        datasets: { doodledev: 'true' },
        onSelect: () => confirmExternalLink(LINK_CONFIRMS.doodledev),
      }),
    );

    DOM.carousel.appendChild(
      this.createMenuItem({
        index: currentIndex++,
        label: 'MY LINKS',
        datasets: { socials: 'true' },
        onSelect: () => this.openSocialsMenu(),
      }),
    );

    DOM.carousel.appendChild(this.createBackToMainCard(currentIndex++));
  }

  renderSocialsMenu() {
    let currentIndex = 0;

    this._renderAvatarHeader();

    DOM.carousel.appendChild(
      this.createMenuItem({
        index: currentIndex++,
        label: 'GITHUB',
        datasets: { githubProfile: 'true' },
        onSelect: () => confirmExternalLink(LINK_CONFIRMS.github),
      }),
    );

    DOM.carousel.appendChild(
      this.createMenuItem({
        index: currentIndex++,
        label: 'PORTFOLIO',
        datasets: { portfolio: 'true' },
        onSelect: () => confirmExternalLink(LINK_CONFIRMS.author),
      }),
    );

    DOM.carousel.appendChild(
      this.createMenuItem({
        index: currentIndex++,
        label: 'LINKEDIN',
        datasets: { linkedin: 'true' },
        onSelect: () => confirmExternalLink(LINK_CONFIRMS.linkedin),
      }),
    );

    DOM.carousel.appendChild(
      this.createMenuItem({
        index: currentIndex++,
        label: 'INSTAGRAM',
        datasets: { instagram: 'true' },
        onSelect: () => confirmExternalLink(LINK_CONFIRMS.instagram),
      }),
    );

    DOM.carousel.appendChild(
      this.createMenuItem({
        index: currentIndex++,
        label: 'BACK',
        datasets: { back: 'true', backTo: 'about' },
        onSelect: () => this.openAboutMenu(),
      }),
    );
  }

  createBackToMainCard(index) {
    return this.createMenuItem({
      index,
      label: 'BACK',
      datasets: { back: 'true' },
      onSelect: () => this.goBackToMainMenu(),
    });
  }

  goBackOneLevel() {
    const menuView = State.get('menuView');
    if (menuView === 'socials') {
      this.openAboutMenu();
      return;
    }
    this.goBackToMainMenu();
  }

  renderGamesMenu(roms) {
    this._renderAvatarHeader();

    roms.forEach((rom, index) => {
      const card = this.createROMCard(rom, index);
      DOM.carousel.appendChild(card);
    });

    const backCard = this.createBackToMainCard(roms.length);
    DOM.carousel.appendChild(backCard);
  }

  openGamesMenu() {
    State.set('selectedROMIndex', 0);
    State.set('menuView', 'games');
  }

  goBackToMainMenu() {
    State.set('selectedROMIndex', 0);
    State.set('menuView', 'main');
  }

  createSettingsCard(index) {
    return this.createMenuItem({
      index,
      label: 'SETTINGS',
      datasets: { settings: 'true' },
      onSelect: () => {
        State.set('selectedROMIndex', 0);
        State.set('menuView', 'settings');
      },
    });
  }

  renderSettingsMenu() {
    let currentIndex = 0;

    this._renderAvatarHeader();

    const vol = State.get('currentVolume');
    const speed = State.get('currentSpeed');

    const volumeCard = this.createMenuItem({
      index: currentIndex++,
      label: `VOL: ${vol === 0 ? 'MUTED' : vol + '%'}`,
      datasets: { action: 'volume' },
      onSelect: () => {
        if (vol > 50) {
          Emulator.setVolume(50);
        } else if (vol > 0) {
          Emulator.setVolume(0);
        } else {
          Emulator.setVolume(100);
        }
      },
    });
    DOM.carousel.appendChild(volumeCard);

    const speedCard = this.createMenuItem({
      index: currentIndex++,
      label: `SPEED: ${speed}X`,
      datasets: { action: 'speed' },
      onSelect: () => {
        const nextSpeed = speed === 1.0 ? 2.0 : speed === 2.0 ? 3.0 : 1.0;
        Emulator.setSpeed(nextSpeed);
      },
    });
    DOM.carousel.appendChild(speedCard);

    const backCard = this.createBackToMainCard(currentIndex++);
    DOM.carousel.appendChild(backCard);
  }

  createCheatCard(index) {
    return this.createMenuItem({
      index,
      label: 'CHEAT CODE',
      datasets: { cheat: 'true' },
      onSelect: () => this.openCheatOverlay(),
    });
  }

  createMyGamesCard(index) {
    return this.createMenuItem({
      index,
      label: 'MY GAMES',
      datasets: { myGames: 'true' },
      onSelect: () => this.openGamesMenu(),
    });
  }

  openCheatOverlay() {
    // Don't open if already open, already unlocked, or sound prompt is still up
    if (this._getCheatOverlay() || State.get('romsUnlocked') || this.isSoundPromptActive()) return;

    const CHEAT_SEQUENCE = ['up', 'down', 'left', 'right', 'b', 'down', 'up'];
    const mount = this._getCheatOverlayMount();
    if (!mount) return;

    // Preload shh avatar first, then build and show overlay to avoid empty border flash
    const tempImg = new Image();
    tempImg.onload = () => {
      // Re-verify conditions in case state changed during load time
      if (this._getCheatOverlay() || State.get('romsUnlocked')) return;

      const overlay = document.createElement('div');
      overlay.id = 'cheat-overlay';
      overlay.className = 'gb-screen-container';
      overlay.innerHTML = `
            <div class="gb-screen-header">
                <img src="public/avatar-shh.webp" class="gb-avatar-image" alt="Cheat Code Shh Avatar" />
            </div>
            <div class="gb-screen-body">
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
            </div>
        `;

      mount.appendChild(overlay);
      DOM.screenMain?.classList.add('cheat-overlay-active');

      // Set avatar background for cheat overlay
      overlay.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18)), url('public/avatar-shh.webp'), linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`;
      overlay.style.backgroundSize = 'cover, cover, 100% 4px, 6px 100%';
      overlay.style.backgroundPosition = 'center';

      // Animate cheat sequence in parent chromeless bar
      this._startCheatHint(CHEAT_SEQUENCE);

      // Play cheat overlay open sound
      playCheatOpenSound();

      // Signal to input.js that overlay is open
      window.dispatchEvent(new CustomEvent('cheat-overlay-opened'));
    };
    tempImg.src = 'public/avatar-shh.webp';
  }

  closeCheatOverlay() {
    const overlay = this._getCheatOverlay();
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 200);
    }

    DOM.screenMain?.classList.remove('cheat-overlay-active');

    // Stop parent chromeless bar cheat hint
    this._stopCheatHint();

    window.dispatchEvent(new CustomEvent('cheat-overlay-closed'));
  }

  /** First-boot in-screen prompt: Yes → 100%; No → muted (still unlocks audio). */
  openSoundOverlay() {
    if (this._getSoundOverlay() || this._soundPromptResolved) return;

    const mount = this._getCheatOverlayMount();
    if (!mount) return;

    this._soundSelectionIndex = 0;

    const overlay = document.createElement('div');
    overlay.id = 'sound-overlay';
    overlay.className = 'gb-screen-container';
    overlay.innerHTML = `
            <div class="gb-screen-body">
                <div class="sound-overlay-box">
                    <div class="sound-overlay-title">Enable sound for this device?</div>
                    <div class="sound-overlay-options" role="listbox" aria-label="Enable sound">
                        <div class="sound-overlay-option" data-choice="yes" data-selected="true" role="option" aria-selected="true">
                            <div class="gb-menu-cursor"></div>
                            <div class="gb-menu-text">Yes</div>
                            <div class="gb-menu-cursor gb-menu-cursor--right"></div>
                        </div>
                        <div class="sound-overlay-option" data-choice="no" data-selected="false" role="option" aria-selected="false">
                            <div class="gb-menu-cursor"></div>
                            <div class="gb-menu-text">No</div>
                            <div class="gb-menu-cursor gb-menu-cursor--right"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Preload avatar before paint (same pattern as cheat overlay — avoids empty frame flash)
    const tempImg = new Image();
    tempImg.onload = () => {
      if (this._getSoundOverlay() || this._soundPromptResolved) return;

      overlay.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18)), url('public/avatar.webp'), linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`;
      overlay.style.backgroundSize = 'cover, cover, 100% 4px, 6px 100%';
      overlay.style.backgroundPosition = 'center';

      overlay.querySelectorAll('.sound-overlay-option').forEach((option, index) => {
        const confirmFromGesture = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._soundSelectionIndex = index;
          this.updateSoundSelection();
          this.confirmSoundChoice();
        };
        // pointerup matches A-button path; click kept for mouse / accessibility.
        option.addEventListener('pointerup', confirmFromGesture);
        option.addEventListener('click', confirmFromGesture);
      });

      mount.appendChild(overlay);
      DOM.screenMain?.classList.add('sound-overlay-active');
      window.dispatchEvent(new CustomEvent('sound-overlay-opened'));
    };
    tempImg.onerror = () => {
      // Still show the prompt even if the avatar fails to load
      tempImg.onload();
    };
    tempImg.src = 'public/avatar.webp';
  }

  closeSoundOverlay() {
    const overlay = this._getSoundOverlay();
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 200);
    }

    DOM.screenMain?.classList.remove('sound-overlay-active');
    window.dispatchEvent(new CustomEvent('sound-overlay-closed'));
  }

  isSoundPromptActive() {
    return !!this._getSoundOverlay() && !this._soundPromptResolved;
  }

  handleSoundNavigation(direction) {
    if (!this.isSoundPromptActive()) return;

    if (direction === 'up' || direction === 'left') {
      this._soundSelectionIndex = 0;
    } else if (direction === 'down' || direction === 'right') {
      this._soundSelectionIndex = 1;
    } else {
      return;
    }

    this.updateSoundSelection();
  }

  updateSoundSelection() {
    const options = this._getSoundOverlay()?.querySelectorAll('.sound-overlay-option') || [];
    options.forEach((option, index) => {
      const selected = index === this._soundSelectionIndex;
      option.dataset.selected = selected ? 'true' : 'false';
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  confirmSoundChoice() {
    if (!this.isSoundPromptActive()) return;

    const options = this._getSoundOverlay()?.querySelectorAll('.sound-overlay-option') || [];
    const selected = options[this._soundSelectionIndex];
    const enable = selected?.dataset?.choice === 'yes';

    this._soundPromptResolved = true;

    // Unlock + start music in this gesture (iOS needs HTML primer + sync Web Audio work).
    enableShellAudio();
    Emulator.setVolume(enable ? 100 : 0);
    if (enable && State.get('currentMode') === 'menu') {
      startMenuMusic();
    }

    this.closeSoundOverlay();

    // Start credit marquee only once the real menu is visible.
    if (State.get('menuView') !== 'games') {
      this._syncExtrasCredit(true);
    }
  }

  _getSoundOverlay() {
    return document.getElementById('sound-overlay');
  }

  updateCheatProgress(progress) {
    const dots = this._getCheatOverlay()?.querySelectorAll('.cheat-dot') || [];
    dots.forEach((dot, i) => {
      dot.classList.toggle('cheat-dot-filled', i < progress);
    });

    // Stop cheat hint animations when code is complete
    if (progress >= 7) {
      this._stopCheatHint();
    }
  }

  showCheatSuccess() {
    const overlay = this._getCheatOverlay();
    if (overlay) {
      // Preload success avatar first, then change background to avoid flash
      const tempImg = new Image();
      tempImg.onload = () => {
        overlay.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18)), url('public/avatar-success.webp'), linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`;
      };
      tempImg.src = 'public/avatar-success.webp';

      const box = overlay.querySelector('.cheat-overlay-box');
      if (box) {
        box.classList.add('is-success');
      }
    }

    playCheatSuccessSound();

    // Auto-close overlay after message is seen
    setTimeout(() => {
      this.closeCheatOverlay();
    }, 1800);
  }

  _getCheatOverlayMount() {
    return DOM.screenMain || DOM.menuContainer;
  }

  _getCheatOverlay() {
    return document.getElementById('cheat-overlay');
  }

  _getCheatOverlayBox() {
    return this._getCheatOverlay()?.querySelector('.cheat-overlay-box') ?? null;
  }

  _startCheatHint(sequence) {
    // Always animate dots in the overlay
    this._startDotHint(sequence);

    // Use button glows on the physical controls for both desktop and mobile
    this._startMobileCheatHint(sequence);
  }

  _startDotHint(sequence) {
    this._stopDotHint();

    const { INITIAL_DELAY, SHOW_DURATION } = UIManager.CHEAT_HINT_TIMING;
    const stepInterval = UIManager.getCheatHintStepInterval();

    const dots = this._getCheatOverlay()?.querySelectorAll('.cheat-dot') || [];
    const timers = [];
    this._dotHintTimers = timers;

    sequence.forEach((_, i) => {
      const delay = INITIAL_DELAY + i * stepInterval;
      const dot = dots[i];
      if (!dot) return;

      const showTimer = setTimeout(() => {
        dot.classList.add('cheat-dot-hint');
      }, delay);

      const hideTimer = setTimeout(() => {
        dot.classList.remove('cheat-dot-hint');
      }, delay + SHOW_DURATION);

      timers.push(showTimer, hideTimer);
    });

    const totalDuration = UIManager.getCheatHintTotalDuration(sequence.length);
    const loopTimer = setTimeout(() => {
      if (this._getCheatOverlay()) {
        this._startDotHint(sequence);
      }
    }, totalDuration);
    timers.push(loopTimer);
  }

  _stopDotHint() {
    if (this._dotHintTimers) {
      this._dotHintTimers.forEach((timer) => clearTimeout(timer));
      this._dotHintTimers = null;
    }
    const dots = this._getCheatOverlay()?.querySelectorAll('.cheat-dot') || [];
    dots.forEach((dot) => dot.classList.remove('cheat-dot-hint'));
  }

  _stopCheatHint() {
    this._stopDotHint();
    this._stopMobileCheatHint();
  }

  _startMobileCheatHint(sequence) {
    this._stopMobileCheatHint();

    const buttonMap = {
      up: DOM.dpad?.up,
      down: DOM.dpad?.down,
      left: DOM.dpad?.left,
      right: DOM.dpad?.right,
      b: DOM.buttons?.b,
    };

    const timers = [];
    this._mobileCheatHintTimers = timers;

    const { INITIAL_DELAY, SHOW_DURATION } = UIManager.CHEAT_HINT_TIMING;
    const stepInterval = UIManager.getCheatHintStepInterval();

    sequence.forEach((key, i) => {
      const delay = INITIAL_DELAY + i * stepInterval;
      const element = buttonMap[key];
      if (!element) return;

      const showTimer = setTimeout(() => {
        element.classList.add('cheat-btn-glow');
      }, delay);

      const hideTimer = setTimeout(() => {
        element.classList.remove('cheat-btn-glow');
      }, delay + SHOW_DURATION);

      timers.push(showTimer, hideTimer);
    });

    const totalDuration = UIManager.getCheatHintTotalDuration(sequence.length);
    const loopTimer = setTimeout(() => {
      if (this._getCheatOverlay()) {
        this._startMobileCheatHint(sequence);
      }
    }, totalDuration);

    timers.push(loopTimer);
  }

  _stopMobileCheatHint() {
    if (this._mobileCheatHintTimers) {
      this._mobileCheatHintTimers.forEach((t) => clearTimeout(t));
      this._mobileCheatHintTimers = null;
    }

    const buttonMap = {
      up: DOM.dpad?.up,
      down: DOM.dpad?.down,
      left: DOM.dpad?.left,
      right: DOM.dpad?.right,
      b: DOM.buttons?.b,
    };
    Object.values(buttonMap).forEach((element) => {
      if (element) {
        element.classList.remove('cheat-btn-glow');
      }
    });
  }

  _getLoadedGameState() {
    const currentGame = State.get('currentGame');
    const isGameLoaded = State.get('isGameLoaded');
    const isUploadedGame = State.get('isUploadedGame');
    return {
      currentGame,
      isGameLoaded,
      isUploadedGame,
      hasUploadedGame: Boolean(currentGame && isGameLoaded && isUploadedGame),
    };
  }

  _isLoadedLibraryGame(romTitle) {
    const { currentGame, isGameLoaded, isUploadedGame } = this._getLoadedGameState();
    return Boolean(isGameLoaded && !isUploadedGame && currentGame === romTitle);
  }

  createUploadCard(index) {
    const { hasUploadedGame } = this._getLoadedGameState();
    const label = hasUploadedGame ? 'EJECT' : 'UPLOAD ROM';

    return this.createMenuItem({
      index,
      label,
      datasets: { upload: 'true' },
      onSelect: () => {
        const { hasUploadedGame: hasGame } = this._getLoadedGameState();
        if (hasGame) {
          Emulator.eject();
        } else if (DOM.romFileInput) {
          DOM.romFileInput.click();
        }
      },
    });
  }

  createROMCard(rom, index) {
    const title = rom.name.replace(/\.gbc?$/i, '');
    const isCurrentGame = this._isLoadedLibraryGame(title);
    const runningMarker = isCurrentGame ? ' *' : '';

    return this.createMenuItem({
      index,
      datasets: {
        romName: title,
        romPath: rom.url ?? rom.path,
      },
      textHtml: `
        <div class="gb-menu-cursor"></div>
        <div class="gb-menu-text"><span class="gb-menu-text-inner">${title}${runningMarker}</span></div>
        <div class="gb-menu-cursor gb-menu-cursor--right"></div>
      `,
      onSelect: (item) => {
        if (this._isLoadedLibraryGame(item.dataset.romName)) {
          Emulator.eject();
        } else {
          Emulator.loadFromPath(item.dataset.romPath);
        }
      },
    });
  }

  _getCarouselScrollMetrics(carouselContainer) {
    const style = getComputedStyle(carouselContainer);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const scrollHeight = carouselContainer.clientHeight - paddingTop - paddingBottom;

    return { scrollHeight, paddingTop, paddingBottom };
  }

  _getMenuListTopInset(scrollHeight, carouselHeight) {
    const items = DOM.carousel?.querySelectorAll('.gb-menu-item');
    if (!items?.length || scrollHeight <= 0) return 0;

    const itemHeight = items[0].offsetHeight;
    const gap = parseFloat(getComputedStyle(DOM.carousel).gap) || 0;
    const refItemCount = 4;
    const refHeight = itemHeight * refItemCount + gap * (refItemCount - 1);
    const contentHeight =
      carouselHeight <= scrollHeight ? carouselHeight : Math.min(refHeight, scrollHeight);

    return Math.max(0, (scrollHeight - contentHeight) / 2);
  }

  _syncMenuViewportInset(carouselContainer, carouselHeight) {
    const paddingBottom = parseFloat(getComputedStyle(carouselContainer).paddingBottom) || 0;
    const scrollHeight = carouselContainer.clientHeight - paddingBottom;
    const topInset = this._getMenuListTopInset(scrollHeight, carouselHeight);
    carouselContainer.style.paddingTop = `${topInset}px`;
    return this._getCarouselScrollMetrics(carouselContainer).scrollHeight;
  }

  _getCarouselTranslateY(selectedItem, scrollHeight, carouselHeight) {
    const items = DOM.carousel?.querySelectorAll('.gb-menu-item');
    if (!items?.length || !DOM.carousel) return 0;

    if (carouselHeight <= scrollHeight) {
      return 0;
    }

    const itemTop = selectedItem.offsetTop;
    const itemHeight = selectedItem.offsetHeight;
    const itemCenter = itemTop + itemHeight / 2;
    const ideal = scrollHeight / 2 - itemCenter;

    const minTranslate = 0;
    const maxTranslate = scrollHeight - carouselHeight;

    return Math.max(maxTranslate, Math.min(minTranslate, ideal));
  }

  updateMenuSelection(force = false) {
    if (State.get('currentMode') !== 'menu') return;

    const items = DOM.carousel?.querySelectorAll('.gb-menu-item');
    if (!items || items.length === 0) return;

    const selectedIndex = State.get('selectedROMIndex');

    if (selectedIndex >= items.length) {
      State.set('selectedROMIndex', items.length - 1);
      return;
    }

    const previousIndex = this._lastSelectedIndex;

    if (!force && previousIndex === selectedIndex) {
      return;
    }

    if (previousIndex >= 0 && items[previousIndex]) {
      items[previousIndex].dataset.selected = 'false';
      const prevInner = items[previousIndex].querySelector('.gb-menu-text-inner');
      if (prevInner) {
        this.stopMarquee(prevInner);
      }
    }

    const selectedItem = items[selectedIndex];
    if (!selectedItem) return;

    selectedItem.dataset.selected = 'true';

    this._lastSelectedIndex = selectedIndex;

    const selectedInner = selectedItem.querySelector('.gb-menu-text-inner');
    if (selectedInner && State.get('menuView') === 'games') {
      this.startMarquee(selectedInner);
    }

    // Update avatar header depending on selection and view mode
    if (State.get('menuView') === 'games') {
      const roms = State.get('romList') || [];
      const selectedROM = roms[selectedIndex];
      if (selectedROM) {
        const gameName = selectedROM.name.toLowerCase();
        if (gameName.includes('mario')) {
          this._renderAvatarHeader('public/mario.webp');
        } else if (gameName.includes('pokemon')) {
          this._renderAvatarHeader('public/pokemon.webp');
        } else if (gameName.includes('rampage')) {
          this._renderAvatarHeader('public/rampage.webp');
        } else {
          this._renderAvatarHeader('public/avatar.webp');
        }
      } else {
        this._renderAvatarHeader('public/avatar.webp');
      }
    } else {
      this._renderAvatarHeader('public/avatar.webp');
    }

    if (this._menuSelectionRAF !== null) {
      cancelAnimationFrame(this._menuSelectionRAF);
    }

    this._menuSelectionRAF = requestAnimationFrame(() => {
      this._menuSelectionRAF = null;
      const carouselContainer = DOM.carousel?.parentElement;
      if (!selectedItem || !DOM.carousel || !carouselContainer) return;

      const carouselHeight = DOM.carousel.offsetHeight;
      const scrollHeight = this._syncMenuViewportInset(carouselContainer, carouselHeight);

      const translateY = this._getCarouselTranslateY(selectedItem, scrollHeight, carouselHeight);
      DOM.carousel.style.transform = `translateY(${translateY}px)`;
      DOM.carousel.style.opacity = '1';
    });
  }

  handleMenuNavigation(direction) {
    if (State.get('currentMode') !== 'menu') return;

    const items = DOM.carousel?.querySelectorAll('.gb-menu-item');
    if (!items || items.length === 0) return;

    const step = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
    if (!step) return;

    let selectedIndex = State.get('selectedROMIndex');
    let nextIndex = selectedIndex + step;

    while (nextIndex >= 0 && nextIndex < items.length && items[nextIndex]?.dataset.disabled === 'true') {
      nextIndex += step;
    }

    if (nextIndex >= 0 && nextIndex < items.length) {
      State.set('selectedROMIndex', nextIndex);
    }
  }

  activateMenuItem() {
    if (State.get('currentMode') !== 'menu') return;
    const items = DOM.carousel?.querySelectorAll('.gb-menu-item');
    const selectedIndex = State.get('selectedROMIndex');
    const item = items?.[selectedIndex];
    if (!item || item.dataset.disabled === 'true') return;
    // Simulate click
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    item.dispatchEvent(clickEvent);
  }

  isKeysModeEnabled = false;
  _menuSelectionRAF = null;
  _resizeSelectionRAF = null;
  _lastSelectedIndex = -1;
  _soundSelectionIndex = 0;
  _soundPromptResolved = false;

  updatePowerLabel() {
    if (!DOM.txtPower) return;
    const textElement = DOM.txtPower.querySelector('text tspan');
    if (!textElement) return;
    const showEject = State.get('currentMode') === 'rom' || this.isKeysModeEnabled;
    textElement.textContent = showEject ? 'EJECT' : 'POWER';
  }

  setKeysMode(enabled) {
    if (enabled && isMobileDevice()) {
      enabled = false;
    }

    this.isKeysModeEnabled = enabled;
    document.body.classList.toggle('keys-mode-active', enabled);
    if (!enabled) document.body.classList.remove('keys-has-reset');
    window.dispatchEvent(new CustomEvent('keys-mode-changed', { detail: { enabled } }));

    this._syncKeyLabelVisibility();
    this.updatePowerLabel();
  }

  _syncKeyLabelVisibility() {
    const enabled = this.isKeysModeEnabled;
    const showReset = enabled && !Keybinds.isAtDefaults();
    document.body.classList.toggle('keys-has-reset', showReset);

    const labels = document.querySelectorAll('.key-internal-label');
    labels.forEach((label) => {
      const button = label.dataset.button;
      const isReset = button === 'reset';
      const visible = enabled && (!isReset || showReset);
      label.style.opacity = visible ? '1' : '0';
      if (button) {
        label.style.pointerEvents = visible ? 'auto' : 'none';
      }
    });
  }

  toggleKeysMode() {
    if (isMobileDevice()) return;
    this.setKeysMode(!this.isKeysModeEnabled);
  }

  startMarquee(el) {
    this.stopMarquee(el);
    const parent = el.parentElement;
    if (!parent) return;

    el._marqueeRAF = requestAnimationFrame(() => {
      el._marqueeRAF = null;
      const parentWidth = parent.clientWidth;
      if (parentWidth <= 0) return;

      const savedDisplay = el.style.display;
      const savedWidth = el.style.width;
      const savedTextOverflow = el.style.textOverflow;
      el.style.display = 'inline-block';
      el.style.width = 'auto';
      el.style.textOverflow = 'clip';

      const textWidth = el.scrollWidth;

      el.style.display = savedDisplay;
      el.style.width = savedWidth;
      el.style.textOverflow = savedTextOverflow;

      const overflow = textWidth - parentWidth;
      if (overflow > 1) {
        parent.style.maxWidth = `${parentWidth}px`;
        const MARQUEE_SPEED = 20; // px/sec - slower for retro pixel font legibility
        const scrollDuration = overflow / MARQUEE_SPEED;
        const totalDuration = Math.max(5, scrollDuration / 0.3); // minimum 5s loop

        el.style.setProperty('--marquee-overflow', `${overflow}px`);
        el.style.setProperty('--marquee-duration', `${totalDuration}s`);
        el.classList.add('animate-marquee');
      }
    });
  }

  stopMarquee(el) {
    if (el._marqueeRAF) {
      cancelAnimationFrame(el._marqueeRAF);
      el._marqueeRAF = null;
    }
    const parent = el.parentElement;
    if (parent) {
      parent.style.removeProperty('max-width');
    }
    el.classList.remove('animate-marquee');
    el.style.removeProperty('--marquee-overflow');
    el.style.removeProperty('--marquee-duration');
  }

  updatePlayButtons() {
    // We just re-render the list entirely to reflect state changes easily.
    if (State.get('currentMode') === 'menu') {
      this.renderROMList(State.get('romList') || []);
    }
  }
}

export const UI = new UIManager();
