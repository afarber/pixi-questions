/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics, Text } from "pixi.js";
import { sound } from "@pixi/sound";
import { Group, Easing, Tween } from "@tweenjs/tween.js";
import {
  UI_HEIGHT,
  UI_WIDTH,
  UI_RADIUS,
  UI_BACKGROUND_DEFAULT,
  UI_BACKGROUND_HOVER,
  UI_BACKGROUND_PRESSED,
  UI_BACKGROUND_DISABLED
} from "../Theme";

// Create a shared tween group for all buttons
export const buttonsTweenGroup = new Group();

// Duration of the show/hide animation in milliseconds
const HIDE_SHOW_DURATION = 200;

// Button states
const STATE_DEFAULT = "default";
const STATE_HOVER = "hover";
const STATE_PRESSED = "pressed";
const STATE_DISABLED = "disabled";

const DEFAULT_OPTIONS = {
  text: "",
  width: UI_WIDTH,
  height: UI_HEIGHT,
  radius: UI_RADIUS,
  isToggle: false,
  enabled: true
};

export class Button extends Container {
  constructor(args) {
    super();

    const options = {
      ...DEFAULT_OPTIONS,
      ...args
    };

    this._width = options.width;
    this._height = options.height;
    this._radius = options.radius;
    this._state = options.enabled ? STATE_DEFAULT : STATE_DISABLED;
    this._isToggle = options.isToggle;
    this._toggled = false;
    this._isDown = false;

    this.activeTween = null;

    // Callbacks
    this.onPress = null;
    this.onToggle = null;

    // Create background graphics
    this._background = new Graphics();
    this.addChild(this._background);

    // Create text label
    this._textView = new Text({
      text: options.text,
      style: {
        fontSize: 24,
        fill: 0x000000
      }
    });
    this._textView.anchor.set(0.5);
    this.addChild(this._textView);

    // Set up interactivity
    this.eventMode = "static";
    this.cursor = "pointer";

    // Bind event handlers
    this._onPointerOver = this._onPointerOver.bind(this);
    this._onPointerOut = this._onPointerOut.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerUpOutside = this._onPointerUpOutside.bind(this);

    this._setupEvents();

    // Initial render
    this._updateBackground();
    this._updateTextPosition();

    // Apply initial disabled state
    if (this._state === STATE_DISABLED) {
      this.eventMode = "none";
      this.cursor = "default";
    }
  }

  _setupEvents() {
    this.on("pointerover", this._onPointerOver);
    this.on("pointerout", this._onPointerOut);
    this.on("pointerdown", this._onPointerDown);
    this.on("pointerup", this._onPointerUp);
    this.on("pointerupoutside", this._onPointerUpOutside);
  }

  _onPointerOver() {
    if (this._state === STATE_DISABLED || this._isDown) {
      return;
    }
    this._state = STATE_HOVER;
    this._updateBackground();
  }

  _onPointerOut() {
    if (this._state === STATE_DISABLED) {
      return;
    }
    this._isDown = false;
    this._state = STATE_DEFAULT;
    this._updateBackground();
  }

  _onPointerDown() {
    if (this._state === STATE_DISABLED) {
      return;
    }
    this._isDown = true;
    this._state = STATE_PRESSED;
    this._updateBackground();
    sound.play("click_002");
  }

  _onPointerUp() {
    if (this._state === STATE_DISABLED || !this._isDown) {
      return;
    }
    this._isDown = false;

    // Handle toggle
    if (this._isToggle) {
      this._toggled = !this._toggled;
      if (this.onToggle) {
        this.onToggle(this, this._toggled);
      }
    }

    // Fire press callback
    if (this.onPress) {
      this.onPress(this);
    }

    this._state = STATE_HOVER;
    this._updateBackground();
  }

  _onPointerUpOutside() {
    if (this._state === STATE_DISABLED) {
      return;
    }
    this._isDown = false;
    this._state = STATE_DEFAULT;
    this._updateBackground();
  }

  _updateBackground() {
    this._background.clear();

    let color;

    if (this._state === STATE_DISABLED) {
      color = UI_BACKGROUND_DISABLED;
    } else if (this._isToggle && this._toggled) {
      // When toggled on, use pressed color as base, hover as hover
      if (this._state === STATE_PRESSED) {
        color = UI_BACKGROUND_DEFAULT;
      } else if (this._state === STATE_HOVER) {
        color = UI_BACKGROUND_HOVER;
      } else {
        color = UI_BACKGROUND_PRESSED;
      }
    } else {
      // Normal state colors
      if (this._state === STATE_PRESSED) {
        color = UI_BACKGROUND_PRESSED;
      } else if (this._state === STATE_HOVER) {
        color = UI_BACKGROUND_HOVER;
      } else {
        color = UI_BACKGROUND_DEFAULT;
      }
    }

    this._background
      .roundRect(
        -this._width / 2,
        -this._height / 2,
        this._width,
        this._height,
        this._radius
      )
      .fill({ color });
  }

  _updateTextPosition() {
    this._textView.position.set(0, 0);
  }

  // Public properties

  get enabled() {
    return this._state !== STATE_DISABLED;
  }

  set enabled(value) {
    const isCurrentlyEnabled = this._state !== STATE_DISABLED;
    if (isCurrentlyEnabled === value) {
      return;
    }
    if (value) {
      this._state = STATE_DEFAULT;
      this.eventMode = "static";
      this.cursor = "pointer";
    } else {
      this._state = STATE_DISABLED;
      this.eventMode = "none";
      this.cursor = "default";
    }
    this._updateBackground();
  }

  get toggled() {
    return this._toggled;
  }

  set toggled(value) {
    if (this._toggled === value) {
      return;
    }
    this._toggled = value;
    this._updateBackground();
  }

  get text() {
    return this._textView.text;
  }

  set text(value) {
    this._textView.text = value;
  }

  get isToggle() {
    return this._isToggle;
  }

  set isToggle(value) {
    this._isToggle = value;
  }

  // Public methods

  show(animated = true, delay = 0) {
    // Cancel any running tween on this object
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.visible = true;

    if (!animated) {
      this.scale.set(1, 1);
      return;
    }

    this.scale.set(0, 0);

    this.activeTween = new Tween(this.scale, buttonsTweenGroup)
      .delay(delay)
      .to({ x: 1, y: 1 }, HIDE_SHOW_DURATION)
      .easing(Easing.Back.Out)
      .start();
  }

  hide(animated = true) {
    // Cancel any running tween on this object
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    if (!animated) {
      this.scale.set(0, 0);
      this.visible = false;
      return;
    }

    this.activeTween = new Tween(this.scale, buttonsTweenGroup)
      .to({ x: 0, y: 0 }, HIDE_SHOW_DURATION)
      .easing(Easing.Back.In)
      .onComplete(() => {
        this.visible = false;
      })
      .start();
  }

  resize(x, y, w, h, r = this._radius) {
    this._width = w;
    this._height = h;
    this._radius = r;
    this.position.set(x, y);
    this._updateBackground();
    this._updateTextPosition();
  }
}
