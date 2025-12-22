/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, TWEEN_DURATION } from './Card.js';

/**
 * Base class for card containers (Hand, Left, Right).
 * Provides shared functionality for adding, removing, and animating cards.
 * Subclasses must implement _repositionCards() for specific layout logic.
 * @extends Container
 */
export class CardContainer extends Container {
  /**
   * Creates a new CardContainer.
   * @param {object} screen - The screen/viewport dimensions object with width and height
   */
  constructor(screen) {
    super();
    this._screen = screen;
    this._maxCards = Infinity;
  }

  /**
   * Gets the number of cards currently in this container.
   * @returns {number} The card count
   * @protected
   */
  _getCardCount() {
    return this.children.filter((child) => child instanceof Card).length;
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
   * Adds a card to the container with optional animation from a starting position.
   * @param {object} spriteSheet - The sprite sheet containing card textures
   * @param {string} textureKey - The texture key for the card (e.g., "AS", "KH")
   * @param {object|null} startPos - Starting position for animation, or null for initial placement
   * @param {number|null} startAngle - Starting angle for animation
   * @param {number|null} startAlpha - Starting alpha for animation
   * @param {Function|null} clickHandler - Optional click handler callback
   * @returns {boolean} True if card was added, false if container is at capacity
   */
  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    if (this._getCardCount() >= this._maxCards) {
      return false;
    }

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

    return true;
  }

  /**
   * Removes a card from the container.
   * @param {Card} card - The card to remove
   */
  removeCard(card) {
    this.removeChild(card);
  }

  /**
   * Repositions all cards in the container.
   * Subclasses must override this method to implement specific layout logic.
   * @protected
   * @abstract
   */
  _repositionCards() {
    throw new Error('Subclass must implement _repositionCards()');
  }
}
