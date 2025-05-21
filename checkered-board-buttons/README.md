# Creating the checkered-board-buttons app

    mkdir checkered-board-buttons
    cd checkered-board-buttons
    npm init -y
    npm install pixi.js @pixi/ui @pixi/sound @tweenjs/tween.js
    npm install vite --save-dev
    npx vite (or add entries to package.json "scripts" and: `npm run dev`)

![screenshot](https://raw.github.com/afarber/pixi-questions/master/checkered-board-buttons/screenshot.gif)

The sounds are CC0-licensed [Interface Sounds](https://kenney.nl/assets/interface-sounds) by Kenney

If `vite build` is failing, create the `dist` folder manually
