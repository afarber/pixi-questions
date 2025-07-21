# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run lint` - Run ESLint with JS/JSX extensions
- `npm run preview` - Preview production build locally

## Project Architecture

This is a PixiJS-based interactive playing cards application that demonstrates 3D visual effects and drag-and-drop functionality.

### Core Components

**Application Structure:**
- `main.js` - Main application entry point that initializes PixiJS app, loads sprite sheet, and creates the board
- `Board.js` - Container class that manages the game board, background gradient, and card creation  
- `Card.js` - Individual card component with 3D perspective effects and drag interaction

**Key Architecture Patterns:**
- Uses PixiJS v8 with ES modules
- Component-based architecture with Container classes
- Event-driven drag and drop system using pointer events
- 3D perspective effects using PerspectiveMesh with custom corner projection

### 3D Visual Effects System

The application implements a sophisticated 3D tilt effect:
- Cards use `PerspectiveMesh` for 3D perspective rendering
- `rotate3D()` function in `Card.js:236` applies 3D rotation transformations
- Perspective projection creates depth illusion based on grab point
- Shadow system with offset positioning for enhanced 3D appearance

### Asset Management

**Sprite Sheets:**
- `playing-cards.json` - Main sprite sheet definition
- `playing-cards.png` - Texture atlas containing all card images
- Individual PNG cards in `playing-cards-png/` folders as backup assets

**Audio Assets:**
- CC0-licensed casino sounds in `assets/` directory
- Not currently integrated into the codebase

### Build System

**Vite Configuration:**
- Custom `vite-plugin-localize.js` for internationalization
- ES2015 target with inline dynamic imports
- Asset name patterns without hashing for consistent output
- ES modules enabled with "type": "module" in package.json

**Localization:**
- Custom Vite plugin supports English, German, and French
- Localization strings organized in separate files under `locales/` directory (de.js, en.js, fr.js)
- Generates separate `main-{lang}.js` files during build
- Placeholder replacement system using `__PLACEHOLDER__` format

### Key Constants and Configuration

**Card Dimensions (Card.js:3-4):**
- `CARD_WIDTH = 188`
- `CARD_HEIGHT = 263`
- `CARD_SCALE = 1.4` (when dragging)

**3D Effect Parameters (Card.js:12-14):**
- `PERSPECTIVE = 400`
- `NUM_VERTICES = 40` (mesh resolution)
- `TILT_ANGLE = 5` (max tilt degrees)

**Board Layout (Board.js:5):**
- `NUM_CELLS = 4` (4x4 grid system)

### Event System

The drag system uses a state-based approach:
- `onDragStart()` - Scales card, shows shadow, calculates 3D tilt
- `onDragMove()` - Updates position maintaining grab offset
- `onDragEnd()` - Resets scale, hides shadow, flattens mesh

Stage-level event listeners are managed dynamically to ensure proper cleanup and avoid memory leaks.