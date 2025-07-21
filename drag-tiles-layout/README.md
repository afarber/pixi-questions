# drag-tiles-layout

A PixiJS-based drag-and-drop tile game with 3D visual effects. Features draggable colored tiles on a checkered board with perspective mesh transformations for realistic 3D tilt effects.

## Features

- Interactive 8x8 checkered board
- 3 draggable colored tiles with 3D perspective effects
- Grid snapping (tiles automatically align to board cells)
- Dynamic shadows and visual feedback during drag operations
- Responsive design that scales to fit different screen sizes
- Multi-language support (English, German, French)

## Development

### Setup

```bash
mkdir drag-tiles-layout
cd drag-tiles-layout
npm init -y
npm install pixi.js @pixi/ui @pixi/layout @tweenjs/tween.js
npm install vite eslint @vitest/ui vitest jsdom playwright --save-dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle with localized versions
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI

## Architecture

### Core Components

- **main.js** - Application entry point and PixiJS initialization
- **Board.js** - Checkered board background with responsive scaling
- **Tile.js** - Interactive tile implementation with 3D effects
- **locales/** - Localization files (de.js, en.js, fr.js)
- **vite-plugin-localize.js** - Custom Vite plugin for multi-language builds

### 3D Effects

The tiles use advanced perspective transformations:
- PerspectiveMesh for corner-based 3D rendering
- Dynamic tilt based on grab point position
- Real-time shadow projection with coordinate transformations

![screenshot](https://raw.github.com/afarber/pixi-questions/master/drag-tiles-layout/screenshot.gif)

