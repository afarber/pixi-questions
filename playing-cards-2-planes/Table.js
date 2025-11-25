/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION, RADIAL_FAN_RADIUS } from "./Card.js";

export class Table extends Container {
  constructor(screen) {
    super();

    this.screen = screen;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;

    // Trapezoid bounds (SSOT) - will be calculated in updateTrapezoid()
    this.trapezoid = {
      minY: 0,
      maxY: 0,
      topWidth: 0,
      bottomWidth: 0
    };

    // Debug trapezoid outline (set alpha to 0 to hide)
    this.trapezoidGraphics = new Graphics();
    this.trapezoidGraphics.alpha = 1;
    this.addChild(this.trapezoidGraphics);

    // Initialize trapezoid bounds
    this.updateTrapezoid();
  }

  resize() {
    // PlaneTable positioned to account for perspective transform
    this.x = 0;
    this.y = 0;

    // Update trapezoid bounds (SSOT)
    this.updateTrapezoid();

    // Reposition all cards within new screen bounds
    this.repositionCards();
  }

  updateTrapezoid() {
    // Vertical bounds (in Table's local coordinates, accounting for scale.y = 0.75)
    const topMargin = RADIAL_FAN_RADIUS * 0.4;
    // Hand cards top edge is at screen.height - CARD_HEIGHT * 0.3 in screen coords
    // Convert to Table's local coords by dividing by scale.y (0.75)
    // Then subtract CARD_HEIGHT/2 (for card center) and a gap
    const handTopYScreen = this.screen.height - CARD_HEIGHT * 0.3;
    const handTopYLocal = handTopYScreen / 0.75;
    this.trapezoid.minY = topMargin + CARD_HEIGHT / 2;
    // maxY is the card CENTER position, so card bottom edge will be at maxY + CARD_HEIGHT/2
    // We want: (maxY + CARD_HEIGHT/2) * 0.75 < handTopYScreen
    // So: maxY < handTopYScreen/0.75 - CARD_HEIGHT/2
    this.trapezoid.maxY = handTopYLocal - CARD_HEIGHT - 20;

    // Trapezoid widths: narrower at top (between corner fans), wider at bottom
    this.trapezoid.topWidth = this.screen.width * 0.4;
    this.trapezoid.bottomWidth = this.screen.width * 0.6;

    // Draw trapezoid outline
    const topLeftX = (this.screen.width - this.trapezoid.topWidth) / 2;
    const topRightX = topLeftX + this.trapezoid.topWidth;
    const bottomLeftX = (this.screen.width - this.trapezoid.bottomWidth) / 2;
    const bottomRightX = bottomLeftX + this.trapezoid.bottomWidth;

    this.trapezoidGraphics.clear();
    this.trapezoidGraphics.moveTo(topLeftX, this.trapezoid.minY);
    this.trapezoidGraphics.lineTo(topRightX, this.trapezoid.minY);
    this.trapezoidGraphics.lineTo(bottomRightX, this.trapezoid.maxY);
    this.trapezoidGraphics.lineTo(bottomLeftX, this.trapezoid.maxY);
    this.trapezoidGraphics.lineTo(topLeftX, this.trapezoid.minY);
    this.trapezoidGraphics.stroke({ width: 2, color: 0xff0000 });
  }

  // Get the width of the trapezoid at a given Y position
  getWidthAtY(y) {
    const { minY, maxY, topWidth, bottomWidth } = this.trapezoid;
    const t = (y - minY) / (maxY - minY);
    return topWidth + t * (bottomWidth - topWidth);
  }

  // Get the left edge X at a given Y position
  getLeftEdgeAtY(y) {
    const widthAtY = this.getWidthAtY(y);
    return (this.screen.width - widthAtY) / 2;
  }

  repositionCards() {
    const { minY, maxY } = this.trapezoid;

    this.children
      .filter((child) => child instanceof Card)
      .forEach((card) => {
        // Clamp Y first
        card.y = Math.min(Math.max(card.y, minY), maxY);

        // Clamp X within trapezoid width at this Y level
        const leftEdge = this.getLeftEdgeAtY(card.y);
        const widthAtY = this.getWidthAtY(card.y);
        const minX = leftEdge + CARD_WIDTH / 2;
        const maxX = leftEdge + widthAtY - CARD_WIDTH / 2;
        card.x = Math.min(Math.max(card.x, minX), maxX);
      });
  }

  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    const { minY, maxY } = this.trapezoid;

    // Pick random Y first
    const y = minY + Math.random() * (maxY - minY);

    // Get trapezoid width at this Y and pick random X within it
    const leftEdge = this.getLeftEdgeAtY(y);
    const widthAtY = this.getWidthAtY(y);
    const x = leftEdge + CARD_WIDTH / 2 + Math.random() * (widthAtY - CARD_WIDTH);

    // Random angle between -20 and +20 degrees
    const angle = Math.random() * 40 - 20;

    // Cards stay flat - the container provides the 3D perspective
    const card = new Card(spriteSheet, textureKey, clickHandler, x, y, angle);

    this.addChild(card);

    if (startPos) {
      // Animate card from startPos to target position (moving from another container)
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
    // Else: initial card placement - keep random position and angle, no tween
  }

  removeCard(card) {
    this.removeChild(card);
  }
}
