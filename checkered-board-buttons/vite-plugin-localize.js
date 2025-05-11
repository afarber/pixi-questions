"use strict";

import fs from "fs";
import path from "path";

const localizedStrings = {
  en: {
    __YES__: "Yes",
    __NO__: "No",
    __CANCEL__: "Cancel",
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
    __YOUR_TURN__: "VOTRE TOUR",
    __HIS_TURN__: "EN ATTENDANT",
    __ARCHIVE__: "ARCHIVE",
    __ZERO_GAMES__: "PAS DE JEUX",
    // workaround for ReferenceError: __VITE_PRELOAD__ is not defined
    __VITE_PRELOAD__: "void 0"
  }
};

function replacePlacesholders(src, lang) {
  return src.replaceAll(/__[_A-Z]+__/g, function (match) {
    return localizedStrings[lang][match] || match;
  });
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
