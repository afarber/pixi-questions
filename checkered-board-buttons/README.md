# Checkered Board Buttons

An interactive PixiJS-based game featuring a checkered board with draggable tiles and responsive UI panels. The application demonstrates modern web game development with smooth animations, drag-and-drop functionality, and audio feedback.

## Features

- **Interactive Game Board**: 8x8 checkered board with draggable colored tiles
- **Three-Panel Layout**: Responsive design with left controls, center game area, and right button panel
- **Smooth Animations**: Drag effects with scaling, transparency, and shadow feedback
- **Audio Integration**: Click sounds using @pixi/sound library
- **Fullscreen Support**: Toggle fullscreen mode for immersive gameplay
- **Grid Snapping**: Automatic tile positioning to board grid

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Setup

If you want to recreate this project from scratch:

```bash
# Initialize project
npm init -y

# Install dependencies
npm install pixi.js @pixi/ui @pixi/sound @tweenjs/tween.js
npm install vite @playwright/test @vitest/ui jsdom vitest vitest-canvas-mock --save-dev
```

## Available Scripts

- `npm run dev` - Start development server with Vite
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

![screenshot](https://raw.github.com/afarber/pixi-questions/master/checkered-board-buttons/screenshot.gif)

## Credits

The sounds are CC0-licensed [Interface Sounds](https://kenney.nl/assets/interface-sounds) by Kenney

