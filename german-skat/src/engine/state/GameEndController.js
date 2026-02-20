/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';

export class GameEndController extends BaseController {
  start() {
    this.engine.requestAction({
      kind: 'gameEnd',
      text: '___GAME_OVER___',
      subtext: '___RESTART_Q___',
      options: [{ label: '___RESTART___', action: { type: 'RESTART' } }]
    });
  }

  onPlayerAction(action) {
    if (action?.type === 'RESTART') {
      this.engine.restart();
    }
  }
}
