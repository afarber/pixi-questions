import { Container } from "pixi.js";
import { Card, CARD_WIDTH, CARD_HEIGHT } from "./Card.js";

export class PlaneTable extends Container {
  constructor(app) {
    super();

    this.app = app;
  }

  resize() {
    // PlaneTable occupies the whole screen
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

    const card = new Card(spriteSheet, textureKey, x, y, angle, null);

    // Apply random 3D tilt effect
    const tiltX = Math.random() * 30 - 15;
    const tiltY = Math.random() * 30 - 15;
    card.apply3DTilt(tiltX, tiltY);

    this.addChild(card);

    return card;
  }

  removeCard(card) {
    this.removeChild(card);
  }
}