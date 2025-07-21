# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Architecture Overview

This is a PixiJS application that creates a checkered board with 3D draggable tiles. The main components are:

### Core Files

- **main.js** - Main application entry point that initializes the PixiJS Application and creates the game objects
- **Board.js** - Creates the checkered board background with 8x8 grid using Graphics
- **Tile.js** - Complex draggable tile component with 3D tilt effects using PerspectiveMesh

### Key Architecture Concepts

**3D Perspective System**: The application uses PixiJS PerspectiveMesh to create 3D tilt effects when dragging tiles. The `#rotate3D()` private method in Tile.js applies perspective projection with configurable angles and depth.

**Drag System**: Tiles use pointer events with custom hit areas and coordinate system conversions. The drag system maintains proper parent-child coordinate relationships and includes shadow effects during dragging.

**Responsive Layout**: The Board component automatically scales and centers itself based on window size, maintaining aspect ratio.

**Custom Vite Plugin**: The `vite-plugin-localize.js` creates localized versions of the bundle for different languages (en/de/fr) by replacing placeholder strings. Localization strings are now organized in separate files within the `locales/` directory.

### Dependencies

- **pixi.js** - Main graphics library
- **@pixi/ui** - UI components (installed but not actively used)
- **@tweenjs/tween.js** - Animation library (installed but not actively used)

### Constants and Configuration

- Board size: 8x8 cells (NUM_CELLS in Board.js)
- Tile size: 100px (TILE_SIZE in Tile.js)
- 3D effect: 15-degree max tilt angle with 300px perspective distance
- Shadow offset: 12px right, 8px down in screen coordinates

### Coordinate Systems

The application manages multiple coordinate systems:
- Screen/global coordinates for shadows and pointer events
- Parent coordinates for tile positioning
- Local coordinates for tile corner calculations
- 3D projected coordinates for perspective effects