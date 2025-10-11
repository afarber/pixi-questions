import { Container } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION } from "./Card.js";

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

    if (startPos) {
      // Animate card from startPos to target position (moving from another container)
      card.x = startPos.x;
      card.y = startPos.y;
      card.angle = startAngle;
      card.alpha = startAlpha;

      const tween = new Tween(card, Card.tweenGroup)
        .to({ x: targetX, y: targetY, angle: 0, alpha: 1 }, TWEEN_DURATION)
        .easing(Easing.Cubic.Out);
      Card.tweenGroup.add(tween);
      tween.start();
    }
    // Else: initial card placement - keep repositioned coordinates, no tween
  }

  removeCard(card) {
    this.removeChild(card);
  }

  repositionCards() {
    const cards = this.children.filter(child => child instanceof Card);

    if (cards.length === 0) {
      return;
    }

    if (cards.length === 1) {
      const card = cards[0];
      const margin = 50;
      card.x = margin + CARD_WIDTH / 2;
      card.y = this.screen.height / 2;
      card.angle = 0;
      return;
    }

    // Sort cards and update their z-order
    cards.sort(Card.compareCards);
    cards.forEach(card => this.removeChild(card));
    cards.forEach(card => this.addChild(card));

    const totalCards = cards.length;
    const margin = 50;
    const minPaddingToScreenEdge = CARD_HEIGHT / 3;
    const maxSpacingBetweenCards = CARD_HEIGHT / 2;

    // Available height for card spacing (excluding padding for card edges and 1 card)
    const handAreaHeight = CARD_HEIGHT / 2;
    const availableHeight = this.screen.height - handAreaHeight - 2 * minPaddingToScreenEdge - CARD_HEIGHT;

    // Calculate spacing between cards
    const spacingBetweenCards = Math.min(maxSpacingBetweenCards, availableHeight / (totalCards - 1));

    // Center the cards vertically
    const totalCardsHeight = (totalCards - 1) * spacingBetweenCards;
    const firstCardY = (this.screen.height - handAreaHeight) / 2 - totalCardsHeight / 2;

    const cardX = margin + CARD_WIDTH / 2;

    cards.forEach((card, index) => {
      card.x = cardX + card.jitterX;
      card.y = firstCardY + index * spacingBetweenCards + card.jitterY;
      card.angle = 0;
    });
  }
}
