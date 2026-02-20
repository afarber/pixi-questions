/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';
import { ActionsSuggester } from '../ai/ActionsSuggester.js';
import { Announce } from '../game/Announce.js';
import { State } from '../utils/enums.js';

const LABELS = {
  clubs: '___CLUBS___',
  spades: '___SPADES___',
  hearts: '___HEARTS___',
  diamonds: '___DIAMONDS___',
  grand: '___GRAND___',
  null: '___NULL___'
};

export class AnnounceController extends BaseController {
  start() {
    this.engine.game.setCurrentPlayerById(this.engine.game.DeclarerId);
    const player = this.engine.game.getCurrentPlayer();
    const announces = Announce.getAvailableAnnounces();

    if (player.bot || player.isReplacedByBot) {
      this.playerMove(ActionsSuggester.suggestAnnounce(announces, this.engine.game));
      return;
    }

    this.engine.requestAction({
      kind: 'announce',
      text: '___ANNOUNCE_GAME___',
      options: announces.map((announce) => ({ label: LABELS[announce], action: { type: 'ANNOUNCE', announce } }))
    });
  }

  onPlayerAction(action) {
    if (action?.type !== 'ANNOUNCE') {
      return;
    }
    this.playerMove({ announce: action.announce });
  }

  playerMove(action) {
    this.engine.game.getAnnounce().setAnnounce(action);
    this.engine.game.getTable().currentAnnounce = action.announce;
    this.engine.game.getTable().setTrumpFromAnnounce(action.announce);
    const firstPlayerIdx = this.engine.game.nextIdx(this.engine.game.dealerIndex);
    this.engine.game.currentPlayerIndex = firstPlayerIdx;
    this.engine.transition(State.CARD_PLAY);
  }
}
