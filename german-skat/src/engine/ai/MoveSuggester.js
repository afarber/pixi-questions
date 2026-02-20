/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { CardHelper } from '../utils/CardHelper.js';

export class MoveSuggester {
  static suggestMoves(playableCards) {
    if (!playableCards.length) {
      return null;
    }
    return CardHelper.getWeakest(playableCards) || playableCards[0];
  }
}
