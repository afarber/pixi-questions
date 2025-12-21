/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, CARD_WIDTH, TWEEN_DURATION, CARD_VISIBLE_RATIO } from './Card.js';

/**
 * Right container for displaying opponent cards in a vertical column on the right edge.
 * Cards are stacked vertically with slight fan tilt effect, mirroring the Left container.
 * @extends Container
 */
export class Right extends Container {
  /**
   * Creates a new Right container.
   * @param {object} screen - The screen/viewport dimensions object with width and height
   */
  constructor(screen) {
    super();

    this._screen = screen;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;
  }

  /**
   * Handles window resize by repositioning the container and all cards.
   */
  resize() {
    // Right plane positioned to account for perspective transform
    this.x = 0;
    this.y = 0;

    // Reposition cards after resize
    this._repositionCards();
  }

  /**
   * Adds a card to the right column with optional animation from a starting position.
   * @param {object} spriteSheet - The sprite sheet containing card textures
   * @param {string} textureKey - The texture key for the card (e.g., "AS", "KH")
   * @param {object|null} startPos - Starting position for animation, or null for initial placement
   * @param {number|null} startAngle - Starting angle for animation
   * @param {number|null} startAlpha - Starting alpha for animation
   * @param {Function|null} clickHandler - Optional click handler callback
   */
  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    const card = new Card(spriteSheet, textureKey, clickHandler);

    this.addChild(card);
    this._repositionCards();

    const targetX = card.x;
    const targetY = card.y;
    const targetAngle = card.angle;

    if (startPos) {
      // Animate card from startPos to target position (moving from another container)
      card.x = startPos.x;
      card.y = startPos.y;
      card.angle = startAngle;
      card.alpha = startAlpha;

      const tween = new Tween(card, Card.tweenGroup)
        .to({ x: targetX, y: targetY, angle: targetAngle, alpha: 1 }, TWEEN_DURATION)
        .easing(Easing.Cubic.Out)
        .onComplete(() => card.enableHoverEffect());
      Card.tweenGroup.add(tween);
      tween.start();
    } else {
      // Initial card placement: keep repositioned coordinates, enable hover immediately
      card.enableHoverEffect();
    }
  }

  /**
   * Removes a card from the right column.
   * @param {Card} card - The card to remove
   */
  removeCard(card) {
    this.removeChild(card);
  }

  /**
   * Repositions all cards in a vertical column arrangement on the right edge.
   * Cards are stacked vertically with slight fan tilt, mirroring the Left container.
   * @private
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
    const minPaddingToScreenEdge = CARD_WIDTH / 3;
    const maxSpacingBetweenCards = CARD_WIDTH * CARD_VISIBLE_RATIO;

    const availableHeight = this._screen.height - 2 * minPaddingToScreenEdge - CARD_WIDTH;
    const spacingBetweenCards = Math.min(maxSpacingBetweenCards, availableHeight / (totalCards - 1));

    const totalCardsHeight = (totalCards - 1) * spacingBetweenCards;
    const firstCardY = this._screen.height / 2 - totalCardsHeight / 2;

    // Fixed X position near right edge
    const cardX = this._screen.width - CARD_WIDTH / 2 - CARD_WIDTH / 6;

    const middleIndex = (totalCards - 1) / 2;

    // Iterate in reverse so first sorted card is at bottom, indices face center
    cards.reverse().forEach((card, index) => {
      card.x = cardX + card.jitterX;
      card.y = firstCardY + index * spacingBetweenCards + card.jitterY;
      card.baseX = card.x;
      card.baseY = card.y;
      // Hover direction: push right (negative X)
      card.hoverDirX = -1;
      card.hoverDirY = 0;
      // Base -90 degrees for landscape mode, plus tilt: mirrored - cards at top tilt right (+), cards at bottom tilt left (-)
      card.angle = -90 - (index - middleIndex) * 1;
    });
  }
}
