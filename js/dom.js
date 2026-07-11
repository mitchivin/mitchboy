/**
 * Centralized DOM access — single source of truth for all element references.
 */
export const DOM = {
  gameboyContainer: null,
  romContainer: null,
  menuContainer: null,

  // Screen
  screen: null,
  screenMain: null,
  screenGlare: null,

  // Menu
  carousel: null,
  romFileInput: null,
  saveStateInput: null,

  // Controls
  powerLED: null,
  txtPower: null,
  buttons: null,
  dpad: null,
  strokeGrad4: null,

  init() {
    this.gameboyContainer = document.getElementById('gameboy-container');
    this.romContainer = document.getElementById('rom-mode-container');
    this.menuContainer = document.getElementById('menu-mode-container');
    this.carousel = document.getElementById('rom-carousel');
    this.romFileInput = document.getElementById('rom-file-input');
    this.saveStateInput = document.getElementById('save-state-input');
    this.screenMain = document.getElementById('screen-main');
    this.screenGlare = document.getElementById('scr-glare');
    this.powerLED = document.getElementById('power-light');
    this.txtPower = document.getElementById('txt-power');
    this.screen = document.getElementById('gameboy-screen');
    this.strokeGrad4 = document.getElementById('stroke-grad-4');

    this.buttons = {
      a: document.getElementById('a'),
      b: document.getElementById('b'),
      start: document.getElementById('start'),
      select: document.getElementById('select'),
      aHitarea: document.getElementById('a-hitarea'),
      bHitarea: document.getElementById('b-hitarea'),
      startHitarea: document.getElementById('start-hitarea'),
      selectHitarea: document.getElementById('select-hitarea'),
    };

    this.dpad = {
      container: document.getElementById('dpad'),
      directional: document.getElementById('directional'),
      hitarea: document.getElementById('dpad-hitarea'),
      up: document.getElementById('up'),
      down: document.getElementById('down'),
      left: document.getElementById('left'),
      right: document.getElementById('right'),
      mid: document.getElementById('mid'),
    };

    return this;
  },

  /** Mount the ROM and menu containers into the screen slot. */
  mountContainers() {
    if (!this.screenMain) return;

    if (this.romContainer) {
      this.screenMain.appendChild(this.romContainer);
      this.romContainer.style.cssText =
        'width:100%;height:100%;position:absolute;top:0;left:0;z-index:9999;display:none;pointer-events:none;';
    }

    if (this.menuContainer) {
      this.screenMain.appendChild(this.menuContainer);
      this.menuContainer.style.cssText =
        'width:100%;height:100%;position:absolute;top:0;left:0;z-index:9999;';
    }
  },
};
