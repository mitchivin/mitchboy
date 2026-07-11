/**
 * Keybind Management - handles custom key bindings
 */

// Keys that can never be bound to a game button
const RESERVED_KEYS = new Set([
  'Escape',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'Meta',
  'OS',
  'ContextMenu',
  'PrintScreen',
  'ScrollLock',
  'Pause',
  'NumLock',
  'CapsLock',
]);

class KeybindManager {
  constructor() {
    // Default keybinds — single source of truth
    this.defaults = {
      a: 'w',
      b: 'q',
      start: 'Alt',
      select: 'Control',
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      toggle: 'Tab',
    };

    // Current keybinds (loaded from localStorage or defaults)
    this.keybinds = this.loadKeybinds();

    // State for rebinding
    this.waitingForKey = null;
    this.keysModeEnabled = false;
  }

  loadKeybinds() {
    // Version bump: if stored version doesn't match, wipe and reset
    const KEYBIND_VERSION = '4';
    if (localStorage.getItem('gameboy-keybinds-version') !== KEYBIND_VERSION) {
      localStorage.removeItem('gameboy-keybinds');
      localStorage.setItem('gameboy-keybinds-version', KEYBIND_VERSION);
      return { ...this.defaults };
    }

    try {
      const saved = localStorage.getItem('gameboy-keybinds');
      if (saved) {
        const parsed = JSON.parse(saved);

        // Merge with defaults so any missing keys fall back cleanly
        const merged = { ...this.defaults, ...parsed };

        // Validate: every key must be a non-empty string
        const allValid = Object.values(merged).every((v) => typeof v === 'string' && v.length > 0);
        if (!allValid) {
          localStorage.removeItem('gameboy-keybinds');
          return { ...this.defaults };
        }

        // Validate: no two buttons share the same key
        if (!this.#isUniqueMap(merged)) {
          localStorage.removeItem('gameboy-keybinds');
          return { ...this.defaults };
        }

        return merged;
      }
    } catch (e) {
      console.error('[Keybinds] Error loading keybinds:', e);
      localStorage.removeItem('gameboy-keybinds');
    }
    return { ...this.defaults };
  }

