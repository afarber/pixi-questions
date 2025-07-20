"use strict";

import fs from "fs";
import path from "path";

const localizedStrings = {
  en: {
    ___YES___: "Yes",
    ___NO___: "No",
    ___CANCEL___: "Cancel",
    ___GAME___: "Game",
    ___NEW_GAME___: "New game",
    ___TWO_LETTERS___: "2 letters",
    ___THREE_LETTERS___: "3 letters",
    ___RARE_LETTER_1___: "Letter Q",
    ___RARE_LETTER_2___: "Letter X",
    ___YOUR_TURN___: "YOUR TURN",
    ___HIS_TURN___: "WAITING",
    ___ARCHIVE___: "ARCHIVE",
    ___ZERO_GAMES___: "NO GAMES"
  },
  de: {
    ___YES___: "Ja",
    ___NO___: "Nein",
    ___CANCEL___: "Abbrechen",
    ___GAME___: "Spiel",
    ___NEW_GAME___: "Neues Spiel",
    ___TWO_LETTERS___: "2 Buchstaben",
    ___THREE_LETTERS___: "3 Buchstaben",
    ___RARE_LETTER_1___: "Buchstabe Q",
    ___RARE_LETTER_2___: "Buchstabe Y",
    ___YOUR_TURN___: "IHR ZUG",
    ___HIS_TURN___: "WARTEN",
    ___ARCHIVE___: "ARCHIV",
    ___ZERO_GAMES___: "KEINE SPIELE"
  },
  fr: {
    ___YES___: "Oui",
    ___NO___: "Non",
    ___CANCEL___: "Annuler",
    ___GAME___: "Jeu",
    ___NEW_GAME___: "Nouveau jeu",
    ___TWO_LETTERS___: "2 lettres",
    ___THREE_LETTERS___: "3 lettres",
    ___RARE_LETTER_1___: "Lettre K",
    ___RARE_LETTER_2___: "Lettre W",
    ___YOUR_TURN___: "VOTRE TOUR",
    ___HIS_TURN___: "EN ATTENDANT",
    ___ARCHIVE___: "ARCHIVE",
    ___ZERO_GAMES___: "PAS DE JEUX"
  }
};

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
      return id.endsWith(".js") && !isBuildingBundle
        ? replacePlacesholders(src, "de")
        : src;
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
          const mainLangPath = path.resolve(
            outputOptions.dir,
            `main-${lang}.js`
          );
          console.log("Creating localized file", mainLangPath);
          fs.writeFileSync(
            mainLangPath,
            replacePlacesholders(bundleValue.code, lang)
          );
        }
      }
    }
  };
}
