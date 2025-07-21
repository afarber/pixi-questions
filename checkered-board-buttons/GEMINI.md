# Project Overview

An interactive PixiJS-based game featuring a checkered board with draggable tiles and responsive UI panels. The application demonstrates modern web game development with smooth animations, drag-and-drop functionality, and audio feedback.

# Usage Commands

*   `npm run dev` - Start development server with Vite
*   `npm run build` - Build production version
*   `npm run lint` - Run ESLint
*   `npm run preview` - Preview production build
*   `npm run test` - Run tests with vitest
*   `npm run test:ui` - Run tests with vitest UI
*   `npm run test:run` - Run tests with vitest and exit

# Key Classes

*   **`Board.js`**: Creates the 8x8 checkered game board.
*   **`LayoutManager.js`**: Manages the three-column layout and handles responsive resizing.
*   **`MyButton.js`**: A custom, animatable button component.
*   **`MyList.js`**: A scrollable list component used to display game data.
*   **`MyVerticalPanel.js`**: A layout container that arranges its children vertically.
*   **`TestData.js`**: Provides mock data for the game list.
*   **`Theme.js`**: Defines the visual theme and UI constants.
*   **`Tile.js`**: Represents the draggable tiles on the board.

# Tests

*   **`Board.test.js`**: Tests the board creation, including the checkered pattern and resizing logic.
*   **`MyButton.test.js`**: Tests the button creation, animations, and state management.
*   **`MyList.test.js`**: Tests the game list creation, scrolling, and game categorization.
*   **`MyVerticalPanel.test.js`**: Tests the vertical layout panel and its resizing logic.
*   **`Tile.test.js`**: Tests tile creation, positioning, and drag-and-drop setup.