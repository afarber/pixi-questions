/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION, RADIAL_FAN_RADIUS } from './Card.js';

/**
 * Table container for displaying cards in the center play area.
 * Cards are placed randomly within a trapezoid-shaped region that avoids
 * the corner radial fans and the hand area at the bottom.
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

    // Trapezoid bounds (SSOT) - will be calculated in _updateTrapezoid()
    this._trapezoid = {
      minY: 0,
      maxY: 0,
      topWidth: 0,
      bottomWidth: 0
    };

    // Debug trapezoid outline (set alpha to 0 to hide)
    this._trapezoidGraphics = new Graphics();
    this._trapezoidGraphics.alpha = 1;
    this.addChild(this._trapezoidGraphics);

    // Initialize trapezoid bounds
    this._updateTrapezoid();
  }

  /**
   * Handles window resize by repositioning the container and all cards.
   */
  resize() {
    this.x = 0;
    this.y = 0;

    this._updateTrapezoid();
    this._repositionCards();
  }

  /**
   * Updates the trapezoid bounds and redraws the debug outline.
   * The trapezoid is narrower at top (between corner fans) and wider at bottom.
   * @private
   */
  _updateTrapezoid() {
    // Vertical bounds (in Table's local coordinates, accounting for scale.y = 0.75)
    const topMargin = RADIAL_FAN_RADIUS * 0.4;
    // Hand cards top edge is at screen.height - CARD_HEIGHT * 0.3 in screen coords
    // Convert to Table's local coords by dividing by scale.y (0.75)
    const handTopYScreen = this._screen.height - CARD_HEIGHT * 0.3;
    const handTopYLocal = handTopYScreen / 0.75;
    this._trapezoid.minY = topMargin + CARD_HEIGHT;
    // maxY is the card CENTER position, so card bottom edge will be at maxY + CARD_HEIGHT/2
    // We want: (maxY + CARD_HEIGHT/2) * 0.75 < handTopYScreen
    this._trapezoid.maxY = handTopYLocal - CARD_HEIGHT - 50;

    // Trapezoid widths: narrower at top (between corner fans), wider at bottom
    this._trapezoid.topWidth = this._screen.width * 0.1;
    this._trapezoid.bottomWidth = this._screen.width * 0.5;

    this._drawTrapezoid();
  }

  /**
   * Draws the trapezoid outline for debugging purposes.
   * @private
   */
  _drawTrapezoid() {
    const topLeftX = (this._screen.width - this._trapezoid.topWidth) / 2;
    const topRightX = topLeftX + this._trapezoid.topWidth;
    const bottomLeftX = (this._screen.width - this._trapezoid.bottomWidth) / 2;
    const bottomRightX = bottomLeftX + this._trapezoid.bottomWidth;

    this._trapezoidGraphics.clear();
    this._trapezoidGraphics.moveTo(topLeftX, this._trapezoid.minY);
    this._trapezoidGraphics.lineTo(topRightX, this._trapezoid.minY);
    this._trapezoidGraphics.lineTo(bottomRightX, this._trapezoid.maxY);
    this._trapezoidGraphics.lineTo(bottomLeftX, this._trapezoid.maxY);
    this._trapezoidGraphics.lineTo(topLeftX, this._trapezoid.minY);
    this._trapezoidGraphics.stroke({ width: 2, color: 0xff0000 });
  }

  /**
   * Gets the width of the trapezoid at a given Y position.
   * @param {number} y - The Y coordinate in local space
   * @returns {number} The width of the trapezoid at that Y level
   * @private
   */
  _getWidthAtY(y) {
    const { minY, maxY, topWidth, bottomWidth } = this._trapezoid;
    const t = (y - minY) / (maxY - minY);
    return topWidth + t * (bottomWidth - topWidth);
  }

  /**
   * Gets the left edge X coordinate of the trapezoid at a given Y position.
   * @param {number} y - The Y coordinate in local space
   * @returns {number} The X coordinate of the left edge at that Y level
   * @private
   */
  _getLeftEdgeAtY(y) {
    const widthAtY = this._getWidthAtY(y);
    return (this._screen.width - widthAtY) / 2;
  }

  /**
   * Repositions all cards to stay within the trapezoid bounds after resize.
   * @private
   */
  _repositionCards() {
    const { minY, maxY } = this._trapezoid;

    this.children
      .filter((child) => child instanceof Card)
      .forEach((card) => {
        // Clamp Y first
        card.y = Math.min(Math.max(card.y, minY), maxY);

        // Clamp X within trapezoid width at this Y level
        const leftEdge = this._getLeftEdgeAtY(card.y);
        const widthAtY = this._getWidthAtY(card.y);
        const minX = leftEdge + CARD_WIDTH / 2;
        const maxX = leftEdge + widthAtY - CARD_WIDTH / 2;
        card.x = Math.min(Math.max(card.x, minX), maxX);
      });
  }

  /**
   * Adds a card to the table at a random position within the trapezoid area.
   * @param {object} spriteSheet - The sprite sheet containing card textures
   * @param {string} textureKey - The texture key for the card (e.g., "AS", "KH")
   * @param {object|null} startPos - Starting position for animation, or null for initial placement
   * @param {number|null} startAngle - Starting angle for animation
   * @param {number|null} startAlpha - Starting alpha for animation
   * @param {Function|null} clickHandler - Optional click handler callback
   */
  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    const { minY, maxY } = this._trapezoid;

    // Pick random Y first
    const y = minY + Math.random() * (maxY - minY);

    // Get trapezoid width at this Y and pick random X within it
    const leftEdge = this._getLeftEdgeAtY(y);
    const widthAtY = this._getWidthAtY(y);
    const x = leftEdge + CARD_WIDTH / 2 + Math.random() * (widthAtY - CARD_WIDTH);

    // Random angle between -20 and +20 degrees
    const angle = Math.random() * 40 - 20;

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
