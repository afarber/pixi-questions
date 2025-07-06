# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build production version
- `npm run lint` - Run ESLint with JavaScript extensions
- `npm run preview` - Preview production build

## Project Architecture

This is a PixiJS-based interactive game featuring a checkered board with draggable tiles and UI panels. The application uses a three-panel layout with responsive design.

### Core Components

- **index.js** - Main application entry point that initializes PixiJS app, loads assets, and sets up the three-panel layout
- **Board.js** - Creates an 8x8 checkered board background with scaling and positioning logic
- **Tile.js** - Draggable game pieces with shadow effects, snap-to-grid functionality, and pointer event handling
- **MyButton.js** - Custom button component extending @pixi/ui FancyButton with animations and sound effects
- **MyVerticalPanel.js** - Layout manager for vertical arrangement of UI elements with responsive sizing
- **MyList.js** - Scrollable list component for displaying game data
- **Theme.js** - Central theme configuration with UI dimensions, colors, and styling constants

### Key Dependencies

- **pixi.js** (v8.9.2) - Main rendering engine
- **@pixi/ui** (v2.2.4) - UI components including FancyButton
- **@pixi/sound** (v6.0.1) - Audio playback for button clicks
- **@tweenjs/tween.js** (v25.0.0) - Animation library for smooth transitions
- **vite** (v6.3.2) - Build tool and development server

### Layout System

The app uses a three-panel responsive layout:
- **Left Panel**: Game controls and lists
- **Middle Panel**: Game board with score display and tiles
- **Right Panel**: Additional buttons (10 buttons with different states)

Panels automatically resize based on screen dimensions using the `onResize` handler that responds to both window resize and fullscreen events.

### Asset Loading

Assets are loaded using PixiJS Assets API with a manifest system:
- **animals bundle**: Bunny sprite from external URL
- **sounds bundle**: Click sound effects (.ogg files) from local assets folder

### Interactive Features

- **Drag & Drop**: Tiles can be dragged around the board with visual feedback (scaling, alpha, shadow)
- **Grid Snapping**: Tiles automatically snap to board grid positions when released
- **Button Animations**: Hover, press, and show/hide animations with sound effects
- **Fullscreen Toggle**: Button 1 toggles fullscreen mode for the entire application

### Development Notes

- Uses CommonJS module format (`"type": "commonjs"` in package.json)
- No test framework is configured
- Vite is used for development and building
- Sound files are CC0-licensed from Kenney's Interface Sounds pack