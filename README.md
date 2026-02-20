# Game Boy Color Emulator

---

<img width="1400" height="910" alt="gitgbc4" src="https://github.com/user-attachments/assets/5bb5da1f-c019-46d4-890c-1c1a69eb5ee6" />

---

Game Boy Color emulator for the web. The physical device (shell, buttons, screen bezel, LED, and speaker grille) is a pixel-perfect Shadow DOM component designed in DoodleDev. Drop in a ROM and play.

## Overview

The Game Boy shell was designed in **[DoodleDev](https://doodledev.app)**, a visual compiler that turns vector designs into production-ready HTML/CSS. You can find this design as a preset inside DoodleDev.

### Design and Logic

DoodleDev provides a clean visual foundation for production engineering. Instead of using AI to guess at a layout, this project starts with a pixel-perfect, zero-dependency export that is easy to adjust manually.

The emulator core, menu system, and all input handling are built directly onto the DoodleDev export across nine JavaScript modules:

| Module | Responsibility |
|---|---|
| `main.js` | Entry point, module wiring, app initialisation |
| `dom.js` | DOM element cache |
| `state.js` | Pub/sub state manager |
| `ui.js` | UI rendering, carousel, header/footer, overlays |
| `input.js` | Keyboard, pointer, and d-pad input |
| `keybinds.js` | Custom keybind manager with localStorage persistence |
| `emulator.js` | Emulator interface, speed and volume control |
| `romScanner.js` | ROM manifest fetcher |

## Features

- **Full Emulation**: Plays `.gb` and `.gbc` ROMs via the GameBoy-Online core.
- **Carousel Menu**: Keyboard and pointer navigation with smooth transitions.
- **Save / Load States**: Export and import save state files directly from the header.
- **Customisable Keybinds**: Enable Keys mode to reveal button labels. Click any label to rebind. Persisted in `localStorage`.
- **Speed and Volume**: Cycle through speed and volume presets from the in-game footer.
- **Cheat System**: A hidden konami-style input sequence unlocks the full ROM library.
- **Keys Overlay**: Toggle key labels on/off. All game input is blocked while the overlay is active.
- **Responsive Layout**: Scales to any viewport. Shows a mobile warning on small screens.

<img width="1400" height="910" alt="gitgbc2" src="https://github.com/user-attachments/assets/87578791-680d-4ddc-8d2f-4fdc2b2a4f34" />

## Project Structure

```
src/renderer/                           # Everything inside here is the app
├── index.html
├── css/
│   ├── input.css                       # Tailwind source
│   ├── generated.css                   # Tailwind output (build artifact)
│   ├── layout.css                      # Shell and overlay layout
│   └── style.css                       # Entry: imports generated.css + layout.css
├── js/
│   ├── main.js                         # Entry point
│   ├── dom.js                          # DOM element cache
│   ├── state.js                        # Pub/sub state manager
│   ├── ui.js                           # UI rendering and carousel
│   ├── input.js                        # Input handling
│   ├── emulator.js                     # Emulator interface
│   ├── keybinds.js                     # Keybind system
│   ├── romScanner.js                   # ROM manifest fetching
│   └── components/
│       └── GameboyDesign.js            # Shadow DOM device component
├── games/
│   ├── manifest.json                   # ROM listing
│   └── *.gb / *.gbc                    # ROM files
└── public/                             # Static assets
```

## Adding ROMs

Place `.gb` and `.gbc` files inside `src/renderer/games/` and add an entry to `manifest.json`:

```json
[
  { "name": "Game Title", "url": "games/Game Title.gbc" }
]
```

<img width="1400" height="910" alt="gitgbc3" src="https://github.com/user-attachments/assets/1871c9ef-29dd-4caf-834b-0cf580d99d09" />

## Running Locally

`npm install` is only needed for the Tailwind CLI. The app itself has zero runtime dependencies.

```bash
git clone https://github.com/mitchivin/gameboy.git
cd gameboy
npm install
npm run build:css
npx serve src/renderer
```

Open `http://localhost:3000`. A local server is required; the ROM manifest is loaded via `fetch`.

To watch for CSS changes during development:

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Compiles Tailwind and copies `src/renderer/` to `dist/`. The `dist/` folder is the deployable site; serve it from any static host or push it to GitHub Pages.

## Controls

| Button | Default Key | Rebindable |
|---|---|---|
| D-Pad | Arrow Keys | Yes |
| A | W | Yes |
| B | Q | Yes |
| Start | Control | Yes |
| Select | Alt | Yes |
| Toggle Mode | Tab | Yes |

## Tech Stack

- **HTML/CSS/JS**: Vanilla ES modules. Zero runtime dependencies.
- **Tailwind CSS**: Dev dependency only. Compiles `input.css` → `generated.css` at build time. Nothing ships to the browser.
- **GameBoy-Online**: Core emulation engine (MIT licensed, vendored into `js/core/`).
- **DoodleDev**: Visual shell design ([doodledev.app](https://doodledev.app)).

## Credits

Designed and built by **[Mitch Ivin](https://mitchivin.com/)**.
Shell designed in **[DoodleDev](https://doodledev.app)**.
Emulator Core by **[Grant Galitz](https://github.com/taisel/GameBoy-Online)**.

## License

MIT
