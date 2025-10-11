import { Container } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION } from "./Card.js";

export class Table extends Container {
  constructor(screen) {
    super();

    this.screen = screen;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;
  }

  resize() {
    // PlaneTable positioned to account for perspective transform
    this.x = 0;
    this.y = 0;

    // Reposition all cards within new screen bounds
    this.repositionCards();
  }

  repositionCards() {
    const margin = 50;
    const handAreaHeight = CARD_HEIGHT / 2;

    this.children
      .filter(child => child instanceof Card)
      .forEach((card) => {
        // Keep cards within bounds after resize
        card.x = Math.min(Math.max(card.x, margin + CARD_WIDTH / 2), this.screen.width - margin - CARD_WIDTH / 2);
        card.y = Math.min(
          Math.max(card.y, margin + CARD_HEIGHT / 2),
          this.screen.height - handAreaHeight - margin - CARD_HEIGHT / 2
        );
      });
  }

  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    // Random position within the screen bounds,
    // avoiding the bottom area where hand cards are
    const margin = 50;
    const handAreaHeight = CARD_HEIGHT / 2;
    const availableWidth = this.screen.width - 2 * margin - CARD_WIDTH;
    const availableHeight = this.screen.height - handAreaHeight - 2 * margin - CARD_HEIGHT;

    const x = Math.random() * availableWidth + margin + CARD_WIDTH / 2;
    const y = Math.random() * availableHeight + margin + CARD_HEIGHT / 2;

    // Random angle between -60 and +60 degrees
    const angle = Math.random() * 120 - 60;

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
