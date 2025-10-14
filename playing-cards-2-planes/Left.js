import { Container } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION, CARD_VISIBLE_RATIO } from "./Card.js";

export class Left extends Container {
  constructor(screen) {
    super();

    this.screen = screen;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;
  }

  resize() {
    // Left plane positioned to account for perspective transform
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

    if (cards.length === 1) {
      const card = cards[0];
      // Position so only CARD_VISIBLE_RATIO (30%) of card width is visible from right, rest is off-screen at left
      card.x = CARD_VISIBLE_RATIO * CARD_WIDTH;
      card.baseX = card.x;
      card.y = this.screen.height / 2;
      card.angle = 90;
      return;
    }

    // Sort cards and update their z-order
    cards.sort(Card.compareCards);
    cards.forEach((card) => this.removeChild(card));
    cards.forEach((card) => this.addChild(card));

    const totalCards = cards.length;
    const paddingTop = 0;
    const paddingBottom = CARD_VISIBLE_RATIO * CARD_HEIGHT;
    const maxSpacingBetweenCards = CARD_WIDTH / 2;

    // Available height for card spacing (excluding padding and 1 card height)
    const availableHeight = this.screen.height - paddingTop - paddingBottom - CARD_HEIGHT;

    // Calculate spacing between cards
    const spacingBetweenCards = Math.min(maxSpacingBetweenCards, availableHeight / (totalCards - 1));

    // Center the cards vertically
    const totalCardsHeight = (totalCards - 1) * spacingBetweenCards;
    const firstCardY = paddingTop + CARD_HEIGHT / 2 + (availableHeight - totalCardsHeight) / 2;

    // Position so only CARD_VISIBLE_RATIO (30%) of card width is visible from right, rest is off-screen at left
    const cardX = CARD_VISIBLE_RATIO * CARD_WIDTH;
    const middleIndex = (totalCards - 1) / 2;

    cards.forEach((card, index) => {
      card.x = cardX + card.jitterX;
      // Store base X position for hover effect
      card.baseX = card.x;
      card.y = firstCardY + index * spacingBetweenCards + card.jitterY;
      // Apply tilt: 90 degrees at middle (horizontal), increasing by 1 degree per card away from center
      card.angle = 90 + (index - middleIndex) * 1;
    });
  }
}
