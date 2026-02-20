/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';
import { ActionsSuggester } from '../ai/ActionsSuggester.js';
import { State } from '../utils/enums.js';

export class ShouldTakeSkatController extends BaseController {
  start() {
    this.engine.game.setCurrentPlayerById(this.engine.game.DeclarerId);
    const player = this.engine.game.getCurrentPlayer();
    if (player.bot || player.isReplacedByBot) {
      this.playerMove(ActionsSuggester.suggestShouldTakeSkat());
      return;
    }
    this.engine.requestAction({
      kind: 'shouldTakeSkat',
      text: '___TAKE_SKAT_Q___',
      options: [
        { label: '___YES___', action: { type: 'SHOULD_TAKE_SKAT', value: true } },
        { label: '___NO___', action: { type: 'SHOULD_TAKE_SKAT', value: false } }
      ]
    });
  }

  onPlayerAction(action) {
    if (action?.type !== 'SHOULD_TAKE_SKAT') {
      return;
    }
    this.playerMove(action.value);
  }

  playerMove(shouldTake) {
    this.engine.shouldTakeSkat = shouldTake;
    if (!shouldTake) {
      this.engine.transition(State.ANNOUNCE);
      return;
    }
    const player = this.engine.game.getCurrentPlayer();
    for (const card of this.engine.game.skatCards) {
      player.putCard(card);
    }
    this.engine.transition(State.SKAT_TAKE);
  }
}
