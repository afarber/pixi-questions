/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { defineConfig } from 'vite';
import localizeFixedDe from './vite-plugin-localize.js';

/**
 * Vite configuration for the local Pixi Skat game.
 * Localization is fixed to German during transform.
 */
export default defineConfig({
  plugins: [localizeFixedDe()]
});
