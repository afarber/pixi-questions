/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';
import { MoveSuggester } from '../ai/MoveSuggester.js';
import { AnnounceType, RankEnum, State } from '../utils/enums.js';
import { CardHelper } from '../utils/CardHelper.js';

/**
 * Handles the card-play phase: legal move calculation, user/bot move dispatch and UX events.
 */
export class CardPlayController extends BaseController {
  /**
   * @param {import('../SkatEngine.js').SkatEngine} engine - Shared game engine.
   */
  constructor(engine) {
    super(engine);
    this.PROMPT_VISIBLE_MS = 1200;
    this.BOT_DELAY_MS = 600;
    this.promptTimer = null;
    this.botTimer = null;
  }

  /**
   * Enters card-play processing for the current player.
   */
  start() {
    this.generateMove();
  }

  /**
   * Computes legal playable cards based on current trick and announce type.
   * @returns {object[]} Legal card models.
   */
  getCurrentPlayerPlayableCards() {
    const game = this.engine.game;
    const table = game.getTable();
    const player = game.getCurrentPlayer();
    const cards = player.getCards();

    if (!table.PrimeCard) {
      return cards;
    }

    if (game.getAnnounce().Type === AnnounceType.NULL_GAME) {
      const follow = CardHelper.filterBySuit(cards, table.PrimeCard.suitEnum);
      return follow.length ? follow : cards;
    }

    let playable;
    if (table.PrimeCard.rankEnum === RankEnum.JACK) {
      playable = CardHelper.filterBySuit(cards, table.trumpSuit).concat(
        CardHelper.filterByRank(CardHelper.removeBySuit(cards, table.trumpSuit), RankEnum.JACK)
      );
    } else {
      playable = CardHelper.filterBySuit(cards, table.PrimeCard.suitEnum);
      if (table.PrimeCard.suitEnum === table.trumpSuit) {
        playable = playable.concat(
          CardHelper.filterByRank(CardHelper.removeBySuit(cards, table.PrimeCard.suitEnum), RankEnum.JACK)
        );
      } else {
        playable = CardHelper.removeCards(playable, CardHelper.filterByRank(cards, RankEnum.JACK));
      }
    }
    return playable.length ? playable : cards;
  }

  /**
   * Produces either bot move scheduling or a human turn prompt.
   */
  generateMove() {
    const player = this.engine.game.getCurrentPlayer();
    const playable = this.getCurrentPlayerPlayableCards();
    this.engine.currentPlayableCards = playable;

    if (player.bot || player.isReplacedByBot) {
      clearTimeout(this.botTimer);
      this.botTimer = setTimeout(() => this.playerMove(MoveSuggester.suggestMoves(playable, this.engine.game)), this.BOT_DELAY_MS);
      return;
    }

    clearTimeout(this.promptTimer);
    this.engine.requestAction({
      kind: 'playCard',
      text: `${player.id} ___YOUR_TURN___`,
      subtext: '___CLICK_PLAYABLE___',
      options: []
    });
    this.promptTimer = setTimeout(() => {
      if (this.engine.state !== State.CARD_PLAY) {
        return;
      }
      if (this.engine.game.getCurrentPlayer()?.id !== player.id) {
        return;
      }
      this.engine.clearPrompt();
    }, this.PROMPT_VISIBLE_MS);
  }

  /**
   * Accepts and validates a human play-card action.
   * @param {object} action - UI action payload.
   */
  onPlayerAction(action) {
    if (action?.type !== 'PLAY_CARD') {
      return;
    }
    const legal = this.engine.currentPlayableCards.some(
      (c) => c.rankEnum === action.card.rankEnum && c.suitEnum === action.card.suitEnum
    );
    if (!legal) {
      return;
    }
    clearTimeout(this.promptTimer);
    this.playerMove(action.card);
  }

  /**
   * Applies a single card play and advances flow to TAKE_TRICK or next player's CARD_PLAY.
   * @param {object} card - Played card model.
   */
  playerMove(card) {
    const player = this.engine.game.getCurrentPlayer();
    this.engine.pushPlayEvent(player.id, card);
    this.engine.pushPlayHistory(
      `${player.id} ___PLAYS___ ${String.fromCharCode(card.rankEnum).toUpperCase()}${String.fromCharCode(card.suitEnum)}`
    );
    this.engine.game.applyCardMove(card);
    if (this.engine.game.getTrickOwner()) {
      this.engine.transition(State.TAKE_TRICK);
      return;
    }
    this.engine.game.advancePlayerIndex();
    this.engine.transition(State.CARD_PLAY);
  }

  /**
   * Clears active timers when controller is destroyed.
   */
  destroy() {
    clearTimeout(this.promptTimer);
    clearTimeout(this.botTimer);
  }
}
