/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics, Rectangle } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION } from './Card.js';

// Maximum attempts to find a valid position with visible corner
const MAX_PLACEMENT_ATTEMPTS = 50;

// All collision detection is done in local Table coordinates.
// No global coordinate transforms or Matrix operations are needed
// because all cards are children of the same Table container.

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
   * Gets the two hot corner rectangles for a card (axis-aligned bounding boxes).
   * Since card rotation is small (-20 to +20 degrees), AABB approximation is sufficient.
   * @param {Card} card - The card to get hot corners for
   * @returns {Rectangle[]} Array of two Rectangle objects (top-left and bottom-right hot corners)
   * @private
   */
  _getHotCornerRects(card) {
    const hotCornerWidth = CARD_WIDTH / 6;
    const hotCornerHeight = CARD_HEIGHT / 5;

    // Top-left hot corner
    const tlRect = new Rectangle(
      card.x - CARD_WIDTH / 2,
      card.y - CARD_HEIGHT / 2,
      hotCornerWidth,
      hotCornerHeight
    );

    // Bottom-right hot corner
    const brRect = new Rectangle(
      card.x + CARD_WIDTH / 2 - hotCornerWidth,
      card.y + CARD_HEIGHT / 2 - hotCornerHeight,
      hotCornerWidth,
      hotCornerHeight
    );

    return [tlRect, brRect];
  }

  /**
   * Gets the bounding rectangle for a card at given position (axis-aligned).
   * @param {number} x - Card center X
   * @param {number} y - Card center Y
   * @returns {Rectangle} The card's bounding rectangle
   * @private
   */
  _getCardRect(x, y) {
    return new Rectangle(
      x - CARD_WIDTH / 2,
      y - CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT
    );
  }

  /**
   * Checks if placing a new card would obscure all hot corners of any existing card.
   * Only checks against the new card (previous placements were already validated).
   * @param {number} newX - New card center X
   * @param {number} newY - New card center Y
   * @returns {boolean} True if any existing card would have both hot corners obscured
   * @private
   */
  _wouldObscureExistingCards(newX, newY) {
    const existingCards = this.children.filter((child) => child instanceof Card);
    const newCardRect = this._getCardRect(newX, newY);

    for (const card of existingCards) {
      const [tlRect, brRect] = this._getHotCornerRects(card);

      // If BOTH hot corners intersect with the new card, the existing card would be obscured
      if (newCardRect.intersects(tlRect) && newCardRect.intersects(brRect)) {
        console.log(`  ${card.textureKey} would be obscured by new card at (${Math.round(newX)}, ${Math.round(newY)})`);
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
    let attempt;

    // Try to find a position where the new card doesn't obscure all hot corners of any existing card
    for (attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      // Pick random position within rectangle bounds
      x = minX + Math.random() * (maxX - minX);
      y = minY + Math.random() * (maxY - minY);

      // Random angle between -20 and +20 degrees
      angle = Math.random() * 40 - 20;

      if (!this._wouldObscureExistingCards(x, y)) {
        break;
      }
    }

    if (attempt === MAX_PLACEMENT_ATTEMPTS) {
      console.log(`Table: failed to find valid position for ${textureKey} after ${MAX_PLACEMENT_ATTEMPTS} attempts`);
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
