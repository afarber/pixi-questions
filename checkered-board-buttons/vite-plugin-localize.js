"use strict";

import fs from "fs";
import path from "path";

const localizedStrings = {
  en: {
    __YES__: "Yes",
    __NO__: "No",
    __CANCEL__: "Cancel",
    __GAME__: "Game",
    __NEW_GAME__: "New game",
    __TWO_LETTERS__: "2 letters",
    __THREE_LETTERS__: "3 letters",
    __RARE_LETTER_1__: "Letter Q",
    __RARE_LETTER_2__: "Letter X",
    __YOUR_TURN__: "YOUR TURN",
    __HIS_TURN__: "WAITING",
    __ARCHIVE__: "ARCHIVE",
    __ZERO_GAMES__: "NO GAMES",
    // workaround for ReferenceError: __VITE_PRELOAD__ is not defined
    __VITE_PRELOAD__: "void 0"
  },
  de: {
    __YES__: "Ja",
    __NO__: "Nein",
    __CANCEL__: "Abbrechen",
    __GAME__: "Spiel",
    __NEW_GAME__: "Neues Spiel",
    __TWO_LETTERS__: "2 Buchstaben",
    __THREE_LETTERS__: "3 Buchstaben",
    __RARE_LETTER_1__: "Buchstabe Q",
    __RARE_LETTER_2__: "Buchstabe Y",
    __YOUR_TURN__: "IHR ZUG",
    __HIS_TURN__: "WARTEN",
    __ARCHIVE__: "ARCHIV",
    __ZERO_GAMES__: "KEINE SPIELE",
    // workaround for ReferenceError: __VITE_PRELOAD__ is not defined
    __VITE_PRELOAD__: "void 0"
  },
  fr: {
    __YES__: "Oui",
    __NO__: "Non",
    __CANCEL__: "Annuler",
    __GAME__: "Jeu",
    __NEW_GAME__: "Nouveau jeu",
    __TWO_LETTERS__: "2 lettres",
    __THREE_LETTERS__: "3 lettres",
    __RARE_LETTER_1__: "Lettre K",
    __RARE_LETTER_2__: "Lettre W",
    __YOUR_TURN__: "VOTRE TOUR",
    __HIS_TURN__: "EN ATTENDANT",
    __ARCHIVE__: "ARCHIVE",
    __ZERO_GAMES__: "PAS DE JEUX",
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
