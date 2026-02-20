/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { AnnounceType, SuitEnum } from '../utils/enums.js';
import { CardModel } from './CardModel.js';

export class Table {
  constructor() {
    this.cards = [];
    this.cardOwners = [];
    this.trumpSuit = SuitEnum.CLUBS;
  }

  clear() {
    this.cards = [];
    this.cardOwners = [];
  }

  setTrumpFromAnnounce(announce) {
    switch (announce) {
    case AnnounceType.DIAMONDS:
      this.trumpSuit = SuitEnum.DIAMONDS;
      break;
    case AnnounceType.HEARTS:
      this.trumpSuit = SuitEnum.HEARTS;
      break;
    case AnnounceType.SPADES:
      this.trumpSuit = SuitEnum.SPADES;
      break;
    case AnnounceType.CLUBS:
    case AnnounceType.GRAND:
    default:
      this.trumpSuit = SuitEnum.CLUBS;
      break;
    }
  }

  addCard(playerId, card) {
    this.cards.push(card);
    this.cardOwners.push(playerId);
  }

  getCards() {
    return this.cards;
  }

  get PrimeCard() {
    return this.cards.length ? this.cards[0] : null;
  }

  get PrimeCardOwner() {
    return this.cardOwners.length ? this.cardOwners[0] : null;
  }

  get MajorCard() {
    if (!this.cards.length) {
      return null;
    }
    let major = this.cards[0];
    for (let i = 1; i < this.cards.length; i++) {
      const card = this.cards[i];
      if (CardModel.compareByRank(card, major, this.currentAnnounce, String.fromCharCode(this.trumpSuit)) > 0) {
        major = card;
      }
    }
    return major;
  }

  get MajorCardOwner() {
    const major = this.MajorCard;
    const idx = this.cards.findIndex((card) => CardModel.equals(card, major));
    return idx >= 0 ? this.cardOwners[idx] : null;
  }
}
