import { UI_HEIGHT, UI_WIDTH, UI_RADIUS, UI_PADDING } from "./Theme";

export class Layout {
  constructor() {
    this.leftElements = [];
    this.rightElements = [];
    this.centerElement = null;
  }

  // Add UI element to left panel
  addLeft(element, options = {}) {
    this.leftElements.push({ element, options });
    return this;
  }

  // Add UI element to right panel
  addRight(element, options = {}) {
    this.rightElements.push({ element, options });
    return this;
  }

  // Set the center element (game board)
  setCenter(element) {
    this.centerElement = element;
    return this;
  }

  // Update layout when window is resized
  resize(screenWidth, screenHeight) {
    // Calculate the height available for buttons
    const availableHeight = screenHeight - 2 * UI_PADDING;

    // Calculate left panel
    const leftX = 2 * UI_PADDING + UI_WIDTH / 2;
    this._layoutPanel(
      this.leftElements,
      leftX,
      availableHeight,
      UI_PADDING,
      UI_WIDTH
    );

    // Calculate right panel
    const rightX = screenWidth - leftX;
    this._layoutPanel(
      this.rightElements,
      rightX,
      availableHeight,
      UI_PADDING,
      UI_WIDTH
    );

    // Position the center element
    if (this.centerElement) {
      const boardWidth = screenWidth - 2 * UI_WIDTH - 8 * UI_PADDING;
      this.centerElement.resize(boardWidth, screenHeight);
    }
  }

  _layoutPanel(elements, xPosition, availableHeight, startY, width) {
    if (elements.length === 0) return;

    // Calculate spacing based on the number of elements
    const totalElementHeights = elements.reduce((sum, item) => {
      return sum + (item.options.height || UI_HEIGHT);
    }, 0);

    // Calculate padding between elements
    const spacing = Math.max(
      0,
      (availableHeight - totalElementHeights) / (elements.length - 1)
    );

    // Position each element
    let currentY = startY + UI_HEIGHT / 2;

    elements.forEach(({ element, options }) => {
      const height = options.height || UI_HEIGHT;

      // Set position
      element.x = xPosition;
      element.y = currentY;

      // special handling for the list component, without the anchor=0.5
      if (!element.anchor) {
        element.x -= UI_WIDTH / 2 - UI_PADDING;
      }

      /*
      // Special handling for the list component
      gamesList.resize(
        UI_WIDTH + 2 * UI_PADDING,
        app.screen.height -
          2 * UI_PADDING -
          5 * UI_HEIGHT -
          ((app.screen.height - 2 * UI_PADDING - RIGHT_BUTTONS_NUM * UI_HEIGHT) /
            (RIGHT_BUTTONS_NUM - 1)) *
            4
      );
      */

      // Resize the element
      if (element.resize) {
        element.resize(width, height, UI_RADIUS);
      }

      // Handle show/hide animations if applicable
      if (element.hide && element.show) {
        element.hide(false);
        element.show(true, options.delay || 50);
      }

      // Update y for next element
      currentY += height + spacing;
    });
  }
}
