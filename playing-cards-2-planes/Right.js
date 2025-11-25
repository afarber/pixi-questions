/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";
import { Card, TWEEN_DURATION, RADIAL_FAN_RADIUS } from "./Card.js";

export class Right extends Container {
  constructor(screen) {
    super();

    this.screen = screen;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;
  }

  resize() {
    // Right plane positioned to account for perspective transform
    this.x = 0;
    this.y = 0;

    // Reposition cards after resize
    this.repositionCards();
  }

  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    const card = new Card(spriteSheet, textureKey, clickHandler);

    this.addChild(card);
    this.repositionCards();

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

  removeCard(card) {
    this.removeChild(card);
  }

  repositionCards() {
    const cards = this.children.filter((child) => child instanceof Card);

    if (cards.length === 0) {
      return;
    }

    // Sort cards for consistent ordering
    cards.sort(Card.compareCards);

    const totalCards = cards.length;

    // Pivot point outside top-right corner
    const pivotX = this.screen.width + RADIAL_FAN_RADIUS * 0.3;
    const pivotY = -RADIAL_FAN_RADIUS * 0.2;

    // Angle step: divide 90 degrees by (totalCards + 1) for equal gaps at both ends
    const angleStepDeg = 90 / (totalCards + 1);

    cards.forEach((card, index) => {
      // Mirror of Left: angles go from 180 degrees down toward 90 degrees
      // Card N gets angle 180 - (N + 1) * angleStep
      const angleDeg = 180 - (index + 1) * angleStepDeg;
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
      card.angle = angleDeg - 90;
    });

    // Update z-order in reverse (cards at bottom position render on top)
    cards.forEach((card) => this.removeChild(card));
    cards.reverse().forEach((card) => this.addChild(card));
  }
}
