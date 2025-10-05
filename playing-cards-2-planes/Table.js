import { Container } from "pixi.js";
import { Card, CARD_WIDTH, CARD_HEIGHT } from "./Card.js";

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

    this.children.forEach((card) => {
      // Keep cards within bounds after resize
      card.x = Math.min(Math.max(card.x, margin + CARD_WIDTH / 2), this.screen.width - margin - CARD_WIDTH / 2);
      card.y = Math.min(
        Math.max(card.y, margin + CARD_HEIGHT / 2),
        this.screen.height - handAreaHeight - margin - CARD_HEIGHT / 2
      );
    });
  }

  addCard(spriteSheet, textureKey, clickHandler = null) {
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

    return card;
  }

  removeCard(card) {
    this.removeChild(card);
  }
}
