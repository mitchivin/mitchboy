# MI Boy Color

Open-source **handheld shell** for MI Boy Color. Device chrome HTML, CSS, and face assets only. No emulator, menus, or ROM library in this repo.

Live product: coming soon.

The shell was designed in **[DoodleDev](https://doodledev.app)** and sits in the page as normal HTML/CSS. No framework, no runtime deps.

<p align="center">
  <img src="https://github.com/user-attachments/assets/19578b7e-8336-4505-9b39-42e93df11548" alt="MI Boy Color shell demo LCD" />
   &nbsp;
  <img src="https://github.com/user-attachments/assets/3d5f50f4-df81-4053-91f8-c0950d3c4fdf" alt="MI Boy Color handheld shell" />
   
</p>

## Features

- Inlined DoodleDev Game Boy Color style shell
- Face art for the chassis and A / B buttons
- Static shell demo page (LCD card, no games)
- Plain static site. Serve the folder from anywhere

## Run locally

```bash
git clone https://github.com/mitchivin/miboy.git
cd miboy
npx serve .
```

Open whatever URL it prints (usually `http://localhost:3000`). You should see the handheld with a shell demo LCD.

## Layout

```
├── index.html          # page + inlined device markup
├── css/
│   └── gameboy-bundle.css
├── public/
│   ├── base.webp
│   ├── button-a.webp
│   ├── button-b.webp
│   └── meta/
└── LICENSE
```

## Stack

- Vanilla HTML / CSS
- Shell from [DoodleDev](https://doodledev.app)

## Related

- [MiPod](https://github.com/mitchivin/mipod) - click-wheel music player
- [MitchIvin XP](https://mitchivin.com/) - Windows XP portfolio desktop

## Credits

Built by **[Mitch Ivin](https://mitchivin.com/)**.  
Shell designed in **[DoodleDev](https://doodledev.app)**.

## License

MIT. See [LICENSE](./LICENSE).
