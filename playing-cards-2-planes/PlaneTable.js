import { Container } from "pixi.js";
import { Card, CARD_WIDTH, CARD_HEIGHT } from "./Card.js";

export class PlaneTable extends Container {
  constructor(app) {
    super();

    this.app = app;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;

    // Move pivot to bottom center for proper perspective
    this.pivot.y = 0;
  }

  resize() {
    // PlaneTable positioned to account for perspective transform
    this.x = 0;
    this.y = 0;
  }

  addCard(spriteSheet, textureKey) {
    // Random position within the screen bounds, avoiding the bottom area where hand cards are
    const margin = 50;
    const handAreaHeight = CARD_HEIGHT / 2;
    const availableWidth = this.app.screen.width - 2 * margin - CARD_WIDTH;
    const availableHeight = this.app.screen.height - handAreaHeight - 2 * margin - CARD_HEIGHT;

    const x = Math.random() * availableWidth + margin + CARD_WIDTH / 2;
    const y = Math.random() * availableHeight + margin + CARD_HEIGHT / 2;

    // Random angle between -60 and +60 degrees
    const angle = Math.random() * 120 - 60;

    // Cards stay flat - the container provides the 3D perspective
    const card = new Card(spriteSheet, textureKey, x, y, angle, null);

    this.addChild(card);

    return card;
  }

  removeCard(card) {
    this.removeChild(card);
  }
}
