import { UI_HEIGHT, UI_WIDTH, UI_RADIUS, UI_PADDING } from "./Theme";

// A class for placing and resizing Pixi Containers.
// They are placed vertically by calling resize() method.
// A Container with "grow" property is given max height.

export class MyVerticalPanel {
  constructor() {
    this.children = [];
  }

  // add a child element
  addElement(child) {
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
    if (panelWidth <= 0 || panelHeight <= 0 || this.children.length === 0) {
      console.log("MyVerticalPanel.resize called with invalid params");
      return;
    }

    const childWidth = panelWidth - 2 * UI_PADDING;

    // Calculate the height available for children
    const availableHeight = panelHeight - 2 * UI_PADDING;

    // Determine height available to each child (childHeight) by dividing the availableHeight by (number of children + UI_PADDING#s between them). clamp it at UI_HEIGHT
    const paddingCount = Math.max(0, this.children.length - 1);
    const totalPaddingHeight = paddingCount * UI_PADDING;
    let childHeight = Math.min(
      UI_HEIGHT,
      (availableHeight - totalPaddingHeight) / this.children.length
    );

    // Find a child with "grow" set, there can be 0 or 1 of those
    const growChild = this.findGrowChild();

    // If a child has "grow", give it max Height and place it without the UI_PADDING left and right (that is its width will be panelWidth)
    let maxChildHeight = 0;
    if (growChild) {
      const regularChildrenCount = this.children.length - 1;
      const regularChildrenHeight = regularChildrenCount * childHeight;
      maxChildHeight =
        availableHeight - regularChildrenHeight - totalPaddingHeight;
    }

    // Iterate the list of children and call .resize() on each of them
    let currentY = panelY + UI_PADDING;

    for (let child of this.children) {
      if (child.resize) {
        if (child.grow === true) {
          // For the child with "grow" true the call is a bit different: .resize(panelX, y, panelWidth, maxChildHeight, UI_RADIUS)
          child.resize(panelX, currentY, panelWidth, maxChildHeight, UI_RADIUS);
          currentY += maxChildHeight;
        } else {
          child.resize(
            panelX + UI_PADDING,
            currentY,
            childWidth,
            childHeight,
            UI_RADIUS
          );
          currentY += childHeight;
        }

        // Add padding between children (except after the last one)
        if (child !== this.children[this.children.length - 1]) {
          currentY += UI_PADDING;
        }
      }

      // Handle show/hide animations if applicable
      if (child.hide && child.show) {
        child.hide(false);
        child.show(true, 50);
      }
    }
  }
}
