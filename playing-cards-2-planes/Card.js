import { Container, Sprite, Rectangle } from "pixi.js";

export const CARD_WIDTH = 188;
export const CARD_HEIGHT = 263;

export class Card extends Container {
  constructor(spriteSheet, textureKey, cardX = 0, cardY = 0, cardAngle = 0, clickHandler = null) {
    super();

    this.x = cardX;
    this.y = cardY;
    this.angle = cardAngle;

    this.interactiveChildren = false;
    this.cacheAsTexture = true;

    const texture = spriteSheet.textures[textureKey];

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    this.addChild(sprite);

    // Setup as clickable card
    this.#setupClickable(clickHandler);
  }

  // Setup clickable card
  #setupClickable(clickHandler) {
    if (clickHandler) {
      this.eventMode = "static";
      this.cursor = "pointer";

      // Setting hitArea is important for correct click events delivery
      this.hitArea = new Rectangle(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);

      this.onpointerdown = () => clickHandler(this);
    } else {
      this.eventMode = "none";
      this.cursor = null;
    }
  }
}
