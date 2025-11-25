/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Sprite, Rectangle } from 'pixi.js';
import { Group } from '@tweenjs/tween.js';
import { Hand } from './Hand.js';
import { Table } from './Table.js';
import { Left } from './Left.js';
import { Right } from './Right.js';

export const CARD_WIDTH = 188;
export const CARD_HEIGHT = 263;
export const TWEEN_DURATION = 400;
export const CARD_VISIBLE_RATIO = 0.3;
export const RADIAL_FAN_RADIUS = 300;
export const RADIAL_HOVER_DISTANCE = 40;
export const RADIAL_PIVOT_PADDING = 60;

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
    const validRanks = ['7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const validSuits = ['C', 'D', 'H', 'S'];
    return validRanks.some((rank) => key.startsWith(rank)) && validSuits.some((suit) => key.endsWith(suit));
  }

  static compareCards(cardA, cardB) {
    const suitOrder = { S: 0, D: 1, C: 2, H: 3 };
    const rankOrder = { A: 0, K: 1, Q: 2, J: 3, T: 4, 9: 5, 8: 6, 7: 7 };

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
    this.on('pointerenter', () => {
      if (this.isParentHand()) {
        // On mouse hover, move the hand card up by 1/6
        this.y = this.baseY - CARD_HEIGHT / 6;
      } else if (this.isParentLeft() || this.isParentRight()) {
        // On mouse hover, push card outward along its radial direction
        this.x = this.baseX + this.radialDirX * RADIAL_HOVER_DISTANCE;
        this.y = this.baseY + this.radialDirY * RADIAL_HOVER_DISTANCE;
      }

      this.once('pointerleave', () => {
        if (this.isParentHand()) {
          this.y = this.baseY;
        } else if (this.isParentLeft() || this.isParentRight()) {
          this.x = this.baseX;
          this.y = this.baseY;
        }
      });
    });
  }

  disableHoverEffect() {
    this.off('pointerenter');
    this.off('pointerleave');
  }

  // Setup clickable card
  _setupClickable(clickHandler) {
    if (clickHandler) {
      this.eventMode = 'static';
      this.cursor = 'pointer';

      // Setting hitArea is important for correct click events delivery
      this.hitArea = new Rectangle(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);

      this.onpointerdown = () => clickHandler(this);
    } else {
      this.eventMode = 'none';
      this.cursor = null;
    }
  }

  toString() {
    let plane = 'unknown';
    if (this.isParentHand()) {
      plane = 'hand';
    } else if (this.isParentLeft()) {
      plane = 'left';
    } else if (this.isParentRight()) {
      plane = 'right';
    } else if (this.isParentTable()) {
      plane = 'table';
    }

    return (
      `Card(${this.textureKey} ${plane} ` + `${Math.round(this.x)}, ${Math.round(this.y)} ${Math.round(this.angle)})`
    );
  }
}
