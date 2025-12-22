/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics, Rectangle, Matrix } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION } from './Card.js';

// Maximum attempts to find a valid position with visible corner
const MAX_PLACEMENT_ATTEMPTS = 50;

// Reusable objects to avoid allocations
const tempMatrix = new Matrix();
const hotCornerRect = new Rectangle();
const cardRect = new Rectangle();

/**
 * Table container for displaying cards in the center play area.
 * Cards are placed randomly within a rectangular region.
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
    this._bounds.minY = paddingY + CARD_HEIGHT / 2;
    this._bounds.maxY = this._screen.height - paddingY - (2 * CARD_HEIGHT) / 3;

    this._drawBounds();
  }

  /**
   * Draws the rectangle outline for debugging purposes.
   * @private
   */
  _drawBounds() {
    const { minX, maxX, minY, maxY } = this._bounds;

    this._boundsGraphics.clear();
    this._boundsGraphics.rect(
      minX - CARD_WIDTH / 2,
      minY - CARD_HEIGHT / 2,
      maxX - minX + CARD_WIDTH,
      maxY - minY + CARD_HEIGHT
    );
    this._boundsGraphics.stroke({ width: 2, color: 0xff0000 });
  }

  /**
   * Repositions all cards to stay within the rectangle bounds after resize.
   * @private
   */
  _repositionCards() {
    const { minX, maxX, minY, maxY } = this._bounds;

    this.children
      .filter((child) => child instanceof Card)
      .forEach((card) => {
        card.x = Math.min(Math.max(card.x, minX), maxX);
        card.y = Math.min(Math.max(card.y, minY), maxY);
      });
  }

  /**
   * Checks if a hot corner rectangle at given position/angle intersects with a card.
   * @param {number} cornerX - Hot corner center X in world coordinates
   * @param {number} cornerY - Hot corner center Y in world coordinates
   * @param {Card} card - The card to check against
   * @returns {boolean} True if the hot corner overlaps with the card
   * @private
   */
  _hotCornerIntersectsCard(cornerX, cornerY, card) {
    // Hot corner dimensions - the rank/suit indicator area at card corners
    const hotCornerWidth = CARD_WIDTH / 6;
    const hotCornerHeight = CARD_HEIGHT / 5;

    // Set up hot corner rectangle
    hotCornerRect.x = cornerX - hotCornerWidth / 2;
    hotCornerRect.y = cornerY - hotCornerHeight / 2;
    hotCornerRect.width = hotCornerWidth;
    hotCornerRect.height = hotCornerHeight;

    // Set up card's transform matrix
    const angleRad = (card.angle * Math.PI) / 180;
    tempMatrix.identity();
    tempMatrix.translate(-card.x, -card.y);
    tempMatrix.rotate(-angleRad);

    // Set up card rectangle (centered at origin after transform)
    cardRect.x = -CARD_WIDTH / 2;
    cardRect.y = -CARD_HEIGHT / 2;
    cardRect.width = CARD_WIDTH;
    cardRect.height = CARD_HEIGHT;

    return hotCornerRect.intersects(cardRect, tempMatrix);
  }

  /**
   * Gets the two hot corner positions for a card at given position and angle.
   * @param {number} x - Card center X
   * @param {number} y - Card center Y
   * @param {number} angle - Card rotation in degrees
   * @returns {Array<{x: number, y: number}>} Array of two corner positions
   * @private
   */
  _getHotCorners(x, y, angle) {
    const hotCornerWidth = CARD_WIDTH / 6;
    const hotCornerHeight = CARD_HEIGHT / 5;

    const angleRad = (angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Top-left corner offset (center of the hot corner area)
    const tlOffsetX = -CARD_WIDTH / 2 + hotCornerWidth / 2;
    const tlOffsetY = -CARD_HEIGHT / 2 + hotCornerHeight / 2;

    // Bottom-right corner offset (center of the hot corner area)
    const brOffsetX = CARD_WIDTH / 2 - hotCornerWidth / 2;
    const brOffsetY = CARD_HEIGHT / 2 - hotCornerHeight / 2;

    // Apply rotation to get world positions
    return [
      {
        x: x + tlOffsetX * cos - tlOffsetY * sin,
        y: y + tlOffsetX * sin + tlOffsetY * cos
      },
      {
        x: x + brOffsetX * cos - brOffsetY * sin,
        y: y + brOffsetX * sin + brOffsetY * cos
      }
    ];
  }

  /**
   * Checks if a card at the given position would have at least one visible hot corner.
   * A hot corner is visible if it doesn't overlap with any existing card on the table.
   * @param {number} x - Card center X
   * @param {number} y - Card center Y
   * @param {number} angle - Card rotation in degrees
   * @returns {boolean} True if at least one hot corner would be visible
   * @private
   */
  _hasVisibleCorner(x, y, angle) {
    const existingCards = this.children.filter((child) => child instanceof Card);

    if (existingCards.length === 0) {
      return true;
    }

    const corners = this._getHotCorners(x, y, angle);

    for (const corner of corners) {
      let cornerVisible = true;

      for (const card of existingCards) {
        if (this._hotCornerIntersectsCard(corner.x, corner.y, card)) {
          cornerVisible = false;
          break;
        }
      }

      if (cornerVisible) {
        return true;
      }
    }

    return false;
  }

  /**
   * Adds a card to the table at a random position within the rectangle area.
   * Ensures at least one hot corner (rank/suit area) remains visible.
   * @param {object} spriteSheet - The sprite sheet containing card textures
   * @param {string} textureKey - The texture key for the card (e.g., "AS", "KH")
   * @param {object|null} startPos - Starting position for animation, or null for initial placement
   * @param {number|null} startAngle - Starting angle for animation
   * @param {number|null} startAlpha - Starting alpha for animation
   * @param {Function|null} clickHandler - Optional click handler callback
   */
  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    const { minX, maxX, minY, maxY } = this._bounds;

    let x, y, angle;

    // Try to find a position where at least one hot corner is visible
    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      // Pick random position within rectangle bounds
      x = minX + Math.random() * (maxX - minX);
      y = minY + Math.random() * (maxY - minY);

      // Random angle between -20 and +20 degrees
      angle = Math.random() * 40 - 20;

      if (this._hasVisibleCorner(x, y, angle)) {
        break;
      }
    }

    const card = new Card(spriteSheet, textureKey, clickHandler, x, y, angle);
    this.addChild(card);

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
  }

  /**
   * Removes a card from the table.
   * @param {Card} card - The card to remove
   */
  removeCard(card) {
    this.removeChild(card);
  }
}
