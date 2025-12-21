# playing-cards-2-planes

Playing cards displayed on 2 planes (UI and table) with 3D visual effects.

![screenshot](https://raw.github.com/afarber/pixi-questions/master/playing-cards-2-planes/screenshot.png)

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run test:run` - Run tests
- `npm run lint` - Run ESLint

## Adaptive Layout

The app uses a centered 1:1 card area with GUI panels that adapt to screen orientation.

### Design Constants

| Constant               | Value      | Description                    |
| ---------------------- | ---------- | ------------------------------ |
| `CARD_AREA_SIZE`       | 720        | Card playing area (1:1 square) |
| `GUI_AREA_SIZE`        | 280        | GUI panel width/height         |
| `APP_BOUNDS_LANDSCAPE` | 1280 x 720 | 16:9 layout                    |
| `APP_BOUNDS_PORTRAIT`  | 720 x 1280 | 9:16 layout                    |

### Landscape Mode (width >= height)

```
+----------+--------------------+----------+
|          |                    |          |
|   GUI    |    Card Area       |   GUI    |
|   LEFT   |    720 x 720       |  RIGHT   |
|  280px   |                    |  280px   |
|          |                    |          |
+----------+--------------------+----------+
| <----------- 1280 x 720 (16:9) --------->|
```

### Portrait Mode (width < height)

```
+-----------------------+
|        GUI TOP        |
|         280px         |
+-----------------------+
|                       |
|       Card Area       |
|       720 x 720       |
|                       |
+-----------------------+
|      GUI BOTTOM       |
|         280px         |
+-----------------------+
|<- 720 x 1280 (9:16) ->|

```

## Credits

- Cards: [Copyright free playing cards](https://www.me.uk/cards/) by Adrian Kennard
- Sounds: CC0-licensed [Casino Audio](https://kenney.nl/assets/casino-audio) by Kenney

## License

MIT License - see [LICENSE](../LICENSE)
