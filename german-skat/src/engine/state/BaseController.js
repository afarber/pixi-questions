/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

export class BaseController {
  constructor(engine) {
    this.engine = engine;
  }

  start() {}
  onPlayerAction() {}
  destroy() {}
  getPayload() { return null; }
}
