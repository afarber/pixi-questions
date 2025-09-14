# Playing cards displayed on 2 planes: UI and table

A PixiJS-based interactive playing cards application that demonstrates 3D visual effects

## Installation

```bash
npm install
npm run dev
```

## How the project was set up

This project was created from scratch using the following commands:

```bash
mkdir playing-cards-2-planes
cd playing-cards-2-planes
npm init -y
npm install pixi.js @pixi/ui @pixi/sound @tweenjs/tween.js
npm install vite --save-dev
```

Then scripts were added to package.json and the development server was started with `npm run dev`.

![screenshot](https://raw.github.com/afarber/pixi-questions/master/playing-cards-2-planes/screenshot.png)

Using [Copyright free SVG and print ready playing cards](https://www.me.uk/cards/) by Adrian Kennard.

Convert SVG (do not tilt well) to PNG, preserving transparency with:

    mkdir -p playing-cards-png
    for file in playing-cards-svg/*.svg; do
        filename=$(basename "$file")
        png_file="playing-cards-png/${filename%.svg}.png"
        magick -density 75 -background none "$file" "$png_file"
    done

The sounds are CC0-licensed [Casino Audio](https://kenney.nl/assets/casino-audio) by Kenney.
