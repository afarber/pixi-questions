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

/** @constant {number} Card width in pixels */
export const CARD_WIDTH = 188;

/** @constant {number} Card height in pixels */
export const CARD_HEIGHT = 263;

/** @constant {number} Tween animation duration in milliseconds */
export const TWEEN_DURATION = 400;

/** @constant {number} Ratio of card height visible when stacked (0.3 = 30%) */
export const CARD_VISIBLE_RATIO = 0.3;

/** @constant {number} Distance cards move on hover */
export const HOVER_DISTANCE = 40;

/**
 * Represents a playing card that can be displayed and animated.
 * Cards can be placed in Hand, Table, Left, or Right containers.
 * @extends Container
 */
export class Card extends Container {
  /** @type {Group} Static tween group for managing all card animations */
  static tweenGroup = new Group();

  /**
   * Updates all active card tweens.
   * @param {number} time - The current time for tween interpolation
   */
  static updateTweens(time) {
    Card.tweenGroup.update(time);
  }

  /**
   * Ends all active tweens immediately, jumping to their final values.
   */
  static endAllTweens() {
    Card.tweenGroup.getAll().forEach((tween) => tween.end());
    Card.tweenGroup.removeAll();
  }

  /**
   * Validates whether a texture key represents a valid card.
   * @param {string} key - The texture key to validate
   * @returns {boolean} True if the key represents a valid card (rank + suit)
   */
  static isValidCard(key) {
    const validRanks = ['7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const validSuits = ['C', 'D', 'H', 'S'];
    return validRanks.some((rank) => key.startsWith(rank)) && validSuits.some((suit) => key.endsWith(suit));
  }

  /**
   * Compares two cards for sorting (by suit first, then by rank).
   * @param {Card} cardA - First card to compare
   * @param {Card} cardB - Second card to compare
   * @returns {number} Negative if cardA < cardB, positive if cardA > cardB, zero if equal
   */
  static compareCards(cardA, cardB) {
    const suitOrder = { S: 0, D: 1, C: 2, H: 3 };
    const rankOrder = { A: 0, K: 1, Q: 2, J: 3, T: 4, 9: 5, 8: 6, 7: 7 };

    const suitA = cardA.textureKey.charAt(cardA.textureKey.length - 1);
    const suitB = cardB.textureKey.charAt(cardB.textureKey.length - 1);
    const rankA = cardA.textureKey.charAt(0);
    const rankB = cardB.textureKey.charAt(0);

    if (suitOrder[suitA] !== suitOrder[suitB]) {
      return suitOrder[suitA] - suitOrder[suitB];
    }

    return rankOrder[rankA] - rankOrder[rankB];
  }

  /**
   * Creates a new Card instance.
   * @param {object} spriteSheet - The sprite sheet containing card textures
   * @param {string} textureKey - The texture key for this card (e.g., "AS", "KH")
   * @param {Function|null} clickHandler - Optional click handler callback
   * @param {number} cardX - Initial X position
   * @param {number} cardY - Initial Y position
   * @param {number} cardAngle - Initial rotation angle in degrees
   */
  constructor(spriteSheet, textureKey, clickHandler = null, cardX = 0, cardY = 0, cardAngle = 0) {
    super();

    this.x = cardX;
    this.y = cardY;
    this.angle = cardAngle;

    /** @type {string} The texture key identifying this card */
    this.textureKey = textureKey;

    /** @type {number} Random X offset for natural card placement */
    this.jitterX = Math.random() * 8 - 4;

    /** @type {number} Random Y offset for natural card placement */
    this.jitterY = Math.random() * 8 - 4;

    this.interactiveChildren = false;
    this.cacheAsTexture = true;

    const texture = spriteSheet.textures[textureKey];
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    this.addChild(sprite);

    this._setupClickable(clickHandler);
  }

  /**
   * Checks if this card's parent is the Hand container.
   * @returns {boolean} True if parent is Hand
   */
  isParentHand() {
    return this.parent instanceof Hand;
  }

  /**
   * Checks if this card's parent is the Table container.
   * @returns {boolean} True if parent is Table
   */
  isParentTable() {
    return this.parent instanceof Table;
  }

  /**
   * Checks if this card's parent is the Left container.
   * @returns {boolean} True if parent is Left
   */
  isParentLeft() {
    return this.parent instanceof Left;
  }

  /**
   * Checks if this card's parent is the Right container.
   * @returns {boolean} True if parent is Right
   */
  isParentRight() {
    return this.parent instanceof Right;
  }

  /**
   * Enables the hover effect for this card.
   * Hand cards move up, Left/Right cards push outward horizontally.
   */
  enableHoverEffect() {
    this.on('pointerenter', () => {
      if (this.isParentHand()) {
        this.y = this.baseY - CARD_HEIGHT / 6;
      } else if (this.isParentLeft() || this.isParentRight()) {
        this.x = this.baseX + this.hoverDirX * HOVER_DISTANCE;
        this.y = this.baseY + this.hoverDirY * HOVER_DISTANCE;
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

  /**
   * Disables the hover effect for this card.
   */
  disableHoverEffect() {
    this.off('pointerenter');
    this.off('pointerleave');
  }

  /**
   * Sets up click handling for the card.
   * @param {Function|null} clickHandler - The click handler callback
   * @private
   */
  _setupClickable(clickHandler) {
    if (clickHandler) {
      this.eventMode = 'static';
      this.cursor = 'pointer';
      this.hitArea = new Rectangle(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
      this.onpointerdown = () => clickHandler(this);
    } else {
      this.eventMode = 'none';
      this.cursor = null;
    }
  }

  /**
   * Returns a string representation of the card for debugging.
   * @returns {string} String describing the card's key, container, position, and angle
   */
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
