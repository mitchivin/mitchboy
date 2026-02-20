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

    // Buttons (in shadow DOM)
    buttons: null,
    dpad: null,

    /**
     * Initialize all DOM references
     * Call this once on page load
     */
    init() {
        // Get shadow root
        const component = document.querySelector('exported-content');
        const shadowRoot = component?.shadowRoot;

        // Light DOM elements
        this.gameboyContainer = document.getElementById('gameboy-container');
        this.romContainer = document.getElementById('rom-mode-container');
        this.menuContainer = document.getElementById('menu-mode-container');
        this.header = document.querySelector('.blueprint-header');
        this.footer = document.querySelector('.doodle-disclaimer');
        this.carousel = document.getElementById('rom-carousel');
        this.romFileInput = document.getElementById('rom-file-input');
        this.saveStateInput = document.getElementById('save-state-input');

        // Shadow DOM elements
        if (shadowRoot) {
            this.screenMain = shadowRoot.getElementById('screen-main');
            this.screenGlare = shadowRoot.getElementById('scr-glare');
            this.powerLED = shadowRoot.getElementById('power-light');

            // Button elements
            this.buttons = {
                a: shadowRoot.getElementById('a'),
                b: shadowRoot.getElementById('b'),
                start: shadowRoot.getElementById('start'),
                select: shadowRoot.getElementById('select')
            };

            // D-pad elements
            this.dpad = {
                container: shadowRoot.getElementById('dpad'),
                up: shadowRoot.getElementById('up'),
                down: shadowRoot.getElementById('down'),
                left: shadowRoot.getElementById('left'),
                right: shadowRoot.getElementById('right'),
                mid: shadowRoot.getElementById('mid')
            };
        }

        // Canvas (might be in either DOM)
        this.screen = this.findElement('gameboy-screen');

        return this;
    },

    /**
     * Find element in both light and shadow DOM
     */
    findElement(id) {
        // Try light DOM first
        let el = document.getElementById(id);
        if (el) return el;

        // Try shadow DOM
        const component = document.querySelector('exported-content');
        if (component?.shadowRoot) {
            el = component.shadowRoot.getElementById(id);
        }

        return el;
    },

    /**
     * Mount containers into shadow DOM screen slot
     */
    mountToShadow() {
        if (!this.screenMain) return;

        // Inject stylesheets
        const component = document.querySelector('exported-content');
        if (component?.shadowRoot) {
            // Check if stylesheet already exists to prevent duplicates
            if (!component.shadowRoot.querySelector('link[href="css/style.css"]')) {
                const styleLink = document.createElement('link');
                styleLink.rel = 'stylesheet';
                styleLink.href = 'css/style.css'; // Path relative to index.html
                component.shadowRoot.appendChild(styleLink);
            }
        }

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
