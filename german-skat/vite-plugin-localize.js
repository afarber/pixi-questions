/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import de from './locales/de.js';

/**
 * Replaces ___KEY___ placeholders in JavaScript source using a fixed German dictionary.
 * This keeps the same placeholder-based localization style as sibling projects,
 * without supporting runtime language switching.
 * @returns {import('vite').Plugin} Vite transform plugin.
 */
export default function localizeFixedDe() {
  return {
    name: 'localize-fixed-de',
    transform(src, id) {
      if (!id.endsWith('.js')) {
        return src;
      }
      return src.replaceAll(/___[_A-Z0-9]+___/g, (match) => de[match] || match);
    }
  };
}
