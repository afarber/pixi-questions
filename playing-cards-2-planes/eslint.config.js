/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    },
    rules: {
      "indent": ["error", 2],
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "linebreak-style": ["error", "unix"],
      "semi": ["error", "always"],
      // "quotes": ["warn", "single"],
      "prefer-const": "error",
      "no-var": "error"
    }
  }
];