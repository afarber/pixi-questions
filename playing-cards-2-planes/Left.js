/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Card, TWEEN_DURATION, RADIAL_FAN_RADIUS, RADIAL_PIVOT_PADDING } from './Card.js';

/**
 * Left container for displaying opponent cards in a radial fan from the top-left corner.
 * Cards fan out from a pivot point with consistent angle spacing.
 * @extends Container
 */
export class Left extends Container {
  /**
   * Creates a new Left container.
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
    // Left plane positioned to account for perspective transform
    this.x = 0;
    this.y = 0;

    // Reposition cards after resize
    this._repositionCards();
  }

  /**
   * Adds a card to the left fan with optional animation from a starting position.
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
   * Removes a card from the left fan.
   * @param {Card} card - The card to remove
   */
  removeCard(card) {
    this.removeChild(card);
  }

  /**
   * Repositions all cards in a radial fan arrangement from the top-left corner.
   * Cards are arranged along an arc with consistent angle spacing.
   * @private
   */
  _repositionCards() {
    const cards = this.children.filter((child) => child instanceof Card);

    if (cards.length === 0) {
      return;
    }

    // Sort cards and update their z-order
    cards.sort(Card.compareCards);
    cards.forEach((card) => this.removeChild(card));
    cards.forEach((card) => this.addChild(card));

    const totalCards = cards.length;

    // Pivot point inside top-left corner with padding
    // (if the pivot is outside, start/end cards are cut off)
    const pivotX = RADIAL_PIVOT_PADDING;
    const pivotY = RADIAL_PIVOT_PADDING;

    // Angle step: divide 90 degrees by (totalCards + 3)
    // for equal gaps (angle step x2) at both ends
    const angleStepDeg = 90 / (totalCards + 3);

    cards.forEach((card, index) => {
      // Card N gets angle (N + 2) * angleStep
      const angleDeg = (index + 2) * angleStepDeg;
      const angleRad = (angleDeg * Math.PI) / 180;

      // Position from polar coordinates
      card.x = pivotX + RADIAL_FAN_RADIUS * Math.cos(angleRad) + card.jitterX;
      card.y = pivotY + RADIAL_FAN_RADIUS * Math.sin(angleRad) + card.jitterY;

      // Store base position for hover effect
      card.baseX = card.x;
      card.baseY = card.y;

      // Store radial direction unit vector for hover push-out
      card.radialDirX = Math.cos(angleRad);
      card.radialDirY = Math.sin(angleRad);

      // Card rotation tangent to arc
      card.angle = angleDeg + 90;
    });
  }
}
