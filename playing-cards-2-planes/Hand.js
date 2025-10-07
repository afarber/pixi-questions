import { Container } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";
import { Card, CARD_WIDTH, CARD_HEIGHT } from "./Card.js";

export class Hand extends Container {
  constructor(screen) {
    super();

    this.screen = screen;
  }

  resize() {
    // PlaneHand occupies the whole screen
    this.x = 0;
    this.y = 0;

    // Reposition cards after resize
    this.repositionCards();
  }

  addCard(spriteSheet, textureKey, startX, startY, startAngle, startAlpha, clickHandler = null) {
    const card = new Card(spriteSheet, textureKey, clickHandler);

    this.addChild(card);
    this.repositionCards();

    // If start parameters are provided, animate from start position to target position
    if (startX !== null && startY !== null && startAngle !== null && startAlpha !== null) {
      const targetX = card.x;
      const targetY = card.y;

      card.x = startX;
      card.y = startY;
      card.angle = startAngle;
      card.alpha = startAlpha;

      const tween = new Tween(card, Card.tweenGroup)
        .to({ x: targetX, y: targetY, angle: 0, alpha: 1 }, 400)
        .easing(Easing.Cubic.Out);
      Card.tweenGroup.add(tween);
      tween.start();
    } else {
      card.enableHoverEffect();
    }

    return card;
  }

  removeCard(card) {
    this.removeChild(card);
    //this.repositionCards();
  }

  sortCards() {
    this.children.sort(Card.compareCards);
  }

  repositionCards() {
    const totalCards = this.children.length;

    if (totalCards === 0) {
      return;
    }

    if (totalCards === 1) {
      const card = this.children[0];
      card.x = this.screen.width / 2;
      card.y = this.screen.height - 0.3 * CARD_HEIGHT;
      return;
    }

    // Sort cards before repositioning
    this.sortCards();

    const minPaddingToScreenEdge = CARD_WIDTH / 3;
    const maxSpacingBetweenCards = CARD_WIDTH / 2;

    // Available width for card spacing (excluding padding for card edges and 1 card)
    const availableWidth = this.screen.width - 2 * minPaddingToScreenEdge - CARD_WIDTH;

    // Calculate spacing between cards
    const spacingBetweenCards = Math.min(maxSpacingBetweenCards, availableWidth / (totalCards - 1));

    // Center the cards
    const totalCardsWidth = (totalCards - 1) * spacingBetweenCards;
    const firstCardX = this.screen.width / 2 - totalCardsWidth / 2;

    this.children.forEach((card, index) => {
      // Random jitter of +/- 4 pixels
      const jitterX = Math.random() * 8 - 4;
      const jitterY = Math.random() * 8 - 4;

      card.x = firstCardX + index * spacingBetweenCards + jitterX;
      // Position so only 60% of card height is visible from the top
      card.y = this.screen.height - 0.3 * CARD_HEIGHT + jitterY;
    });
  }
}
