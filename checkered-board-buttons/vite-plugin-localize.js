"use strict";

// Vite plugin for localizing JavaScript and HTML files
// Replaces triple underscore placeholders with localized strings

import fs from "fs";
import path from "path";
import en from "./locales/en.js";
import de from "./locales/de.js";
import fr from "./locales/fr.js";

// Map of language codes to their localized string objects
const localizedStrings = {
  en,
  de,
  fr
};

// Replace placeholders surrounded by triple underscores with localized strings
// Falls back to original placeholder if no translation is found
function replacePlacesholders(src, lang) {
  return src.replaceAll(/___[_A-Z0-9]+___/g, function (match) {
    return localizedStrings[lang][match] || match;
  });
}

// Recursively create directory structure if it doesn't exist
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    // Directory already exists, nothing to do
    return;
  }
  // Ensure parent directory exists first
  ensureDirectoryExists(dirname);
  // Create this directory
  fs.mkdirSync(dirname);
}

// Main plugin function that returns Vite plugin configuration
export default function localize(isBuildingBundle) {
  return {
    name: "localize-plugin",
    // Transform source code during development and build
    transform(src, id) {
      if (!isBuildingBundle) {
        // In development mode, replace placeholders in .js files with German strings
        if (id.endsWith(".js")) {
          return replacePlacesholders(src, "de");
        }
      }
      return src;
    },
    // Transform index.html during development and build
    transformIndexHtml(html) {
      if (!isBuildingBundle) {
        console.log("Transforming index.html in development mode");
        // In development mode, replace placeholders with German strings
        return replacePlacesholders(html, "de");
      }
      return html;
    },
    // Generate localized files during build process
    generateBundle(outputOptions, bundle) {
      // Process each file in the bundle
      for (const [fileName, bundleValue] of Object.entries(bundle)) {
        // Only process the main.js file
        if (!fileName.endsWith("main.js")) {
          continue;
        }

        const mainJsPath = path.resolve(outputOptions.dir, fileName);
        console.log("\nReplacing placeholders in", mainJsPath);

        // Ensure the output directory exists
        ensureDirectoryExists(mainJsPath);

        // Create localized JavaScript files (main-en.js, main-de.js, main-fr.js)
        for (const lang of Object.keys(localizedStrings)) {
          const mainLangPath = path.resolve(outputOptions.dir, `main-${lang}.js`);
          console.log("Creating localized file", mainLangPath);
          fs.writeFileSync(mainLangPath, replacePlacesholders(bundleValue.code, lang));
        }

        // Create localized HTML files (index-en.html, index-de.html, index-fr.html)
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
