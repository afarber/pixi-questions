import { Container, Sprite, Rectangle } from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { Hand } from "./Hand.js";
import { Table } from "./Table.js";
import { Left } from "./Left.js";
import { Right } from "./Right.js";

export const CARD_WIDTH = 188;
export const CARD_HEIGHT = 263;
export const TWEEN_DURATION = 400;
export const CARD_VISIBLE_RATIO = 0.3;

export class Card extends Container {
  static tweenGroup = new Group();

  static updateTweens(time) {
    Card.tweenGroup.update(time);
  }

  static endAllTweens() {
    Card.tweenGroup.getAll().forEach((tween) => tween.end());
    Card.tweenGroup.removeAll();
  }

  static isValidCard(key) {
    const validRanks = ["7", "8", "9", "T", "J", "Q", "K", "A"];
    const validSuits = ["C", "D", "H", "S"];
    return validRanks.some((rank) => key.startsWith(rank)) && validSuits.some((suit) => key.endsWith(suit));
  }

  static compareCards(cardA, cardB) {
    const suitOrder = { S: 0, D: 1, C: 2, H: 3 };
    const rankOrder = { A: 0, K: 1, Q: 2, J: 3, T: 4, "9": 5, "8": 6, "7": 7 };

    const suitA = cardA.textureKey.charAt(cardA.textureKey.length - 1);
    const suitB = cardB.textureKey.charAt(cardB.textureKey.length - 1);
    const rankA = cardA.textureKey.charAt(0);
    const rankB = cardB.textureKey.charAt(0);

    // Sort by suit first
    if (suitOrder[suitA] !== suitOrder[suitB]) {
      return suitOrder[suitA] - suitOrder[suitB];
    }

    // Then by rank
    return rankOrder[rankA] - rankOrder[rankB];
  }

  constructor(spriteSheet, textureKey, clickHandler = null, cardX = 0, cardY = 0, cardAngle = 0) {
    super();

    this.x = cardX;
    this.y = cardY;
    this.angle = cardAngle;
    this.textureKey = textureKey;

    // Random jitter of +/- 4 pixels, stored once for consistent repositioning
    this.jitterX = Math.random() * 8 - 4;
    this.jitterY = Math.random() * 8 - 4;

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
    return this.parent instanceof Hand;
  }

  isParentTable() {
    return this.parent instanceof Table;
  }

  isParentLeft() {
    return this.parent instanceof Left;
  }

  isParentRight() {
    return this.parent instanceof Right;
  }

  enableHoverEffect() {
    this.on("pointerenter", () => {
      if (this.isParentHand()) {
        // On mouse hover, move the hand card up by 1/6
        this.y = this.baseY - CARD_HEIGHT / 6;
      } else if (this.isParentLeft()) {
        // On mouse hover, move the left card right by 1/6
        this.x = this.baseX + CARD_WIDTH / 6;
      } else if (this.isParentRight()) {
        // On mouse hover, move the right card left by 1/6
        this.x = this.baseX - CARD_WIDTH / 6;
      }

      this.once("pointerleave", () => {
        if (this.isParentHand()) {
          this.y = this.baseY;
        } else if (this.isParentLeft() || this.isParentRight()) {
          this.x = this.baseX;
        }
      });
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

  toString() {
    let plane = "unknown";
    if (this.isParentHand()) {
      plane = "hand";
    } else if (this.isParentLeft()) {
      plane = "left";
    } else if (this.isParentRight()) {
      plane = "right";
    } else if (this.isParentTable()) {
      plane = "table";
    }

    return (
      `Card(${this.textureKey} ${plane} ` +
      `${Math.round(this.x)}, ${Math.round(this.y)} ${Math.round(this.angle)})`
    );
  }
}
