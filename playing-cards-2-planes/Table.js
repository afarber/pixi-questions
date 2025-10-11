import { Container, Graphics, Texture, Sprite } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";
import { Card, CARD_WIDTH, CARD_HEIGHT, TWEEN_DURATION } from "./Card.js";

export class Table extends Container {
  constructor(screen) {
    super();

    this.screen = screen;

    // Apply perspective transform: compress vertically to simulate viewing from above
    this.scale.y = 0.75;

    // Create gradient background using canvas
    this.background = null;
    this._drawBackground();
  }

  _drawBackground() {
    // Remove old background if exists
    if (this.background) {
      this.background.texture.destroy(true);
      this.removeChild(this.background);
    }

    console.log('=== Table._drawBackground DEBUG ===');
    console.log('screen.width:', this.screen.width);
    console.log('screen.height:', this.screen.height);
    console.log('this.scale.x:', this.scale.x);
    console.log('this.scale.y:', this.scale.y);
    console.log('this.x:', this.x);
    console.log('this.y:', this.y);

    // Draw taller to compensate for parent's scale.y
    // After scaling, it should equal screen.height
    const width = Math.ceil(this.screen.width / this.scale.x);
    const height = Math.ceil(this.screen.height / this.scale.y);

    console.log('canvas width:', width);
    console.log('canvas height:', height);
    console.log('after scale, sprite will be:', width * this.scale.x, 'x', height * this.scale.y);

    // Create canvas with gradient
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Debug gradient: blue at top to green at bottom
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'blue');
    gradient.addColorStop(1, 'green');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Create sprite from canvas
    const texture = Texture.from(canvas);
    this.background = new Sprite(texture);
    this.background.x = 0;
    this.background.y = 0;

    console.log('background sprite created at:', this.background.x, this.background.y);
    console.log('background sprite size:', this.background.width, this.background.height);
    console.log('===================================');

    this.addChildAt(this.background, 0);
  }

  resize() {
    // PlaneTable positioned to account for perspective transform
    this.x = 0;
    this.y = 0;

    // Redraw background to fit new screen size
    this._drawBackground();

    // Reposition all cards within new screen bounds
    this.repositionCards();
  }

  repositionCards() {
    const margin = 50;
    const handAreaHeight = CARD_HEIGHT / 2;

    this.children.forEach((child) => {
      // Skip non-Card children (e.g., background sprite)
      if (!(child instanceof Card)) {
        return;
      }

      // Keep cards within bounds after resize
      child.x = Math.min(Math.max(child.x, margin + CARD_WIDTH / 2), this.screen.width - margin - CARD_WIDTH / 2);
      child.y = Math.min(
        Math.max(child.y, margin + CARD_HEIGHT / 2),
        this.screen.height - handAreaHeight - margin - CARD_HEIGHT / 2
      );
    });
  }

  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
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

    if (startPos) {
      // Animate card from startPos to target position (moving from another container)
      const targetX = card.x;
      const targetY = card.y;
      const targetAngle = card.angle;

      card.x = startPos.x;
      card.y = startPos.y;
      card.angle = startAngle;
      card.alpha = startAlpha;

      const tween = new Tween(card, Card.tweenGroup)
        .to({ x: targetX, y: targetY, angle: targetAngle, alpha: 1 }, TWEEN_DURATION)
        .easing(Easing.Cubic.Out);
      Card.tweenGroup.add(tween);
      tween.start();
    }
    // Else: initial card placement - keep random position and angle, no tween
  }

  removeCard(card) {
    this.removeChild(card);
  }
}
