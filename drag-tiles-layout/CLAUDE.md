# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on the codebase
- `npm run test` - Run tests with Vitest in watch mode
- `npm run test:run` - Run tests once without watch mode
- `npm run test:ui` - Run tests with Vitest UI interface

## Architecture Overview

This is a PixiJS-based drag-and-drop tile game with 3D visual effects. The application renders draggable colored tiles on a checkered board with perspective mesh transformations for 3D tilt effects.

### Core Components

**main.js** - Main entry point that initializes the PixiJS application, sets up the stage layout system, and creates the board and tiles.

**Board.js** - Creates an 8x8 checkered board background using PixiJS Graphics. Handles board scaling and positioning to fit the screen while maintaining aspect ratio.

**Tile.js** - Complex tile implementation with two modes:

- Static tiles (non-interactive)
- Draggable tiles with 3D perspective effects using PerspectiveMesh

Key tile features:

- Drag-and-drop with pointer event handling
- 3D tilt effect based on grab point position
- Drop shadows with proper coordinate transformations
- Grid snapping (tiles snap to 8x8 board cells)
- Visual feedback (scaling, alpha changes during drag)

### 3D Perspective System

The tile 3D effect uses:

- `PerspectiveMesh` from PixiJS for corner-based perspective transformation
- Custom `#rotate3D()` private method applying rotation matrices around X and Y axes
- Perspective projection with configurable depth (PERSPECTIVE constant)
- Dynamic corner point calculation based on grab position

### Layout System

Uses `@pixi/layout` for responsive design:

- Stage layout centers content and fills screen
- Board container maintains 1:1 aspect ratio
- Automatic resize handling for responsive behavior

### Build System

- **Vite** for development and bundling with ES modules support
- **Custom localization plugin** (`vite-plugin-localize.js`) creates multiple language versions
- **Modular localization** - Separate files in `locales/` directory (de.js, en.js, fr.js)
- Build outputs `main-XX.js` files for each language with inlined imports
- Localization supports EN, DE, FR with placeholder replacement

### Code Organization

- **ES Modules** - Project uses `"type": "module"` in package.json
- **Private Methods** - Classes use `#` prefix for private methods (e.g., `#setupDraggable`, `#onDragStart`)
- **ESLint** - Configured for ES modules with zero-warning policy

### Key Constants

- `TILE_SIZE = 100` - Base tile size in pixels
- `NUM_CELLS = 8` - Board grid dimensions
- `PERSPECTIVE = 300` - 3D projection depth
- `TILT_ANGLE = 15` - Maximum tilt angle in degrees
