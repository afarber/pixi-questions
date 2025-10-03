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

    // Requirements:
    // 1. Cards centered at bottom of screen
    // 2. CARD_WIDTH/2 minimum padding on sides (accounting for pivot at center)
    // 3. Max spacing between cards is CARD_WIDTH/2

    const minPadding = CARD_WIDTH / 2;
    const maxSpacing = CARD_WIDTH / 2;

    // Available width for card spacing (excluding padding for card edges)
    const availableWidth = this.app.screen.width - 2 * minPadding;

    // Calculate spacing between cards
    let cardSpacing = maxSpacing;

    if (totalCards > 1) {
      // Total width needed with max spacing
      const neededWidth = (totalCards - 1) * maxSpacing;

      // If doesn't fit, reduce spacing
      if (neededWidth > availableWidth) {
        cardSpacing = availableWidth / (totalCards - 1);
      }
    }

    // Center the cards
    const totalWidth = totalCards > 1 ? (totalCards - 1) * cardSpacing : 0;
    const firstCardX = this.app.screen.width / 2 - totalWidth / 2;

    this.children.forEach((card, index) => {
      // Random jitter of +/- 4 pixels
      const jitterX = Math.random() * 8 - 4;
      const jitterY = Math.random() * 8 - 4;

      card.x = firstCardX + index * cardSpacing + jitterX;
      // Position so only 60% of card height is visible from the top
      card.y = this.app.screen.height - 0.3 * CARD_HEIGHT + jitterY;
    });
  }
}
