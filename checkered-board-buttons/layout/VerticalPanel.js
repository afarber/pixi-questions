/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Graphics, Text } from "pixi.js";
import { Board } from "../Board";
import { GamesList } from "../components/GamesList.js";
import { UI_HEIGHT, UI_RADIUS, UI_PADDING } from "../Theme";
import { TILE_SIZE } from "../Tile";

/**
 * Container for vertically stacking UI elements in a column.
 * Handles positioning and resizing of children via the resize() method.
 * Special children (GamesList, Board) are given maximum available height.
 */
export class VerticalPanel {
  constructor(stage) {
    this.children = [];
    this.debugRect = new Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).stroke({ color: "Red" });
    stage.addChild(this.debugRect);
  }

  // add a child element
  addChild(child) {
    this.children.push(child);
    return this;
  }

  // add all children elements to stage
  addChildrenToStage(stage) {
    for (const child of this.children) {
      stage.addChild(child);
    }
  }

  // Find a GamesList or Board, there can be 0 or 1 of those
  hasSpecialChild() {
    return this.children.some((child) => child instanceof GamesList || child instanceof Board);
  }

  // Resize children when this panel is resized
  resize(panelX, panelY, panelWidth, panelHeight) {
    if (panelWidth <= 0 || panelHeight <= 0 || !this.children.length) {
      console.log("VerticalPanel.resize called with invalid params or empty children", {
        panelX,
        panelY,
        panelWidth,
        panelHeight
      });
      return;
    }

    this.debugRect.clear().rect(panelX, panelY, panelWidth, panelHeight).stroke({ color: "red" });

    const availableHeight = panelHeight - (this.children.length - 1) * UI_PADDING;
    const childHeight = Math.min(UI_HEIGHT, availableHeight / 10);
    const maxChildHeight = availableHeight - (this.children.length - 1) * childHeight;
    const paddingY = this.hasSpecialChild()
      ? UI_PADDING
      : (panelHeight - childHeight * this.children.length) / (this.children.length - 1);

    // Iterate the list of children and call .resize() on each of them
    // For GamesList and Board (there can be max 1 of them) use the max height
    let currentY = panelY;

    for (const child of this.children) {
      if (!child.resize) {
        console.log("Skipping a VerticalPanel child without resize() method");
        // TODO
        //continue;
      }

      if (child instanceof GamesList) {
        child.resize(panelX - UI_PADDING, currentY, panelWidth + 2 * UI_PADDING, maxChildHeight);
        currentY += maxChildHeight + UI_PADDING;
      } else if (child instanceof Board) {
        child.resize(panelX, currentY, panelWidth, maxChildHeight);
        currentY += maxChildHeight + UI_PADDING;
      } else if (child instanceof Text) {
        child.x = panelX + panelWidth / 2;
        child.y = currentY + childHeight / 2;
        child.anchor.set(0.5);
        currentY += childHeight + paddingY;
      } else {
        child.resize(panelX + panelWidth / 2, currentY + childHeight / 2, panelWidth, childHeight, UI_RADIUS);
        currentY += childHeight + paddingY;

        if (child.hide && child.show) {
          child.hide(false);
          child.show(true, 50);
        }
      }
    }
  }
}
