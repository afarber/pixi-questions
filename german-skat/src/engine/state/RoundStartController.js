/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';
import { GameDefs } from '../utils/GameDefs.js';
import { State } from '../utils/enums.js';

export class RoundStartController extends BaseController {
  start() {
    if (this.engine.game.getCurrentRound() > GameDefs.TOTAL_ROUNDS) {
      this.engine.transition(State.GAME_END);
      return;
    }
    this.engine.clearBidHistory();
    this.engine.clearPlayHistory();
    this.engine.game.resetRoundData();
    this.engine.transition(State.DEAL);
  }
}
