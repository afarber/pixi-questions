import { Board } from "./Board";
import { MyList } from "./MyList";
import { UI_HEIGHT, UI_WIDTH, UI_RADIUS, UI_PADDING } from "./Theme";

// A class for placing and resizing Pixi Containers.
// They are placed vertically by calling resize() method.
// Instances of ScrollBox or Board are given the max height.

export class MyVerticalPanel {
  constructor(debugRect) {
    this.children = [];
    this.debugRect = debugRect;
  }

  // add a child element
  addChild(child) {
    this.children.push(child);
    return this;
  }

  // Find a ScrollBox or Board, there can be 0 or 1 of those
  findMaximizedChild() {
    for (let child of this.children) {
      if (child instanceof MyList || child instanceof Board) {
        return child;
      }
    }
  }

  // Resize children when this panel is resized
  resize(panelX, panelY, panelWidth, panelHeight) {
    console.log("MyVerticalPanel.resize params", { panelX, panelY, panelWidth, panelHeight });
    this.debugRect.clear().rect(panelX, panelY, panelWidth, panelHeight).stroke({ color: "red" });

    if (panelWidth <= 0 || panelHeight <= 0 || !this.children.length) {
      console.log("MyVerticalPanel.resize called with invalid params or empty children");
      return;
    }

    const childWidth = panelWidth;
    const availableHeight = panelHeight - (this.children.length - 1) * UI_PADDING;
    const childHeight = Math.min(UI_HEIGHT, availableHeight / this.children.length);
    const maxChildHeight = this.findMaximizedChild() ? availableHeight - (this.children.length - 1) * childHeight : 0;
    console.log("MyVerticalPanel.resize", { childWidth, maxChildHeight, childHeight, availableHeight });

    // Iterate the list of children and call .resize() on each of them
    let currentY = panelY;

    for (let child of this.children) {
      if (!child.resize) {
        continue;
      }

      if (child instanceof MyList) {
        child.resize(panelX - UI_PADDING, currentY, panelWidth + 2 * UI_PADDING, maxChildHeight);
        currentY += maxChildHeight + UI_PADDING;
      } else if (child instanceof Board) {
        child.resize(panelX, currentY, panelWidth, maxChildHeight);
        currentY += maxChildHeight + UI_PADDING;
      } else {
        child.resize(panelX + childWidth / 2, currentY + childHeight / 2, childWidth, childHeight, UI_RADIUS);
        currentY += childHeight + UI_PADDING;
      }

      // Handle show/hide animations if applicable
      if (child.hide && child.show) {
        child.hide(false);
        child.show(true, 50);
      }
    }
  }
}
