/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Sprite, Text, Graphics } from 'pixi.js';
import {
  USER_SIZE,
  USER_AVATAR_SIZE,
  USER_LABEL_HEIGHT,
  USER_FONT_SIZE_NAME,
  USER_FONT_SIZE_LABEL,
  USER_BACKGROUND_COLOR,
  USER_BACKGROUND_ALPHA,
  USER_BORDER_COLOR,
  USER_TEXT_COLOR
} from './Theme.js';

/**
 * Represents a user/player panel displaying avatar and game information.
 * Layout: 240x240 with 200x200 avatar at top and 40px label row at bottom.
 * @extends Container
 */
export class User extends Container {
  /**
   * Creates a new User container.
   */
  constructor() {
    super();

    this._avatarSprite = null;
    this._currentTextureKey = null;

    this._createBackground();
    this._createLabels();
  }

  /**
   * Creates the background panel with rounded corners and border.
   * @private
   */
  _createBackground() {
    const bg = new Graphics();

    // Draw rounded rectangle background
    bg.roundRect(0, 0, USER_SIZE, USER_SIZE, 8);
    bg.fill({ color: USER_BACKGROUND_COLOR, alpha: USER_BACKGROUND_ALPHA });
    bg.stroke({ width: 2, color: USER_BORDER_COLOR });

    this.addChild(bg);
  }

  /**
   * Creates the text labels for username, bid, and tricks.
   * @private
   */
  _createLabels() {
    // Avatar is 200x200 centered, so label row starts at y = 200
    const labelY = USER_AVATAR_SIZE;

    // Username label (left-aligned)
    this._usernameText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: USER_FONT_SIZE_NAME,
        fill: USER_TEXT_COLOR,
        align: 'left'
      }
    });
    this._usernameText.x = 10;
    this._usernameText.y = labelY + (USER_LABEL_HEIGHT - USER_FONT_SIZE_NAME) / 2;
    this.addChild(this._usernameText);

    // Bid label (centered)
    this._bidText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: USER_FONT_SIZE_LABEL,
        fontWeight: 'bold',
        fill: USER_TEXT_COLOR,
        align: 'center'
      }
    });
    this._bidText.anchor.set(0.5, 0);
    this._bidText.x = USER_SIZE / 2;
    this._bidText.y = labelY + (USER_LABEL_HEIGHT - USER_FONT_SIZE_LABEL) / 2;
    this.addChild(this._bidText);

    // Tricks label (right-aligned)
    this._tricksText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: USER_FONT_SIZE_LABEL,
        fontWeight: 'bold',
        fill: USER_TEXT_COLOR,
        align: 'right'
      }
    });
    this._tricksText.anchor.set(1, 0);
    this._tricksText.x = USER_SIZE - 10;
    this._tricksText.y = labelY + (USER_LABEL_HEIGHT - USER_FONT_SIZE_LABEL) / 2;
    this.addChild(this._tricksText);
  }

  /**
   * Sets the avatar from a spritesheet texture.
   * @param {object} spriteSheet - The loaded spritesheet
   * @param {string} textureKey - Key for the texture (e.g., '1B', '2B')
   */
  setAvatar(spriteSheet, textureKey) {
    // Skip if same texture already set
    if (this._currentTextureKey === textureKey) {
      return;
    }
    this._currentTextureKey = textureKey;

    // Remove existing avatar sprite
    if (this._avatarSprite) {
      this.removeChild(this._avatarSprite);
      this._avatarSprite.destroy();
      this._avatarSprite = null;
    }

    if (!spriteSheet || !textureKey) {
      return;
    }

    const texture = spriteSheet.textures[textureKey];
    if (!texture) {
      console.warn(`Texture not found: ${textureKey}`);
      return;
    }

    this._avatarSprite = new Sprite(texture);
    // Center avatar horizontally: (240 - 200) / 2 = 20
    this._avatarSprite.x = (USER_SIZE - USER_AVATAR_SIZE) / 2;
    this._avatarSprite.y = 0;
    this._avatarSprite.width = USER_AVATAR_SIZE;
    this._avatarSprite.height = USER_AVATAR_SIZE;

    // Add at index 1 (after background, before labels)
    this.addChildAt(this._avatarSprite, 1);
  }

  /**
   * Sets the username text.
   * @param {string} name - The player's username
   */
  set username(name) {
    this._usernameText.text = name || '';
  }

  /**
   * Gets the username text.
   * @returns {string} The current username
   */
  get username() {
    return this._usernameText.text;
  }

  /**
   * Sets the bid label text.
   * @param {string} bid - The current bid (e.g., "6S", "Pass")
   */
  set bid(bid) {
    this._bidText.text = bid || '';
  }

  /**
   * Gets the bid text.
   * @returns {string} The current bid
   */
  get bid() {
    return this._bidText.text;
  }

  /**
   * Sets the tricks count text.
   * @param {string|number} tricks - The number of tricks won
   */
  set tricks(tricks) {
    this._tricksText.text = String(tricks ?? '');
  }

  /**
   * Gets the tricks text.
   * @returns {string} The current tricks count
   */
  get tricks() {
    return this._tricksText.text;
  }

  /**
   * Updates all user data at once.
   * @param {object} spriteSheet - The loaded spritesheet for avatar
   * @param {object} data - Object with username, avatarKey, bid, tricks properties
   */
  updateData(spriteSheet, { username = '', avatarKey = null, bid = '', tricks = '' } = {}) {
    this.username = username;
    this.bid = bid;
    this.tricks = tricks;
    if (avatarKey) {
      this.setAvatar(spriteSheet, avatarKey);
    }
  }
}
