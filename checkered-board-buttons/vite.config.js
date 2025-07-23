import { defineConfig } from "vite";
import localize from "./vite-plugin-localize";

// is this a "vite build" command?
const isBuildingBundle = process.argv.length > 0 && process.argv[process.argv.length - 1] === "build";

export default defineConfig({
  plugins: [localize(isBuildingBundle)],
  // index.html includes ./main.css and ./main.js
  base: "./",
  build: {
    target: "es2015",
    // keep quotes around object properties when minifying
    minify: "terser",
    terserOptions: {
      format: {
        quote_keys: true,
        quote_style: 2
      }
    },
    rollupOptions: {
      input: {
        main: "./main.js"
      },
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        // Ensures all imports are in one file
        inlineDynamicImports: true
      }
    }
  }
});
