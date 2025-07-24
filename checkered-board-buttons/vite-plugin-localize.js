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
        // In development, keep main.js but add the external dictionary
        return html
          .replace('___LANG___', 'de')
          .replace('___CONSTS_URL___', 'https://wordsbyfarber.com/Consts-de.js')
          .replace('___MAIN_JS___', 'main.js');
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
        const indexHtmlPath = path.resolve(process.cwd(), "index.html");
        const originalHtml = fs.readFileSync(indexHtmlPath, "utf-8");
        
        for (const lang of Object.keys(localizedStrings)) {
          const indexLangPath = path.resolve(outputOptions.dir, `index-${lang}.html`);
          console.log("Creating localized HTML file", indexLangPath);
          const htmlContent = replacePlacesholders(originalHtml, lang);
          fs.writeFileSync(indexLangPath, htmlContent);
        }
      }
    }
  };
}

