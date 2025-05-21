# Creating the playing-cards-3d-effect app

    mkdir playing-cards-3d-effect
    cd playing-cards-3d-effect
    npm init -y
    npm install pixi.js @pixi/ui @tweenjs/tween.js
    npm install vite --save-dev
    npx vite (or add entries to package.json "scripts" and: npm run dev)

![screenshot](https://raw.github.com/afarber/pixi-questions/master/playing-cards-3d-effect/screenshot.gif)

Using [Copyright free SVG and print ready playing cards](https://www.me.uk/cards/) by Adrian Kennard.

Convert SVG (do not tilt well) to PNG, preserving transparency with:

    mkdir -p playing-cards-png
    for file in playing-cards-svg/*.svg; do
        filename=$(basename "$file")
        png_file="playing-cards-png/${filename%.svg}.png"
        magick -density 75 -background none "$file" "$png_file"
    done

The sounds are CC0-licensed [Casion Audio](https://kenney.nl/assets/casino-audio) by Kenney

