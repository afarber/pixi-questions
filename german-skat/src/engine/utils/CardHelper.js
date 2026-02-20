/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { CardModel } from '../game/CardModel.js';

export class CardHelper {
  static filterByRank(cards, rankEnum) {
    return cards.filter((c) => c.rankEnum === rankEnum);
  }

  static filterBySuit(cards, suitEnum) {
    return cards.filter((c) => c.suitEnum === suitEnum);
  }

  static removeCards(cards, toRemove) {
    return cards.filter((c) => !toRemove.some((r) => CardModel.equals(c, r)));
  }

  static removeBySuit(cards, suitEnum) {
    return cards.filter((c) => c.suitEnum !== suitEnum);
  }

  static getSuitCount(cards, suitEnum) {
    return cards.filter((c) => c.suitEnum === suitEnum).length;
  }

  static getWeakest(cards) {
    if (!cards.length) {
      return null;
    }
    const sorted = [...cards].sort((a, b) => CardModel.compareByRank(a, b));
    return sorted[sorted.length - 1];
  }

  static getStrongest(cards) {
    if (!cards.length) {
      return null;
    }
    const sorted = [...cards].sort((a, b) => CardModel.compareByRank(a, b));
    return sorted[0];
  }

  static getTopSequence(cards, suitEnum) {
    const wanted = ['a', 't', 'k', 'q', 'j', '9', '8', '7'];
    const ranks = new Set(cards.filter((c) => c.suitEnum === suitEnum).map((c) => String.fromCharCode(c.rankEnum)));
    const result = [];
    for (const rank of wanted) {
      if (!ranks.has(rank)) {
        break;
      }
      result.push({ rankEnum: rank.charCodeAt(0), suitEnum });
    }
    return result;
  }

  static getPowerfuls(cards, against) {
    return cards.filter((card) => against.every((other) => CardModel.compareByRank(card, other) > 0));
  }

  static getLosingCards(cards, topCard) {
    return cards.filter((card) => CardModel.compareByRank(card, topCard) < 0);
  }
}
