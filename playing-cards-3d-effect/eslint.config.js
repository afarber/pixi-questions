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
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];