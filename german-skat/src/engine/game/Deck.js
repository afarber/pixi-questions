/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { GameDefs } from '../utils/GameDefs.js';

export class Deck {
  constructor() {
    this.cards = [];
    this.loadCards();
  }

  loadCards() {
    this.cards = GameDefs.CARD_IMAGE_FILE_IDS.map((id) => ({
      rankEnum: id.charCodeAt(0),
      suitEnum: id.charCodeAt(1)
    }));
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawTopCard() {
    return this.cards.pop();
  }
}
