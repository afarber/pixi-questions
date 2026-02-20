/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';
import { GameDefs } from '../utils/GameDefs.js';
import { State } from '../utils/enums.js';

/**
 * Handles trick completion UX and state progression after three cards are on table.
 */
export class TakeTrickController extends BaseController {
  /**
   * @param {import('../SkatEngine.js').SkatEngine} engine - Shared game engine.
   */
  constructor(engine) {
    super(engine);
    this.TAKE_TRICK_ANIM_MS = 1100;
    this.moveTimer = null;
  }

  /**
   * Starts trick winner feedback, waits for animation, then commits trick ownership in game state.
   */
  start() {
    const owner = this.engine.game.getTrickOwner();
    const cards = [...this.engine.game.getTable().getCards()];
    const owners = [...this.engine.game.getTable().cardOwners];
    this.engine.pushPlayHistory(`${owner} ___TAKES_TRICK___`);
    this.engine.setTrickTakeAnimation(owner, cards, owners, this.TAKE_TRICK_ANIM_MS);

    clearTimeout(this.moveTimer);
    this.moveTimer = setTimeout(() => {
      this.engine.clearTrickTakeAnimation();
      this.engine.game.takeTrick();
      this.engine.game.setCurrentPlayerById(owner);

      if (this.engine.game.getTrickCounter() >= GameDefs.TOTAL_NUM_TRICKS) {
        this.engine.transition(State.ROUND_END);
        return;
      }
      this.engine.transition(State.CARD_PLAY);
    }, this.TAKE_TRICK_ANIM_MS);
  }

  /**
   * Clears pending timers when controller is disposed.
   */
  destroy() {
    clearTimeout(this.moveTimer);
  }
}
