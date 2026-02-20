/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';
import { ActionsSuggester } from '../ai/ActionsSuggester.js';
import { BidType, State } from '../utils/enums.js';
import { GameDefs } from '../utils/GameDefs.js';

export class BidController extends BaseController {
  constructor(engine) {
    super(engine);
    this.BOT_DELAY_MS = 900;
    this.BID_VISIBLE_MS = 900;
    this.activeBidders = [];
    this.moveTimer = null;
  }

  start() {
    this.activeBidders = this.engine.game.allPlayers.map((p) => p.id);
    this.engine.game.currentPlayerIndex = this.engine.game.nextIdx(this.engine.game.dealerIndex);
    this.generateMove();
  }

  getNextBidValue() {
    const bid = this.engine.game.getBid().Value;
    if (!bid) {
      return GameDefs.ALL_BID_VALUES[0];
    }
    const idx = GameDefs.ALL_BID_VALUES.indexOf(bid);
    return idx >= 0 ? GameDefs.ALL_BID_VALUES[idx + 1] : null;
  }

  generateMove() {
    const player = this.engine.game.getCurrentPlayer();
    if (!this.activeBidders.includes(player.id)) {
      this.nextTurn();
      return;
    }

    const options = [{ type: BidType.PASS, value: null }];
    const next = this.getNextBidValue();
    if (next) {
      options.push({ type: BidType.VALUE, value: next });
    }

    if (player.bot || player.isReplacedByBot) {
      const action = ActionsSuggester.suggestBid(options, this.engine.game);
      this.moveTimer = setTimeout(() => this.playerMove(action), this.BOT_DELAY_MS);
      return;
    }

    const label = this.engine.game.getBid().Value
      ? `${player.id}, ___DO_YOU_HOLD___ ${this.engine.game.getBid().Value}?`
      : player.id === 'Du'
        ? '___YOU_START_BIDDING___'
        : `${player.id} ___STARTS_BIDDING___`;
    this.engine.requestAction({
      kind: 'bid',
      text: label,
      options: options.map((o) => ({
        label: o.type === BidType.PASS ? '___PASS___' : '___YES___',
        action: { type: 'BID', bid: o }
      }))
    });
  }

  onPlayerAction(action) {
    if (action?.type !== 'BID') {
      return;
    }
    this.playerMove(action.bid);
  }

  playerMove(bid) {
    const player = this.engine.game.getCurrentPlayer();
    this.engine.game.applyBid(bid);

    const bidText = bid.type === BidType.PASS
      ? `${player.id} ___PASSES___`
      : `${player.id} ___SAYS___ ${bid.value}`;
    this.engine.pushBidHistory(bidText);

    if (bid.type === BidType.PASS) {
      this.activeBidders = this.activeBidders.filter((id) => id !== player.id);
    }
    this.moveTimer = setTimeout(() => {
      if (this.activeBidders.length <= 1 || this.engine.game.getBid().isFinished()) {
        this.engine.game.finalizeDeclarer(this.activeBidders);
        if (!this.engine.game.DeclarerId) {
          this.engine.transition(State.ROUND_END);
        } else {
          this.engine.transition(State.SHOULD_TAKE_SKAT);
        }
        return;
      }
      this.nextTurn();
    }, this.BID_VISIBLE_MS);
  }

  nextTurn() {
    this.engine.game.advancePlayerIndex();
    this.generateMove();
  }

  destroy() {
    clearTimeout(this.moveTimer);
  }
}
