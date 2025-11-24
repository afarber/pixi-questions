/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Assets, Sprite, Text } from 'pixi.js';
import { UI_PADDING } from '../Theme';

const AVATAR_WIDTH = 60;
const AVATAR_HEIGHT = 80;
const DEFAULT_AVATAR_URL = 'https://pixijs.com/assets/bunny.png';

const DEFAULT_OPTIONS = {
  photo: '',
  given: '',
  elo: 1500,
  score: 0
};

/**
 * Avatar component displaying player image, name, ELO rating with chess piece, and score.
 */
export class Avatar extends Container {
  constructor(args) {
    super();

    const options = {
      ...DEFAULT_OPTIONS,
      ...args
    };

    this._photo = options.photo;
    this._given = options.given;
    this._elo = options.elo;
    this._score = options.score;

    // Placeholder for sprite (will be loaded async)
    this._sprite = null;

    // Create name text (above sprite)
    this._nameText = new Text({
      text: this._given,
      style: {
        fontSize: 16,
        fill: 0x000000
      }
    });
    this._nameText.anchor.set(0.5);
    this.addChild(this._nameText);

    // Create ELO text with chess piece (below sprite)
    this._eloText = new Text({
      text: this._getChessPiece(this._elo) + ' ' + this._elo,
      style: {
        fontSize: 14,
        fill: 0x000000
      }
    });
    this._eloText.anchor.set(0.5);
    this.addChild(this._eloText);

    // Create score text (below ELO)
    this._scoreText = new Text({
      text: '___SCORE___: ' + this._score,
      style: {
        fontSize: 14,
        fill: 0x000000
      }
    });
    this._scoreText.anchor.set(0.5);
    this.addChild(this._scoreText);

    // Load avatar image
    this._loadImage();
  }

  _validatePhoto(url) {
    // Return default if url is empty or doesn't start with https://
    if (!url || !url.startsWith('https://')) {
      return DEFAULT_AVATAR_URL;
    }
    return url;
  }

  async _loadImage() {
    const imageUrl = this._validatePhoto(this._photo);

    try {
      const texture = await Assets.load(imageUrl);
      this._sprite = new Sprite(texture);

      // Scale to fit within AVATAR_WIDTH x AVATAR_HEIGHT maintaining aspect ratio
      const scale = Math.min(AVATAR_WIDTH / texture.width, AVATAR_HEIGHT / texture.height);
      this._sprite.scale.set(scale);
      this._sprite.anchor.set(0.5);

      // Add sprite after name text (index 1)
      this.addChildAt(this._sprite, 1);

      this._updateLayout();
    } catch (error) {
      console.error('Failed to load avatar image:', error);
      this._updateLayout();
    }
  }

  _updateLayout() {
    // Calculate total height to center around (0, 0)
    const nameHeight = this._nameText.height;
    const spriteHeight = this._sprite ? this._sprite.height : 0;
    const eloHeight = this._eloText.height;
    const scoreHeight = this._scoreText.height;
    const spacing = UI_PADDING / 2;

    const totalHeight = nameHeight + spriteHeight + eloHeight + scoreHeight + spacing * 3;
    let yOffset = -totalHeight / 2;

    // Position name text (top)
    this._nameText.x = 0;
    this._nameText.y = yOffset + nameHeight / 2;
    yOffset += nameHeight + spacing;

    // Position sprite if loaded (center)
    if (this._sprite) {
      this._sprite.x = 0;
      this._sprite.y = yOffset + spriteHeight / 2;
      yOffset += spriteHeight + spacing;
    }

    // Position ELO text
    this._eloText.x = 0;
    this._eloText.y = yOffset + eloHeight / 2;
    yOffset += eloHeight + spacing;

    // Position score text
    this._scoreText.x = 0;
    this._scoreText.y = yOffset + scoreHeight / 2;
  }

  _getChessPiece(elo) {
    if (elo > 2600) return '♔'; // King
    if (elo > 2400) return '♕'; // Queen
    if (elo > 2200) return '♖'; // Rook
    if (elo > 2000) return '♗'; // Bishop
    if (elo > 1800) return '♘'; // Knight
    return '♙'; // Pawn
  }

  // Public properties

  get photo() {
    return this._photo;
  }

  set photo(value) {
    this._photo = value;
    // Reload the image with new URL
    if (this._sprite) {
      this.removeChild(this._sprite);
      this._sprite = null;
    }
    this._loadImage();
  }

  get given() {
    return this._given;
  }

  set given(value) {
    this._given = value;
    this._nameText.text = value;
    this._updateLayout();
  }

  get elo() {
    return this._elo;
  }

  set elo(value) {
    this._elo = value;
    this._eloText.text = this._getChessPiece(value) + ' ' + value;
    this._updateLayout();
  }

  get score() {
    return this._score;
  }

  set score(value) {
    this._score = value;
    this._scoreText.text = '___SCORE___: ' + value;
    this._updateLayout();
  }

  /**
   * Resize method required by VerticalPanel.
   * VerticalPanel passes center coordinates for positioning.
   */
  resize(x, y, _w, _h) {
    this.position.set(x, y);
  }
}
