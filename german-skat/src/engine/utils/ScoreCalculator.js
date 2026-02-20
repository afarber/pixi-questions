/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { CardHelper } from './CardHelper.js';
import { GameDefs } from './GameDefs.js';
import { AnnounceType, RankEnum, SuitEnum } from './enums.js';

export class ScoreCalculator {
  static calculateCurrentRoundScore(game) {
    const score = {};
    for (const player of game.allPlayers) {
      score[player.id] = this.calculateCardPoints(game, player.id);
    }
    return score;
  }

  static calculateCardPoints(game, playerId) {
    let total = 0;
    for (const trick of game.getPlayerTricks(playerId)) {
      for (const card of trick.cards) {
        total += GameDefs.cardPoints[String.fromCharCode(card.rankEnum)];
      }
    }
    if (playerId === game.DeclarerId && game.getAnnounce().Type !== AnnounceType.NULL_GAME) {
      for (const card of game.skatCards) {
        total += GameDefs.cardPoints[String.fromCharCode(card.rankEnum)];
      }
    }
    return total;
  }

  static calculateNumberOfMatadors(announce, cards) {
    let count = 0;
    if (announce === AnnounceType.NULL_GAME) {
      return 0;
    }
    const jacks = CardHelper.filterByRank(cards, RankEnum.JACK);
    const hasClubJack = CardHelper.filterBySuit(jacks, SuitEnum.CLUBS).length > 0;

    const jackOrder = [SuitEnum.CLUBS, SuitEnum.SPADES, SuitEnum.HEARTS, SuitEnum.DIAMONDS];
    if (hasClubJack) {
      for (const suit of jackOrder) {
        if (!CardHelper.filterBySuit(jacks, suit).length) {
          break;
        }
        count++;
      }
      return count;
    }

    let missing = 0;
    for (const suit of jackOrder) {
      if (CardHelper.filterBySuit(jacks, suit).length) {
        break;
      }
      missing++;
    }
    return -missing;
  }
}
