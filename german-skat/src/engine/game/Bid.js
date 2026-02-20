/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BidType } from '../utils/enums.js';

export class Bid {
  constructor() {
    this.passCounter = 0;
    this.topBidPlayer = null;
    this.type = BidType.PASS;
    this.value = 0;
  }

  get PassCounter() { return this.passCounter; }
  get Type() { return this.type; }
  get Value() { return this.value; }
  get BidData() { return { type: this.type, value: this.value }; }
  get TopBidder() { return this.topBidPlayer; }

  setBid(player, bid) {
    if (bid.type === BidType.PASS) {
      this.passCounter++;
      return;
    }
    this.type = bid.type;
    this.value = bid.value;
    this.topBidPlayer = player;
  }

  isFinished() {
    return this.passCounter >= 2;
  }
}
