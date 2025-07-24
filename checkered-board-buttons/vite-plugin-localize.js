"use strict";

import fs from "fs";
import path from "path";
import en from "./locales/en.js";
import de from "./locales/de.js";
import fr from "./locales/fr.js";

const localizedStrings = {
  en,
  de,
  fr
};

// replace the placeholders surrounded by triple underscores
function replacePlacesholders(src, lang) {
  return src.replaceAll(/___[_A-Z0-9]+___/g, function (match) {
    return localizedStrings[lang][match] || match;
  });
}

// Ensure directory exists, recursively
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    // Directory already exists, nothing to do
    return;
  }
  // Ensure parent directory exists
  ensureDirectoryExists(dirname);
  // Create this directory
  fs.mkdirSync(dirname);
}

export default function localize(isBuildingBundle) {
  return {
    name: "localize-plugin",
    transform(src, id) {
      if (!isBuildingBundle) {
        // replace placeholders in .js files during development
        if (id.endsWith(".js")) {
          return replacePlacesholders(src, "de");
        }
      }
      return src;
    },
    transformIndexHtml(html, ctx) {
      if (!isBuildingBundle) {
        console.log("Transforming index.html in development mode");
        return html.replace(
          '<script type="module" src="main.js"></script>',
          '<script src="https://wordsbyfarber.com/Consts-de.js"></script>\n    <script type="module" src="main.js"></script>'
        );
      }
      return html;
    },
    generateBundle(outputOptions, bundle) {
      for (const [fileName, bundleValue] of Object.entries(bundle)) {
        if (!fileName.endsWith("main.js")) {
          continue;
        }

        const mainJsPath = path.resolve(outputOptions.dir, fileName);
        console.log("\nReplacing placeholders in", mainJsPath);

        // Ensure the dist directory exists
        ensureDirectoryExists(mainJsPath);

        // create main-XX.js file for each language, in the same folder as main.js
        for (const lang of Object.keys(localizedStrings)) {
          const mainLangPath = path.resolve(outputOptions.dir, `main-${lang}.js`);
          console.log("Creating localized file", mainLangPath);
          fs.writeFileSync(mainLangPath, replacePlacesholders(bundleValue.code, lang));
        }

        // create index-XX.html file for each language
        for (const lang of Object.keys(localizedStrings)) {
          const indexLangPath = path.resolve(outputOptions.dir, `index-${lang}.html`);
          console.log("Creating localized HTML file", indexLangPath);
          const htmlContent = createLocalizedHtml(lang);
          fs.writeFileSync(indexLangPath, htmlContent);
        }
      }
    }
  };
}

function createLocalizedHtml(lang) {
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="https://pixijs.com/assets/bunny.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="Alexander Farber" />
    <title>checkered-board-buttons</title>
    <link rel="stylesheet" href="main.css" />
    <script src="https://wordsbyfarber.com/Consts-${lang}.js"></script>
    <script type="module" src="main-${lang}.js"></script>
  </head>
  <body>
    <div id="fullDiv"><canvas id="pixiCanvas"></canvas></div>
  </body>
</html>`;
}
