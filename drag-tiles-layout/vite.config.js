/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { defineConfig } from "vite";
import localize from "./vite-plugin-localize";

// is this a "vite build" command?
const isBuildingBundle =
  process.argv.length > 0 && process.argv[process.argv.length - 1] === "build";

export default defineConfig({
  plugins: [localize(isBuildingBundle)],
  // index.html includes ./main.css and ./main.js
  base: "./",
  build: {
    target: "es2015",
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        // Ensures all imports are in one file
        inlineDynamicImports: true,
      },
    },
  },
});
