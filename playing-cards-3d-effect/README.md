# Playing Cards 3D Effect

A PixiJS-based interactive playing cards application that demonstrates 3D visual effects and drag-and-drop functionality.

## Installation

```bash
npm install
npm run dev
```

## How the Project Was Set Up

This project was created from scratch using the following commands:

```bash
mkdir playing-cards-3d-effect
cd playing-cards-3d-effect
npm init -y
npm install pixi.js @pixi/ui @pixi/sound @tweenjs/tween.js
npm install vite --save-dev
```

Then scripts were added to package.json and the development server was started with `npm run dev`.

![screenshot](https://raw.github.com/afarber/pixi-questions/master/playing-cards-3d-effect/screenshot.gif)

Using [Copyright free SVG and print ready playing cards](https://www.me.uk/cards/) by Adrian Kennard.

Convert SVG (do not tilt well) to PNG, preserving transparency with:

    mkdir -p playing-cards-png
    for file in playing-cards-svg/*.svg; do
        filename=$(basename "$file")
        png_file="playing-cards-png/${filename%.svg}.png"
        magick -density 75 -background none "$file" "$png_file"
    done

The sounds are CC0-licensed [Casino Audio](https://kenney.nl/assets/casino-audio) by Kenney.
