"use strict";

import fs from "fs";
import path from "path";
import de from "./locales/de.js";
import en from "./locales/en.js";
import fr from "./locales/fr.js";

const localizedStrings = {
  de,
  en,
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
      // replace placeholders in .js files, when not building the bundle
      return id.endsWith(".js") && !isBuildingBundle ? replacePlacesholders(src, "de") : src;
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
      }
    }
  };
}
