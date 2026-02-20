/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { AnnounceType, MultiplierType } from '../utils/enums.js';

export class Announce {
  constructor() {
    this.type = null;
    this.multiplier = MultiplierType.GAME;
  }

  get Type() { return this.type; }
  get Multiplier() { return this.multiplier; }

  setAnnounce(action) {
    if (action?.announce) {
      this.type = action.announce;
    }
    if (action?.multiplier && action.multiplier > this.multiplier) {
      this.multiplier = action.multiplier;
    }
  }

  static getAvailableAnnounces() {
    return [
      AnnounceType.CLUBS,
      AnnounceType.SPADES,
      AnnounceType.HEARTS,
      AnnounceType.DIAMONDS,
      AnnounceType.GRAND,
      AnnounceType.NULL_GAME
    ];
  }
}
