import { Board } from "./Board";
import { MyList } from "./MyList";
import { UI_HEIGHT, UI_WIDTH, UI_RADIUS, UI_PADDING } from "./Theme";

// A class for placing and resizing Pixi Containers.
// They are placed vertically by calling resize() method.
// Instances of MyList or Board are given the max height.

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

  // Resize children when this panel is resized
  resize(panelX, panelY, panelWidth, panelHeight) {
    if (panelWidth <= 0 || panelHeight <= 0 || !this.children.length) {
      console.log("MyVerticalPanel.resize called with invalid params or empty children", {
        panelX,
        panelY,
        panelWidth,
        panelHeight
      });
      return;
    }

    this.debugRect.clear().rect(panelX, panelY, panelWidth, panelHeight).stroke({ color: "red" });

    const availableHeight = panelHeight - (this.children.length - 1) * UI_PADDING;
    const childHeight = Math.min(UI_HEIGHT, availableHeight / this.children.length);
    const maxChildHeight = availableHeight - (this.children.length - 1) * childHeight;

    // Iterate the list of children and call .resize() on each of them
    // For MyList and Board (there can be max 1 of them) use the max height
    let currentY = panelY;

    for (let child of this.children) {
      if (!child.resize) {
        console.log("Skipping a MyVerticalPanel child without resize() method");
        continue;
      }

      if (child instanceof MyList) {
        child.resize(panelX - UI_PADDING, currentY, panelWidth + 2 * UI_PADDING, maxChildHeight);
        currentY += maxChildHeight + UI_PADDING;
      } else if (child instanceof Board) {
        child.resize(panelX, currentY, panelWidth, maxChildHeight);
        currentY += maxChildHeight + UI_PADDING;
      } else {
        child.resize(panelX + panelWidth / 2, currentY + childHeight / 2, panelWidth, childHeight, UI_RADIUS);
        currentY += childHeight + UI_PADDING;

        if (child.hide && child.show) {
          child.hide(false);
          child.show(true, 50);
        }
      }
    }
  }
}
