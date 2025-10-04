import { Container, Sprite, Rectangle } from "pixi.js";

export const CARD_WIDTH = 188;
export const CARD_HEIGHT = 263;

export class Card extends Container {
  constructor(spriteSheet, textureKey, clickHandler = null, cardX = 0, cardY = 0, cardAngle = 0) {
    super();

    this.x = cardX;
    this.y = cardY;
    this.angle = cardAngle;
    this.textureKey = textureKey;

    this.interactiveChildren = false;
    this.cacheAsTexture = true;

    const texture = spriteSheet.textures[textureKey];

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    this.addChild(sprite);

    // Setup as clickable card
    this._setupClickable(clickHandler);
  }

  isParentHand() {
    return this.parent && this.parent.scale.y > 0.9;
  }

  isParentTable() {
    return this.parent && this.parent.scale.y < 0.9;
  }

  enableHoverEffect() {
    // Base Y position to restore when mouse leaves
    // (initial value doesn't matter, will be set on pointerenter)
    let baseY = 0;

    this.on("pointerenter", () => {
      baseY = this.y;
      this.y -= CARD_HEIGHT / 6;
    });

    this.on("pointerleave", () => {
      this.y = baseY;
    });
  }

  disableHoverEffect() {
    this.off("pointerenter");
    this.off("pointerleave");
  }

  // Setup clickable card
  _setupClickable(clickHandler) {
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
