/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';
import { ActionsSuggester } from '../ai/ActionsSuggester.js';
import { State } from '../utils/enums.js';

export class SkatTakeController extends BaseController {
  start() {
    const player = this.engine.game.getCurrentPlayer();
    if (player.bot || player.isReplacedByBot) {
      const discard = ActionsSuggester.suggestSkatTake(this.engine.game);
      this.playerMove(discard);
      return;
    }
    this.engine.requestAction({
      kind: 'skatDiscard',
      text: '___CHOOSE_SKAT___',
      subtext: '___CLICK2_CONFIRM___',
      options: [{ label: '___CONFIRM___', action: { type: 'CONFIRM_SKAT_DISCARD' }, disabled: true }]
    });
  }

  onPlayerAction(action) {
    if (action?.type !== 'SKAT_DISCARD') {
      return;
    }
    this.playerMove(action.cards);
  }

  playerMove(cards) {
    const player = this.engine.game.getCurrentPlayer();
    for (const card of cards) {
      player.removeCard(card);
    }
    this.engine.game.skatCards = cards;
    this.engine.transition(State.ANNOUNCE);
  }
}
