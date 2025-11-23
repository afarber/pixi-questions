/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics } from "pixi.js";
import { ScrollBar } from "./ScrollBar";

// Default styling
const SCROLLBAR_WIDTH = 6;
const SCROLLBAR_PADDING = 4;

const DEFAULT_OPTIONS = {
  width: 200,
  height: 300,
  background: "White",
  radius: 0,
  padding: 0,
  elementsMargin: 0
};

/**
 * Scrollable container for displaying a vertical list of items.
 * Supports drag scrolling, mouse wheel, and includes an auto-hiding scrollbar.
 */
export class SectionedList extends Container {
  constructor(args) {
    super();

    const options = {
      ...DEFAULT_OPTIONS,
      ...args
    };

    this._width = options.width;
    this._height = options.height;
    this._background = options.background;
    this._radius = options.radius;
    this._padding = options.padding;
    this._elementsMargin = options.elementsMargin;

    // Store options for external access (MyList compatibility)
    this.options = { ...options };

    // Scroll state
    this._scrollY = 0;
    this._contentHeight = 0;
    this._dragState = null; // { startY, startScrollY } when dragging

    // Items array
    this._items = [];

    // Create background
    this._bg = new Graphics();
    this.addChild(this._bg);

    // Create content container
    this._content = new Container();
    this.addChild(this._content);

    // Create mask for clipping
    this._mask = new Graphics();
    this.addChild(this._mask);
    this._content.mask = this._mask;

    // Create scrollbar
    this._scrollBar = new ScrollBar({
      height: this._height - 2 * SCROLLBAR_PADDING
    });
    this._scrollBar.x = this._width - SCROLLBAR_WIDTH - SCROLLBAR_PADDING;
    this._scrollBar.y = SCROLLBAR_PADDING;
    this._scrollBar.visible = false;
    this._scrollBar.onScroll = this._onScrollBarScroll.bind(this);
    this.addChild(this._scrollBar);

    // Set up interactivity for content dragging
    this.eventMode = "static";

    // Bind event handlers
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onWheel = this._onWheel.bind(this);

    this.on("pointerdown", this._onPointerDown);
    this.on("wheel", this._onWheel);

    // Initial render
    this._updateGraphics();
  }

  _onPointerDown(e) {
    this._dragState = {
      startY: e.global.y,
      startScrollY: this._scrollY
    };

    // Listen on stage for move/up events
    const stage = this.stage;
    if (stage) {
      stage.on("pointermove", this._onPointerMove);
      stage.on("pointerup", this._onPointerUp);
      stage.on("pointerupoutside", this._onPointerUp);
    }
  }

  _onPointerMove(e) {
    if (!this._dragState) {
      return;
    }

    const deltaY = e.global.y - this._dragState.startY;
    this._scrollY = this._dragState.startScrollY + deltaY;
    this._clampScroll();
    this._updateContentPosition();
    this._updateScrollBar();
  }

  _onPointerUp() {
    this._dragState = null;

    // Remove stage listeners
    const stage = this.stage;
    if (stage) {
      stage.off("pointermove", this._onPointerMove);
      stage.off("pointerup", this._onPointerUp);
      stage.off("pointerupoutside", this._onPointerUp);
    }
  }

  _onWheel(e) {
    // Scroll with mouse wheel
    this._scrollY -= e.deltaY;
    this._clampScroll();
    this._updateContentPosition();
    this._updateScrollBar();
  }

  _onScrollBarScroll(ratio) {
    // ScrollBar dragged, update content position
    const maxScroll = this._getMaxScroll();
    this._scrollY = -ratio * maxScroll;
    this._updateContentPosition();
  }

  _getMaxScroll() {
    const viewportHeight = this._height - 2 * this._padding;
    return Math.max(0, this._contentHeight - viewportHeight);
  }

  _clampScroll() {
    const maxScroll = this._getMaxScroll();
    // scrollY is 0 at top, negative when scrolled down
    this._scrollY = Math.min(0, Math.max(-maxScroll, this._scrollY));
  }

  _updateGraphics() {
    // Draw background
    this._bg.clear();
    this._bg
      .roundRect(0, 0, this._width, this._height, this._radius)
      .fill({ color: this._background });

    // Update mask
    this._mask.clear();
    this._mask
      .roundRect(
        this._padding,
        this._padding,
        this._width - 2 * this._padding,
        this._height - 2 * this._padding,
        this._radius
      )
      .fill({ color: 0xffffff });

    // Position content
    this._content.x = this._padding;
    this._content.y = this._padding;

    // Update scrollbar position and height
    this._scrollBar.x = this._width - SCROLLBAR_WIDTH - SCROLLBAR_PADDING;
    this._scrollBar.setHeight(this._height - 2 * SCROLLBAR_PADDING);
  }

  _updateLayout() {
    let y = 0;

    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      item.y = y;
      y += item.height + this._elementsMargin;
    }

    // Remove last margin
    if (this._items.length > 0) {
      y -= this._elementsMargin;
    }

    this._contentHeight = y;
    this._clampScroll();
    this._updateContentPosition();
    this._updateScrollBar();
  }

  _updateContentPosition() {
    this._content.y = this._padding + this._scrollY;
  }

  _updateScrollBar() {
    const viewportHeight = this._height - 2 * this._padding;
    const needsScrollbar = this._contentHeight > viewportHeight;

    this._scrollBar.visible = needsScrollbar;

    if (needsScrollbar) {
      // Update thumb size ratio
      const thumbRatio = viewportHeight / this._contentHeight;
      this._scrollBar.setThumbRatio(thumbRatio);

      // Update scroll position ratio
      const maxScroll = this._getMaxScroll();
      const scrollRatio = maxScroll > 0 ? -this._scrollY / maxScroll : 0;
      this._scrollBar.setScrollRatio(scrollRatio);
    }
  }

  // Public properties

  get items() {
    return this._items;
  }

  // Public methods

  addItem(item) {
    this._items.push(item);
    this._content.addChild(item);
    this._updateLayout();
  }

  removeItems() {
    for (const item of this._items) {
      this._content.removeChild(item);
    }
    this._items = [];
    this._scrollY = 0;
    this._contentHeight = 0;
    this._updateContentPosition();
    this._updateScrollBar();
  }

  setSize({ width, height }) {
    this._width = width;
    this._height = height;
    this.options.width = width;
    this.options.height = height;
    this._updateGraphics();
    this._updateLayout();
  }

  // MyList compatibility method
  resize(x, y, w, h) {
    this.position.set(x, y);
    this.setSize({ width: w, height: h });
  }
}
