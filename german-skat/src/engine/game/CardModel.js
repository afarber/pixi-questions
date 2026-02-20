/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { AnnounceType } from '../utils/enums.js';
import { GameDefs } from '../utils/GameDefs.js';

export class CardModel {
  static getId(card) {
    return `${String.fromCharCode(card.rankEnum)}${String.fromCharCode(card.suitEnum)}`;
  }

  static equals(a, b) {
    return a && b && a.rankEnum === b.rankEnum && a.suitEnum === b.suitEnum;
  }

  static compareByRank(a, b, announce = AnnounceType.GRAND, trumpSuit = null) {
    const rankA = String.fromCharCode(a.rankEnum);
    const rankB = String.fromCharCode(b.rankEnum);
    const suitA = String.fromCharCode(a.suitEnum);
    const suitB = String.fromCharCode(b.suitEnum);

    if (announce === AnnounceType.NULL_GAME) {
      const pa = GameDefs.nullGameRankPriorities[rankA].priority;
      const pb = GameDefs.nullGameRankPriorities[rankB].priority;
      if (suitA !== suitB) {
        return 0;
      }
      return pb - pa;
    }

    const isJackA = rankA === 'j';
    const isJackB = rankB === 'j';
    if (isJackA && isJackB) {
      return GameDefs.mapJacksSuitPriority[suitB].priority - GameDefs.mapJacksSuitPriority[suitA].priority;
    }
    if (isJackA) {
      return 1;
    }
    if (isJackB) {
      return -1;
    }

    const isTrumpA = trumpSuit && suitA === trumpSuit;
    const isTrumpB = trumpSuit && suitB === trumpSuit;
    if (isTrumpA && !isTrumpB) {
      return 1;
    }
    if (!isTrumpA && isTrumpB) {
      return -1;
    }
    if (suitA !== suitB) {
      return 0;
    }
    return GameDefs.trumpGameRankPriorities[rankB].priority - GameDefs.trumpGameRankPriorities[rankA].priority;
  }
}
