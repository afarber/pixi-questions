/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import {
  AnnounceBaseValue,
  AnnounceType,
  BidType,
  BidderType,
  MultiplierType,
  RankEnum,
  SuitEnum
} from '../utils/enums.js';
import { CardHelper } from '../utils/CardHelper.js';
import { ScoreCalculator } from '../utils/ScoreCalculator.js';

export class ActionsSuggester {
  static suggestBid(playable, game) {
    const player = game.getCurrentPlayer();
    const cards = player.getCards();
    const currentBid = game.getBid().Value;
    const sevenEval = this.strongSevenRuleEvaluation(player, cards);
    const trumpEval = this.trumpsAndAcesRuleEvaluation(cards);

    if (playable.length === 1 && playable[0].type === BidType.PASS) {
      return playable[0];
    }
    if (sevenEval < 7 && trumpEval.evaluationValue < 7) {
      return playable.find((b) => b.type === BidType.PASS);
    }

    const base = sevenEval === trumpEval.evaluationValue
      ? player.BidderType === BidderType.FOREHAND
        ? AnnounceBaseValue.GRAND * (Math.abs(ScoreCalculator.calculateNumberOfMatadors(AnnounceType.GRAND, cards)) + MultiplierType.GAME)
        : trumpEval.suitBaseValue * (Math.abs(ScoreCalculator.calculateNumberOfMatadors(trumpEval.suit, cards)) + MultiplierType.GAME)
      : sevenEval >= 7
        ? AnnounceBaseValue.GRAND * (Math.abs(ScoreCalculator.calculateNumberOfMatadors(AnnounceType.GRAND, cards)) + MultiplierType.GAME)
        : trumpEval.suitBaseValue * (Math.abs(ScoreCalculator.calculateNumberOfMatadors(trumpEval.suit, cards)) + MultiplierType.GAME);

    if (base > currentBid) {
      return playable.find((b) => b.type !== BidType.PASS) || playable[0];
    }
    return playable.find((b) => b.type === BidType.PASS) || playable[0];
  }

  static suggestShouldTakeSkat() {
    return true;
  }

  static suggestSkatTake(game) {
    const player = game.getCurrentPlayer();
    const cards = [...player.getCards()];
    const sorted = [...cards].sort((a, b) => {
      const points = { a: 11, t: 10, k: 4, q: 3, j: 2, '9': 0, '8': 0, '7': 0 };
      return points[String.fromCharCode(a.rankEnum)] - points[String.fromCharCode(b.rankEnum)];
    });
    return [sorted[0], sorted[1]];
  }

  static suggestAnnounce(_playable, game) {
    const player = game.getCurrentPlayer();
    const cards = player.getCards();
    const s = this.strongSevenRuleEvaluation(player, cards);
    const t = this.trumpsAndAcesRuleEvaluation(cards);
    if (s === t.evaluationValue) {
      return { announce: player.BidderType === BidderType.FOREHAND ? AnnounceType.GRAND : t.suit };
    }
    return { announce: s >= 7 ? AnnounceType.GRAND : t.suit };
  }

  static strongSevenRuleEvaluation(player, cards) {
    const suits = [SuitEnum.DIAMONDS, SuitEnum.HEARTS, SuitEnum.SPADES, SuitEnum.CLUBS];
    const jacks = CardHelper.filterByRank(cards, RankEnum.JACK);
    const aces = CardHelper.filterByRank(cards, RankEnum.ACE);
    const tens = CardHelper.filterByRank(cards, RankEnum.TEN);
    const aceTens = tens.filter((ten) => CardHelper.filterBySuit(aces, ten.suitEnum).length > 0);
    const looseTens = CardHelper.removeCards(tens, aceTens);

    let score = 0;
    score += jacks.length >= 2 ? jacks.length : 0;
    score += aces.length;
    score += aceTens.length;
    score += looseTens.length > 2 ? 2 : looseTens.length;
    score += player.BidderType === BidderType.FOREHAND ? 1 : 0;

    if (jacks.length >= 3) {
      for (const suit of suits) {
        const suitCards = CardHelper.removeCards(CardHelper.filterBySuit(cards, suit), CardHelper.filterByRank(cards, RankEnum.JACK));
        const hasAce = CardHelper.filterByRank(suitCards, RankEnum.ACE).length > 0;
        const hasTen = CardHelper.filterByRank(suitCards, RankEnum.TEN).length > 0;
        if (suitCards.length >= 4 && hasAce && hasTen) {
          score += 1;
          break;
        }
      }
    }
    return score;
  }

  static trumpsAndAcesRuleEvaluation(cards) {
    const suits = [SuitEnum.DIAMONDS, SuitEnum.HEARTS, SuitEnum.SPADES, SuitEnum.CLUBS];
    const jacks = CardHelper.filterByRank(cards, RankEnum.JACK);
    let bestSuitCards = [];

    for (const suit of suits) {
      const suitCards = CardHelper.removeCards(CardHelper.filterBySuit(cards, suit), jacks);
      if (!bestSuitCards.length || suitCards.length > bestSuitCards.length) {
        bestSuitCards = suitCards;
      }
    }

    let suit = AnnounceType.CLUBS;
    let suitBaseValue = AnnounceBaseValue.CLUBS;
    if (bestSuitCards[0]?.suitEnum === SuitEnum.SPADES) {
      suit = AnnounceType.SPADES;
      suitBaseValue = AnnounceBaseValue.SPADES;
    } else if (bestSuitCards[0]?.suitEnum === SuitEnum.HEARTS) {
      suit = AnnounceType.HEARTS;
      suitBaseValue = AnnounceBaseValue.HEARTS;
    } else if (bestSuitCards[0]?.suitEnum === SuitEnum.DIAMONDS) {
      suit = AnnounceType.DIAMONDS;
      suitBaseValue = AnnounceBaseValue.DIAMONDS;
    }

    const outAces = CardHelper.removeCards(CardHelper.filterByRank(cards, RankEnum.ACE), CardHelper.filterByRank(bestSuitCards, RankEnum.ACE));
    const evaluationValue = bestSuitCards.length + jacks.length + outAces.length;
    return { suit, suitBaseValue, evaluationValue };
  }
}
