# Mitch Boy Color

A web-based **Game Boy / Game Boy Color emulator** in a handheld UI. Load a `.gb` or `.gbc` ROM in the browser and play.

Live at [mitchivin.github.io/mitchboy](https://mitchivin.github.io/mitchboy/).

The shell was designed in **[DoodleDev](https://doodledev.app)** and sits in the page as normal HTML/CSS. No framework, no runtime deps.

<p align="center">
  <img width="1920" height="1080" alt="mitchBoy1" src="https://github.com/user-attachments/assets/5f7eaa20-b05c-4847-93c5-61e714c81577" />
  &nbsp;
  <img width="1920" height="1080" alt="mitchBoy2" src="https://github.com/user-attachments/assets/b2a8d2b3-9006-4cdb-a1a0-51a7ee37cb79" />
</p>

## Features

- Plays `.gb` / `.gbc` ROMs (GameBoy-Online core, in `js/core/`)
- On-device menu for library, settings, and extras
- Custom keybinds via Keys mode (reset + confirm). Saved in `localStorage`
- Speed and volume in Settings. First visit asks if you want sound on. Volume resets each session
- Upload your own ROM, or unlock the bundled library with a hidden cheat
- Plain static site. Serve the folder from anywhere

## Controls

| Button | Default | Rebindable |
| --- | --- | --- |
| D-Pad | Arrow keys | Yes |
| A | `W` | Yes |
| B | `Q` | Yes |
| Start | `Alt` | Yes |
| Select | `Ctrl` | Yes |
| Menu / game toggle | `Tab` | Yes |

## Run locally

You need a static server because the ROM list is loaded with `fetch`.

```bash
git clone https://github.com/mitchivin/mitchboy.git
cd mitchboy
npx serve .
```

Open whatever URL it prints (usually `http://localhost:3000`).

Optional checks:

```bash
npm install
npm run lint
npm run knip
```

## Add ROMs

Drop `.gb` / `.gbc` files into `games/` and add them to `games/manifest.json`:

```json
[
  { "name": "Game Title", "url": "games/Game Title.gbc" }
]
```

ROM binaries are not included in the open-source package. Bring your own.

## Layout

```
├── index.html          # page + inlined device markup
├── css/                # layout, shell, menu
├── js/                 # app code + emulator core
├── games/              # manifest.json (+ optional ROMs)
├── public/             # images / static assets
├── docs/screenshots/   # readme images (add these)
└── releases/           # output from npm run release
```

## Stack

- Vanilla HTML / CSS / ES modules
- [GameBoy-Online](https://github.com/taisel/GameBoy-Online) (MIT) under `js/core/`
- Shell from [DoodleDev](https://doodledev.app)

## Related

- [MiPod](https://github.com/mitchivin/mipod) - click-wheel music player
- [MitchIvin XP](https://mitchivin.com/) - Windows XP portfolio desktop

## Credits

Built by **[Mitch Ivin](https://mitchivin.com/)**.  
Shell designed in **[DoodleDev](https://doodledev.app)**.

## License

MIT. See [LICENSE](./LICENSE).
