import { Container } from "pixi.js";
import { Card, CARD_WIDTH, CARD_HEIGHT } from "./Card.js";

export class PlaneHand extends Container {
  constructor(app) {
    super();

    this.app = app;
  }

  resize() {
    // PlaneHand occupies the whole screen
    this.x = 0;
    this.y = 0;

    // Reposition cards after resize
    this.repositionCards();
  }

  addCard(spriteSheet, textureKey) {
    const card = new Card(spriteSheet, textureKey, 0, 0, 0, null);

    this.addChild(card);
    this.repositionCards();

    return card;
  }

  removeCard(card) {
    this.removeChild(card);
    this.repositionCards();
  }

  repositionCards() {
    const totalCards = this.children.length;
    if (totalCards === 0) return;

    // We want padding of CARD_WIDTH / 2 on both sides
    const availableWidth = this.app.screen.width - CARD_WIDTH;

    // Calculate spacing between cards (max 0.8 * CARD_WIDTH)
    let cardSpacing = Math.min(0.8 * CARD_WIDTH, availableWidth / (totalCards - 1 || 1));

    // If cards don't fit, use minimum spacing that fits
    if (totalCards > 1) {
      const totalNeededWidth = (totalCards - 1) * cardSpacing + CARD_WIDTH;
      if (totalNeededWidth > availableWidth) {
        cardSpacing = (availableWidth - CARD_WIDTH) / (totalCards - 1);
      }
    }

    // Calculate starting position (left padding + half card width since pivot is at center)
    const startX = CARD_WIDTH;

    this.children.forEach((card, index) => {
      card.x = startX + index * cardSpacing;
      // Position so only 60% of card height is visible from the top
      // Card pivot is at center, so bottom of visible area should be at screen bottom
      card.y = this.app.screen.height - 0.3 * CARD_HEIGHT;
    });
  }
}
