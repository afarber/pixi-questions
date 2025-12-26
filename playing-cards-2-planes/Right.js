/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { CardContainer } from './CardContainer.js';
import { Card, CARD_WIDTH } from './Card.js';

/**
 * Right container for displaying opponent cards in a vertical column on the right edge.
 * Cards are stacked vertically with slight fan tilt effect, mirroring the Left container.
 * @extends CardContainer
 */
export class Right extends CardContainer {
  /**
   * Creates a new Right container.
   * @param {object} screen - The screen/viewport dimensions object with width and height
   */
  constructor(screen) {
    super(screen);
    this._maxCards = 12;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;
  }

  /**
   * Repositions all cards in a vertical column arrangement on the right edge.
   * Cards are stacked vertically with slight fan tilt, mirroring the Left container.
   * @protected
   * @override
   */
  _repositionCards() {
    const cards = this.children.filter((child) => child instanceof Card);

    if (cards.length === 0) {
      return;
    }

    // Sort cards and update z-order
    cards.sort(Card.compareCards);
    cards.forEach((card) => this.removeChild(card));
    cards.forEach((card) => this.addChild(card));

    const totalCards = cards.length;
    // Use CARD_WIDTH for spacing since cards are rotated 90 degrees
    // Asymmetric padding: less at top, more at bottom to avoid Hand cards
    const minPaddingTop = CARD_WIDTH / 6;
    const minPaddingBottom = CARD_WIDTH / 2;
    const maxSpacingBetweenCards = CARD_WIDTH / 3;

    const availableHeight = this._screen.height - minPaddingTop - minPaddingBottom - CARD_WIDTH;
    const spacingBetweenCards = Math.min(maxSpacingBetweenCards, availableHeight / (totalCards - 1));

    // Start from top padding instead of centering
    const firstCardY = minPaddingTop + CARD_WIDTH / 2;

    // Fixed X position at right edge, card center on boundary
    const cardX = this._screen.width;

    const middleIndex = (totalCards - 1) / 2;

    // Iterate in reverse so first sorted card is at bottom, indices face center
    cards.reverse().forEach((card, index) => {
      card.x = cardX + card.jitterX;
      card.y = firstCardY + index * spacingBetweenCards + card.jitterY;
      card.baseX = card.x;
      card.baseY = card.y;
      // Hover direction: push left (negative X)
      card.hoverDirX = -1;
      card.hoverDirY = 0;
      // Base -90 degrees for landscape mode, plus tilt: mirrored - cards at top tilt right (+), cards at bottom tilt left (-)
      card.angle = -90 - (index - middleIndex) * 1;
    });
  }
}
