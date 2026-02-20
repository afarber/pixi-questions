/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { BaseController } from './BaseController.js';
import { State } from '../utils/enums.js';

export class GameInitController extends BaseController {
  start() {
    this.engine.transition(State.ROUND_START);
  }
}
