import { Container, Texture, Sprite } from "pixi.js";

export class Background extends Container {
  constructor(screen) {
    super();

    this.screen = screen;
    this.sprite = null;
    this._drawBackground();
  }

  _drawBackground() {
    // Remove old sprite if exists
    if (this.sprite) {
      this.sprite.texture.destroy(true);
      this.removeChild(this.sprite);
    }

    console.log('=== Background._drawBackground DEBUG ===');
    console.log('screen.width:', this.screen.width);
    console.log('screen.height:', this.screen.height);

    const width = Math.ceil(this.screen.width);
    const height = Math.ceil(this.screen.height);

    console.log('canvas width:', width);
    console.log('canvas height:', height);

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
    this.sprite = new Sprite(texture);
    this.sprite.x = 0;
    this.sprite.y = 0;

    console.log('background sprite created at:', this.sprite.x, this.sprite.y);
    console.log('background sprite size:', this.sprite.width, this.sprite.height);
    console.log('=====================================');

    this.addChild(this.sprite);
  }

  resize() {
    this._drawBackground();
  }
}
