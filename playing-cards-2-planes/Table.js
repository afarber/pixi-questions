/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, CARD_WIDTH, CARD_HEIGHT, CARD_MAX_TABLE_ANGLE, TWEEN_DURATION } from './Card.js';

/**
 * Table container for displaying cards in the center play area.
 * Uses a 2x2 quadrant system where each quadrant holds at most one card.
 * @extends Container
 */
export class Table extends Container {
  /**
   * Creates a new Table container.
   * @param {object} screen - The screen/viewport dimensions object with width and height
   */
  constructor(screen) {
    super();

    this._screen = screen;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;

    // Rectangle bounds (SSOT) - will be calculated in _updateBounds()
    this._bounds = {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0
    };

    // Track which card is in each quadrant (null = empty)
    // Layout: [0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right]
    this._quadrantCards = [null, null, null, null];

    // Debug bounds outline (set alpha to 0 to hide)
    this._boundsGraphics = new Graphics();
    this._boundsGraphics.alpha = 1;
    this.addChild(this._boundsGraphics);

    // Initialize bounds
    this._updateBounds();
  }

  /**
   * Handles window resize by repositioning the container and all cards.
   */
  resize() {
    this.x = 0;
    this.y = 0;

    this._updateBounds();
    this._repositionCards();
  }

  /**
   * Updates the rectangle bounds and redraws the debug outline.
   * Uses consistent padding matching Left/Right containers.
   * @private
   */
  _updateBounds() {
    const paddingY = CARD_WIDTH / 6;
    // Horizontal padding must be wider to avoid Left/Right cards (which are rotated 90 degrees)
    const paddingX = CARD_HEIGHT;

    // Card positions are at center, so add half card size to keep cards fully inside
    this._bounds.minX = paddingX + CARD_WIDTH / 3;
    this._bounds.maxX = this._screen.width - paddingX - CARD_WIDTH / 3;
    this._bounds.minY = paddingY + CARD_HEIGHT / 3;
    this._bounds.maxY = this._screen.height - paddingY - (2 * CARD_HEIGHT) / 3;

    this._drawBounds();
  }

  /**
   * Gets the bounds for a specific quadrant.
   * @param {number} index - Quadrant index (0-3)
   * @returns {object} Object with minX, maxX, minY, maxY for the quadrant
   * @private
   */
  _getQuadrantBounds(index) {
    const { minX, maxX, minY, maxY } = this._bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    switch (index) {
    case 0: // top-left
      return { minX, maxX: midX, minY, maxY: midY };
    case 1: // top-right
      return { minX: midX, maxX, minY, maxY: midY };
    case 2: // bottom-left
      return { minX, maxX: midX, minY: midY, maxY };
    case 3: // bottom-right
      return { minX: midX, maxX, minY: midY, maxY };
    default:
      return { minX, maxX, minY, maxY };
    }
  }

  /**
   * Gets indices of quadrants that don't have a card.
   * @returns {number[]} Array of free quadrant indices
   * @private
   */
  _getFreeQuadrants() {
    const free = [];
    for (let i = 0; i < this._quadrantCards.length; i++) {
      if (this._quadrantCards[i] === null) {
        free.push(i);
      }
    }
    return free;
  }

  /**
   * Draws 4 quadrant rectangles for debugging purposes.
   * Shows the area where card centers can be placed.
   * @private
   */
  _drawBounds() {
    this._boundsGraphics.clear();

    for (let i = 0; i < this._quadrantCards.length; i++) {
      const qb = this._getQuadrantBounds(i);
      this._boundsGraphics.rect(qb.minX, qb.minY, qb.maxX - qb.minX, qb.maxY - qb.minY);
      this._boundsGraphics.stroke({ width: 2, color: 0xff0000 });
    }
  }

  /**
   * Repositions all cards to stay within their quadrant bounds after resize.
   * @private
   */
  _repositionCards() {
    for (let i = 0; i < this._quadrantCards.length; i++) {
      const card = this._quadrantCards[i];
      if (card) {
        const qb = this._getQuadrantBounds(i);
        card.x = Math.min(Math.max(card.x, qb.minX), qb.maxX);
        card.y = Math.min(Math.max(card.y, qb.minY), qb.maxY);
      }
    }
  }

  /**
   * Adds a card to the table in a random free quadrant.
   * @param {object} spriteSheet - The sprite sheet containing card textures
   * @param {string} textureKey - The texture key for the card (e.g., "AS", "KH")
   * @param {object|null} startPos - Starting position for animation, or null for initial placement
   * @param {number|null} startAngle - Starting angle for animation
   * @param {number|null} startAlpha - Starting alpha for animation
   * @param {Function|null} clickHandler - Optional click handler callback
   * @returns {boolean} True if card was added, false if all quadrants are full
   */
  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    const freeQuadrants = this._getFreeQuadrants();

    if (freeQuadrants.length === 0) {
      return false;
    }

    // Pick a random free quadrant
    const quadrantIndex = freeQuadrants[Math.floor(Math.random() * freeQuadrants.length)];
    const qb = this._getQuadrantBounds(quadrantIndex);

    // Random position within the quadrant
    const x = qb.minX + Math.random() * (qb.maxX - qb.minX);
    const y = qb.minY + Math.random() * (qb.maxY - qb.minY);

    // Quadrant-specific angles to keep hot corners visible (facing outward)
    // CCW is negative in Pixi.js, CW is positive
    let angle;
    switch (quadrantIndex) {
    case 0: // top-left: CW 0 to CARD_MAX_TABLE_ANGLE
      angle = Math.random() * CARD_MAX_TABLE_ANGLE;
      break;
    case 1: // top-right: CCW 0 to CARD_MAX_TABLE_ANGLE
      angle = Math.random() * -CARD_MAX_TABLE_ANGLE;
      break;
    case 2: // bottom-left: CCW 0 to CARD_MAX_TABLE_ANGLE
      angle = Math.random() * -CARD_MAX_TABLE_ANGLE;
      break;
    case 3: // bottom-right: CCW 0 to CARD_MAX_TABLE_ANGLE
      angle = Math.random() * -CARD_MAX_TABLE_ANGLE;
      break;
    default:
      angle = 0;
    }

    const card = new Card(spriteSheet, textureKey, clickHandler, x, y, angle);
    this.addChild(card);

    // Mark quadrant as occupied
    this._quadrantCards[quadrantIndex] = card;

    if (startPos) {
      // Animate card from startPos to target position
      const targetX = card.x;
      const targetY = card.y;
      const targetAngle = card.angle;

      card.x = startPos.x;
      card.y = startPos.y;
      card.angle = startAngle;
      card.alpha = startAlpha;

      const tween = new Tween(card, Card.tweenGroup)
        .to({ x: targetX, y: targetY, angle: targetAngle, alpha: 1 }, TWEEN_DURATION)
        .easing(Easing.Cubic.Out);
      Card.tweenGroup.add(tween);
      tween.start();
    }

    return true;
  }

  /**
   * Removes a card from the table and frees its quadrant.
   * @param {Card} card - The card to remove
   */
  removeCard(card) {
    // Find which quadrant the card was in and free it
    for (let i = 0; i < this._quadrantCards.length; i++) {
      if (this._quadrantCards[i] === card) {
        this._quadrantCards[i] = null;
        break;
      }
    }

    this.removeChild(card);
  }
}
