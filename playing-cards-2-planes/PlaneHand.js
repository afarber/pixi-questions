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

  addCard(spriteSheet, textureKey, clickHandler = null) {
    const card = new Card(spriteSheet, textureKey, clickHandler);

    this.addChild(card);
    this.repositionCards();

    card.enableHoverEffect();

    return card;
  }

  removeCard(card) {
    this.removeChild(card);
    this.repositionCards();
  }

  sortCards() {
    const suitOrder = { S: 0, D: 1, C: 2, H: 3 };
    const rankOrder = { A: 0, K: 1, Q: 2, J: 3, T: 4, "9": 5, "8": 6, "7": 7 };

    this.children.sort((a, b) => {
      const suitA = a.textureKey.charAt(a.textureKey.length - 1);
      const suitB = b.textureKey.charAt(b.textureKey.length - 1);
      const rankA = a.textureKey.charAt(0);
      const rankB = b.textureKey.charAt(0);

      // Sort by suit first
      if (suitOrder[suitA] !== suitOrder[suitB]) {
        return suitOrder[suitA] - suitOrder[suitB];
      }

      // Then by rank
      return rankOrder[rankA] - rankOrder[rankB];
    });
  }

  repositionCards() {
    const totalCards = this.children.length;

    if (totalCards === 0) {
      return;
    }

    // Sort cards before repositioning
    this.sortCards();

    if (totalCards === 1) {
      const card = this.children[0];
      card.x = this.app.screen.width / 2;
      card.y = this.app.screen.height - 0.3 * CARD_HEIGHT;
      return;
    }

    const minPaddingToScreenEdge = CARD_WIDTH / 3;
    const maxSpacingBetweenCards = CARD_WIDTH / 2;

    // Available width for card spacing (excluding padding for card edges and 1 card)
    const availableWidth = this.app.screen.width - 2 * minPaddingToScreenEdge - CARD_WIDTH;

    // Calculate spacing between cards
    const spacingBetweenCards = Math.min(maxSpacingBetweenCards, availableWidth / (totalCards - 1));

    // Center the cards
    const totalCardsWidth = (totalCards - 1) * spacingBetweenCards;
    const firstCardX = this.app.screen.width / 2 - totalCardsWidth / 2;

    this.children.forEach((card, index) => {
      // Random jitter of +/- 4 pixels
      const jitterX = Math.random() * 8 - 4;
      const jitterY = Math.random() * 8 - 4;

      card.x = firstCardX + index * spacingBetweenCards + jitterX;
      // Position so only 60% of card height is visible from the top
      card.y = this.app.screen.height - 0.3 * CARD_HEIGHT + jitterY;
    });
  }
}
