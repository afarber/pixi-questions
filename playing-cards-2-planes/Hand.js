/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { CardContainer } from './CardContainer.js';
import { Card, CARD_WIDTH, CARD_HEIGHT, CARD_VISIBLE_RATIO } from './Card.js';

/**
 * Hand container for displaying the player's cards at the bottom of the screen.
 * Cards are arranged horizontally with a slight fan tilt effect.
 * @extends CardContainer
 */
export class Hand extends CardContainer {
  /**
   * Creates a new Hand container.
   * @param {object} screen - The screen/viewport dimensions object with width and height
   */
  constructor(screen) {
    super(screen);
    this._maxCards = 12;
  }

  /**
   * Repositions all cards in a horizontal fan arrangement.
   * Cards are centered at the bottom of the screen with a slight tilt.
   * @protected
   * @override
   */
  _repositionCards() {
    const cards = this.children.filter((child) => child instanceof Card);

    if (cards.length === 0) {
      return;
    }

    if (cards.length === 1) {
      const card = cards[0];
      card.x = this._screen.width / 2;
      card.y = this._screen.height - CARD_VISIBLE_RATIO * CARD_HEIGHT;
      card.baseY = card.y;
      card.angle = 0;
      return;
    }

    // Sort cards and update their z-order
    cards.sort(Card.compareCards);
    cards.forEach((card) => this.removeChild(card));
    cards.forEach((card) => this.addChild(card));

    const totalCards = cards.length;
    const minPaddingToScreenEdge = CARD_WIDTH / 6;
    // Limit max spacing to prevent cards from spreading too far in late game
    const maxSpacingBetweenCards = CARD_WIDTH / 2;

    const availableWidth = this._screen.width - 2 * minPaddingToScreenEdge - CARD_WIDTH;
    const spacingBetweenCards = Math.min(maxSpacingBetweenCards, availableWidth / (totalCards - 1));

    const totalCardsWidth = (totalCards - 1) * spacingBetweenCards;
    const firstCardX = this._screen.width / 2 - totalCardsWidth / 2;

    const middleIndex = (totalCards - 1) / 2;

    cards.forEach((card, index) => {
      card.x = firstCardX + index * spacingBetweenCards + card.jitterX;
      card.y = this._screen.height - CARD_VISIBLE_RATIO * CARD_HEIGHT + card.jitterY;
      card.baseY = card.y;
      // Apply tilt: 0 degrees at middle, increasing by 1 degree per card away from center
      card.angle = (index - middleIndex) * 1;
    });
  }
}
