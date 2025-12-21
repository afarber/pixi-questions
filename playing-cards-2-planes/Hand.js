/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION, CARD_VISIBLE_RATIO } from './Card.js';

/**
 * Hand container for displaying the player's cards at the bottom of the screen.
 * Cards are arranged horizontally with a slight fan tilt effect.
 * @extends Container
 */
export class Hand extends Container {
  /**
   * Creates a new Hand container.
   * @param {object} screen - The screen/viewport dimensions object with width and height
   */
  constructor(screen) {
    super();

    this._screen = screen;
  }

  /**
   * Handles window resize by repositioning the container and all cards.
   */
  resize() {
    this.x = 0;
    this.y = 0;

    this._repositionCards();
  }

  /**
   * Adds a card to the hand with optional animation from a starting position.
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
      // Animate card from startPos to target position
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
      // Initial card placement: enable hover immediately
      card.enableHoverEffect();
    }
  }

  /**
   * Removes a card from the hand.
   * @param {Card} card - The card to remove
   */
  removeCard(card) {
    this.removeChild(card);
  }

  /**
   * Repositions all cards in a horizontal fan arrangement.
   * Cards are centered at the bottom of the screen with a slight tilt.
   * @private
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
