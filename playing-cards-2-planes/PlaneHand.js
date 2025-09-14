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
    const totalCards = Math.max(this.children.length, 1);
    const cardSpacing = CARD_WIDTH * 0.8;
    const totalWidth = (totalCards - 1) * cardSpacing + CARD_WIDTH;
    const startX = (this.app.screen.width - totalWidth) / 2;

    this.children.forEach((card, index) => {
      card.x = startX + index * cardSpacing + CARD_WIDTH / 2;
      card.y = this.app.screen.height - CARD_HEIGHT / 2;
    });
  }
}