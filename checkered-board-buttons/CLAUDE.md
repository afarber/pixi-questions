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

- **main.js** - Main application entry point that initializes PixiJS app, loads assets, and sets up the three-panel layout
- **Board.js** - Creates an 8x8 checkered board background with scaling and positioning logic
- **Tile.js** - Draggable game pieces with shadow effects, snap-to-grid functionality, and pointer event handling
- **MyButton.js** - Custom button component extending @pixi/ui FancyButton with animations and sound effects
- **MyVerticalPanel.js** - Layout manager for vertical arrangement of UI elements with responsive sizing
- **MyList.js** - Scrollable list component for displaying game data
- **MyConfirmDialog.js** - Modal dialog with dark overlay, centered panel, and Yes/No buttons for confirmations
- **MyLayoutManager.js** - Centralized layout system that handles responsive resizing for all panels and dialog
- **Theme.js** - Central theme configuration with UI dimensions, colors, and styling constants

### Key Dependencies

- **pixi.js** - Main rendering engine
- **@pixi/ui** - UI components including FancyButton
- **@pixi/sound** - Audio playback for button clicks
- **@tweenjs/tween.js** - Animation library for smooth transitions
- **vite** - Build tool and development server

### Layout System

The app uses a three-panel responsive layout:

- **Left Panel**: Game controls and lists
- **Middle Panel**: Game board with score display and tiles
- **Right Panel**: Additional buttons (10 buttons with different states)

Panels automatically resize based on screen dimensions using MyLayoutManager which handles window resize and fullscreen events centrally.

### Asset Loading

Assets are loaded using PixiJS Assets API with a manifest system:

- **animals bundle**: Bunny sprite from external URL
- **sounds bundle**: Click sound effects (.ogg files) from local assets folder

### Interactive Features

- **Drag & Drop**: Tiles can be dragged around the board with visual feedback (scaling, alpha, shadow)
- **Grid Snapping**: Tiles automatically snap to board grid positions when released
- **Button Animations**: Hover, press, and show/hide animations with sound effects
- **Fullscreen Toggle**: Button 1 toggles fullscreen mode for the entire application
- **Modal Dialogs**: Confirmation dialogs with dark overlay for destructive actions like resign, skip, etc.

### Internationalization System

The project uses a custom localization system with triple underscore placeholders:

- **Placeholders**: Use `___LANG___`, `___PLACEHOLDER_NAME___` format in source files
- **Locale Files**: `locales/en.js`, `locales/de.js`, `locales/fr.js` contain translation mappings
- **External Dictionaries**: Loads `https://wordsbyfarber.com/Consts-{lang}.js` for additional constants, like `LETTERS` array and `HASHED` map

#### Development Mode

- Uses German (`de`) as default language
- Transforms placeholders in `.js` files and `index.html` on-the-fly
- References `main.js` directly (placeholders get replaced in memory)

#### Build Mode

- **vite-plugin-localize.js** generates separate files for each language:
  - `main-en.js`, `main-de.js`, `main-fr.js` (localized JavaScript bundles)
  - `index-en.html`, `index-de.html`, `index-fr.html` (localized HTML files)
- Each HTML file references its corresponding `main-{lang}.js` and `Consts-{lang}.js`

The plugin handles both development convenience (single file) and production deployment (multiple localized versions).

### Development Notes

- Uses ES module format (`"type": "module"` in package.json)
- Testing configured with Vitest (unit tests) and Playwright (E2E tests)
- Vite is used for development and building with custom localize plugin
- Build output bundles everything into single files for deployment

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
After each change display the following output for the User: 1 line commit message followed by detailed list of changes
NEVER use emoji and ALWAYS keep comments on separate lines
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
