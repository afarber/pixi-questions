/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION } from './Card.js';

/**
 * Table container for displaying cards in the center play area.
 * Uses a 1x4 cell system (1 column, 4 rows) where each cell holds at most one card.
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

    // Track which card is in each cell (null = empty)
    // Layout: [0: top, 1: second, 2: third, 3: bottom]
    this._cellCards = [null, null, null, null];

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
   * Gets the bounds for a specific cell.
   * @param {number} index - Cell index (0-3), from top to bottom
   * @returns {object} Object with minX, maxX, minY, maxY for the cell
   * @private
   */
  _getCellBounds(index) {
    const { minX, maxX, minY, maxY } = this._bounds;
    const height = maxY - minY;
    const quarterHeight = height / 4;

    switch (index) {
    case 0:
      // top cell
      return { minX, maxX, minY, maxY: minY + quarterHeight };
    case 1:
      // second cell
      return { minX, maxX, minY: minY + quarterHeight, maxY: minY + 2 * quarterHeight };
    case 2:
      // third cell
      return { minX, maxX, minY: minY + 2 * quarterHeight, maxY: minY + 3 * quarterHeight };
    case 3:
      // bottom cell
      return { minX, maxX, minY: minY + 3 * quarterHeight, maxY };
    default:
      return { minX, maxX, minY, maxY };
    }
  }

  /**
   * Gets indices of cells that don't have a card.
   * @returns {number[]} Array of free cell indices
   * @private
   */
  _getFreeCells() {
    const free = [];
    for (let i = 0; i < this._cellCards.length; i++) {
      if (this._cellCards[i] === null) {
        free.push(i);
      }
    }
    return free;
  }

  /**
   * Draws 4 cell rectangles for debugging purposes.
   * Shows the area where card centers can be placed.
   * @private
   */
  _drawBounds() {
    this._boundsGraphics.clear();

    for (let i = 0; i < this._cellCards.length; i++) {
      const qb = this._getCellBounds(i);
      this._boundsGraphics.rect(qb.minX, qb.minY, qb.maxX - qb.minX, qb.maxY - qb.minY);
      this._boundsGraphics.stroke({ width: 2, color: 0xff0000 });
    }
  }

  /**
   * Repositions all cards to stay within their cell bounds after resize.
   * @private
   */
  _repositionCards() {
    for (let i = 0; i < this._cellCards.length; i++) {
      const card = this._cellCards[i];
      if (card) {
        const qb = this._getCellBounds(i);
        card.x = Math.min(Math.max(card.x, qb.minX), qb.maxX);
        card.y = Math.min(Math.max(card.y, qb.minY), qb.maxY);
        card.baseX = card.x;
        card.baseY = card.y;
      }
    }
  }

  /**
   * Adds a card to the table in the first free cell (top to bottom order).
   * @param {object} spriteSheet - The sprite sheet containing card textures
   * @param {string} textureKey - The texture key for the card (e.g., "AS", "KH")
   * @param {object|null} startPos - Starting position for animation, or null for initial placement
   * @param {number|null} startAngle - Starting angle for animation
   * @param {number|null} startAlpha - Starting alpha for animation
   * @param {Function|null} clickHandler - Optional click handler callback
   * @returns {boolean} True if card was added, false if all cells are full
   */
  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    const freeCells = this._getFreeCells();

    if (freeCells.length === 0) {
      return false;
    }

    // Pick the first free cell (top to bottom order)
    const cellIndex = freeCells[0];
    const qb = this._getCellBounds(cellIndex);

    // Random X within the cell, Y fixed at cell center
    const x = qb.minX + Math.random() * (qb.maxX - qb.minX);
    const y = (qb.minY + qb.maxY) / 2;

    // Random rotation in range [-20, 20] degrees
    const angle = Math.random() * 40 - 20;

    const card = new Card(spriteSheet, textureKey, clickHandler, x, y, angle);
    card.baseX = x;
    card.baseY = y;
    this.addChild(card);

    // Mark cell as occupied
    this._cellCards[cellIndex] = card;

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
   * Removes a card from the table and frees its cell.
   * @param {Card} card - The card to remove
   */
  removeCard(card) {
    // Find which cell the card was in and free it
    for (let i = 0; i < this._cellCards.length; i++) {
      if (this._cellCards[i] === card) {
        this._cellCards[i] = null;
        break;
      }
    }

    this.removeChild(card);
  }
}
