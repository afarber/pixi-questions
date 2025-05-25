import { UI_HEIGHT, UI_WIDTH, UI_RADIUS, UI_PADDING } from "./Theme";

// A class for placing and resizing Pixi Containers.
// They are placed vertically by calling resize() method.
// A Container with "grow" property is given max height.

export class MyVerticalPanel {
  constructor() {
    this.children = [];
  }

  // add a child element
  addChild(child) {
    this.children.push(child);
    return this;
  }

  // Find a child with "grow" set, there can be 0 or 1 of those
  findGrowChild() {
    for (let child of this.children) {
      if (child.grow) {
        return child;
      }
    }
  }

  // Resize children when this panel is resized
  resize(panelX, panelY, panelWidth, panelHeight) {
    console.log("MyVerticalPanel.resize params", { panelX, panelY, panelWidth, panelHeight });

    if (panelWidth <= 0 || panelHeight <= 0 || !this.children.length) {
      console.log("MyVerticalPanel.resize called with invalid params or empty children");
      return;
    }

    const childWidth = panelWidth - 2 * UI_PADDING;
    const availableHeight = panelHeight - (this.children.length + 1) * UI_PADDING;
    const childHeight = Math.max(UI_HEIGHT, availableHeight / this.children.length);

    console.log("MyVerticalPanel.resize", { childWidth, childHeight, availableHeight });

    // If there is a child with "grow", give it max height
    const growChildHeight = this.findGrowChild() ? availableHeight - (this.children.length - 1) * childHeight : 0;

    // Iterate the list of children and call .resize() on each of them
    let currentY = panelY + UI_PADDING;

    for (let child of this.children) {
      if (!child.resize) {
        continue;
      }

      if (child.grow) {
        child.resize(panelX, currentY, panelWidth, growChildHeight, UI_RADIUS);
        currentY += growChildHeight + UI_PADDING;
      } else {
        child.resize(panelX + UI_PADDING, currentY, childWidth, childHeight, UI_RADIUS);
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
