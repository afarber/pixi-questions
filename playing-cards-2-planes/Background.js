import { Container, Graphics, FillGradient } from "pixi.js";

export class Background extends Container {
  constructor(screen) {
    super();

    this.screen = screen;
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    this._drawBackground();
  }

  _drawBackground() {
    this.graphics.clear();

    console.log('=== Background._drawBackground DEBUG ===');
    console.log('screen.width:', this.screen.width);
    console.log('screen.height:', this.screen.height);

    // Create gradient using proper PixiJS v8 API with local coordinates
    const gradient = new FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },      // Top (0-1 normalized)
      end: { x: 0, y: 1 },         // Bottom (0-1 normalized)
      colorStops: [
        { offset: 0, color: 'blue' },   // Blue at top
        { offset: 1, color: 'green' }   // Green at bottom
      ],
      textureSpace: 'local'  // Use normalized 0-1 coordinates
    });

    this.graphics.rect(0, 0, this.screen.width, this.screen.height);
    this.graphics.fill(gradient);

    console.log('gradient drawn with local coordinates');
    console.log('=====================================');
  }

  resize() {
    this._drawBackground();
  }
}
