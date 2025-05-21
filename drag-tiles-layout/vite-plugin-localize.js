"use strict";

import fs from "fs";
import path from "path";

const localizedStrings = {
  en: {
    __YES__: "Yes",
    __NO__: "No",
    __CANCEL__: "Cancel",
    // workaround for ReferenceError: __VITE_PRELOAD__ is not defined
    __VITE_PRELOAD__: "void 0"
  },
  de: {
    __YES__: "Ja",
    __NO__: "Nein",
    __CANCEL__: "Abbrechen",
    // workaround for ReferenceError: __VITE_PRELOAD__ is not defined
    __VITE_PRELOAD__: "void 0"
  },
  fr: {
    __YES__: "Oui",
    __NO__: "Non",
    __CANCEL__: "Annuler",
    // workaround for ReferenceError: __VITE_PRELOAD__ is not defined
    __VITE_PRELOAD__: "void 0"
  }
};

function replacePlacesholders(src, lang) {
  return src.replaceAll(/__[_A-Z0-9]+__/g, function (match) {
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
      return id.endsWith(".js") && !isBuildingBundle
        ? replacePlacesholders(src, "de")
        : src;
    },
    generateBundle(outputOptions, bundle) {
      for (const [fileName, bundleValue] of Object.entries(bundle)) {
        if (!fileName.endsWith("index.js")) {
          continue;
        }
        const indexJsPath = path.resolve(outputOptions.dir, fileName);
        console.log("\nReplacing placeholders in", indexJsPath);

        // Ensure the dist directory exists
        ensureDirectoryExists(indexJsPath);

        // create index-XX.js file for each language, in the same folder as index.js
        for (const lang of Object.keys(localizedStrings)) {
          const indexLangPath = path.resolve(
            outputOptions.dir,
            `index-${lang}.js`
          );
          console.log("Creating localized file", indexLangPath);
          fs.writeFileSync(
            indexLangPath,
            replacePlacesholders(bundleValue.code, lang)
          );
        }
      }
    }
  };
}
