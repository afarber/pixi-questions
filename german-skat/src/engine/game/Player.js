/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

export class Player {
  constructor(id, teamId, bot = false) {
    this._id = id;
    this._teamId = teamId;
    this._bot = bot;
    this._active = true;
    this._kicked = false;
    this._replacedByBot = false;
    this._cards = [];
    this.bidderType = null;
  }

  get id() { return this._id; }
  get teamId() { return this._teamId; }
  get bot() { return this._bot; }
  set bot(v) { this._bot = v; }
  get active() { return this._active; }
  set active(v) { this._active = v; }
  get kicked() { return this._kicked; }
  set kicked(v) { this._kicked = v; }
  get isReplacedByBot() { return this._replacedByBot; }
  set isReplacedByBot(v) { this._replacedByBot = v; }
  get BidderType() { return this.bidderType; }
  set BidderType(v) { this.bidderType = v; }

  reset() {
    this._cards = [];
  }

  removeCard(card) {
    const idx = this._cards.findIndex((c) => c.rankEnum === card.rankEnum && c.suitEnum === card.suitEnum);
    if (idx >= 0) {
      this._cards.splice(idx, 1);
    }
  }

  putCard(card) {
    this._cards.push(card);
  }

  getCards() {
    return this._cards;
  }
}
