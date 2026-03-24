// Centralized DOM access - single source of truth for all elements
export const DOM = {
    // Containers
    gameboyContainer: null,
    romContainer: null,
    menuContainer: null,
    header: null,
    footer: null,

    // Screen elements
    screen: null,
    screenMain: null,
    screenGlare: null,

    // Menu elements
    carousel: null,

    // Controls
    powerLED: null,

    // Buttons
    buttons: null,
    dpad: null,

    /**
     * Initialize all DOM references
     * Call this once on page load
     */
    init() {
        // Light DOM elements
        this.gameboyContainer = document.getElementById('gameboy-container');
        this.romContainer = document.getElementById('rom-mode-container');
        this.menuContainer = document.getElementById('menu-mode-container');
        this.header = document.querySelector('.blueprint-header');
        this.footer = document.querySelector('.doodle-disclaimer');
        this.carousel = document.getElementById('rom-carousel');
        this.romFileInput = document.getElementById('rom-file-input');
        this.saveStateInput = document.getElementById('save-state-input');

        // All elements are now in the regular DOM
        this.screenMain = document.getElementById('screen-main');
        this.screenGlare = document.getElementById('scr-glare');
        this.powerLED = document.getElementById('power-light');

        // Button elements
        this.buttons = {
            a: document.getElementById('a'),
            b: document.getElementById('b'),
            start: document.getElementById('start'),
            select: document.getElementById('select')
        };

        // D-pad elements
        this.dpad = {
            container: document.getElementById('dpad'),
            up: document.getElementById('up'),
            down: document.getElementById('down'),
            left: document.getElementById('left'),
            right: document.getElementById('right'),
            mid: document.getElementById('mid')
        };

        // Canvas
        this.screen = document.getElementById('gameboy-screen');

        return this;
    },

    /**
     * Find element in DOM
     */
    findElement(id) {
        return document.getElementById(id);
    },

    /**
     * Mount containers into screen slot
     */
    mountToShadow() {
        if (!this.screenMain) return;

        // Mount containers
        if (this.romContainer) {
            this.screenMain.appendChild(this.romContainer);
            this.romContainer.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;z-index:9999;display:none;pointer-events:none;';
        }

        if (this.menuContainer) {
            this.screenMain.appendChild(this.menuContainer);
            this.menuContainer.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;z-index:9999;';
        }
    }
};