  #isUniqueMap(map) {
    const values = Object.values(map);
    return new Set(values).size === values.length;
  }

  saveKeybinds() {
    // Always validate before writing
    if (!this.#isUniqueMap(this.keybinds)) {
      console.error('[Keybinds] Refused to save — duplicate keys detected, resetting to defaults');
      this.keybinds = { ...this.defaults };
    }
    try {
      localStorage.setItem('gameboy-keybinds', JSON.stringify(this.keybinds));
    } catch (e) {
      console.error('[Keybinds] Error saving keybinds:', e);
    }
  }

  getKey(button) {
    return this.keybinds[button] ?? this.defaults[button];
  }

  setKey(button, key) {
    // Reject reserved keys
    if (RESERVED_KEYS.has(key)) return false;

    // Reject if this key is already used by another button
    const conflict = Object.entries(this.keybinds).find(([btn, k]) => k === key && btn !== button);
    if (conflict) return false;

    this.keybinds[button] = key;
    this.saveKeybinds();
    this.updateTooltip(button);
    this.#notifyChange();
    return true;
  }

  updateTooltip(button) {
    if (button === 'reset' || button === 'confirm') return;
    const label = document.querySelector(`.key-internal-label[data-button="${button}"]`);
    if (!label) return;
    this.#renderLabelContent(label, this.getKey(button));
  }

  #renderLabelContent(label, key) {
    const icon = this.getKeyIconName(key);
    const isSquare = Boolean(icon) || (typeof key === 'string' && key.length === 1);
    label.classList.toggle('is-square', isSquare);

    if (icon) {
      label.replaceChildren();
      const span = document.createElement('span');
      span.className = 'material-symbols-outlined key-label-icon';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = icon;
      label.appendChild(span);
      return;
    }
    label.textContent = this.formatKeyName(key);
  }

  /** Material Symbols ligature for arrow keys; null for text labels. */
  getKeyIconName(key) {
    const icons = {
      ArrowUp: 'keyboard_arrow_up',
      ArrowDown: 'keyboard_arrow_down',
      ArrowLeft: 'keyboard_arrow_left',
      ArrowRight: 'keyboard_arrow_right',
    };
    return icons[key] || null;
  }

  updateAllTooltips() {
    Object.keys(this.defaults).forEach((button) => {
      this.updateTooltip(button);
    });
  }

  resetToDefaults() {
    this.cancelRebind();
    this.keybinds = { ...this.defaults };
    this.saveKeybinds();
    this.updateAllTooltips();
    this.#notifyChange();
  }

  isAtDefaults() {
    return Object.entries(this.defaults).every(([button, key]) => this.keybinds[button] === key);
  }

  #notifyChange() {
    window.dispatchEvent(new CustomEvent('keybinds-changed'));
  }

  formatKeyName(key) {
    const keyMap = {
      Control: 'CTRL',
      Alt: 'ALT',
      Shift: 'SHIFT',
      ' ': 'SPC',
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      Enter: 'ENT',
      Backspace: 'BKSP',
      Delete: 'DEL',
      Tab: 'TAB',
    };
    return keyMap[key] ?? (key.length === 1 ? key.toUpperCase() : key);
  }

  startRebind(button) {
    if (!this.keysModeEnabled) return;

    if (this.waitingForKey) {
      this.cancelRebind();
    }

    this.waitingForKey = button;
    const label = document.querySelector(`.key-internal-label[data-button="${button}"]`);
    if (label) {
      label.classList.add('is-waiting');
      label.replaceChildren();
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'key-waiting-dot';
        dot.setAttribute('aria-hidden', 'true');
        label.appendChild(dot);
      }
    }
  }

  cancelRebind() {
    if (this.waitingForKey) {
      const label = document.querySelector(
        `.key-internal-label[data-button="${this.waitingForKey}"]`,
      );
      if (label) {
        label.classList.remove('is-waiting');
        label.style.background = '';
        label.style.borderColor = '';
        label.style.color = '';
        this.updateTooltip(this.waitingForKey);
      }
      this.waitingForKey = null;
    }
  }

  handleKeyPress(event) {
    if (!this.waitingForKey) return false;

    event.preventDefault();
    event.stopPropagation();

    const key = event.key;

    // Escape always cancels
    if (key === 'Escape') {
      this.cancelRebind();
      return true;
    }

    // Tab cancels unless we're rebinding the toggle button itself
    if (key === 'Tab' && this.waitingForKey !== 'toggle') {
      this.cancelRebind();
      return true;
    }

    // Reject reserved keys — flash red to indicate failure
    if (RESERVED_KEYS.has(key)) {
      this.#flashLabel(this.waitingForKey, 'rgba(239, 68, 68, 0.9)');
      return true;
    }

    // Reject duplicate key — flash orange
    const conflict = Object.entries(this.keybinds).find(
      ([btn, k]) => k === key && btn !== this.waitingForKey,
    );
    if (conflict) {
      this.#flashLabel(this.waitingForKey, 'rgba(249, 115, 22, 0.9)');
      return true;
    }

    // Commit the rebind
    const button = this.waitingForKey;
    this.waitingForKey = null;
    const label = document.querySelector(`.key-internal-label[data-button="${button}"]`);
    if (label) {
      label.classList.remove('is-waiting');
      label.style.background = '';
      label.style.borderColor = '';
      label.style.color = '';
    }
    const ok = this.setKey(button, key);

    if (!ok) this.updateTooltip(button); // revert display if setKey refused
    return true;
  }

  #flashLabel(button, color) {
    const label = document.querySelector(`.key-internal-label[data-button="${button}"]`);
    if (!label) return;
    label.style.background = color;
    label.style.borderColor = '';
    label.style.color = '';
    setTimeout(() => {
      if (this.waitingForKey === button) {
        label.style.background = '';
        label.classList.add('is-waiting');
      } else {
        label.style.background = '';
      }
    }, 400);
  }

  setupTooltipListeners() {
    const labels = document.querySelectorAll('.key-internal-label[data-button]');
    labels.forEach((label) => {
      label.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (document.body.classList.contains('key-calib-on')) return;
        if (!this.keysModeEnabled) return;
        const button = label.dataset.button;
        if (!button) return;
        if (button === 'reset') {
          this.resetToDefaults();
          return;
        }
        if (button === 'confirm') {
          // Same as top-left Confirm Keybinds — exit keys mode.
          window.dispatchEvent(
            new CustomEvent('keys-mode-confirm-request'),
          );
          return;
        }
        this.startRebind(button);
      });
    });
  }

  init() {
    window.addEventListener('keys-mode-changed', (event) => {
      this.keysModeEnabled = Boolean(event?.detail?.enabled);
      if (!this.keysModeEnabled) {
        this.cancelRebind();
      }
    });

    // Wait a tick for DOM to be ready
    setTimeout(() => {
      this.updateAllTooltips();
      this.setupTooltipListeners();
    }, 300); // Increased timeout to 300ms for safety
  }
}

export const Keybinds = new KeybindManager();
