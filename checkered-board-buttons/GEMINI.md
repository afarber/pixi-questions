# Project Overview

An interactive PixiJS-based game featuring a checkered board with draggable tiles and responsive UI panels. The application demonstrates modern web game development with smooth animations, drag-and-drop functionality, audio feedback, and localization support for multiple languages.

# Usage Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run test` - Run tests with vitest
- `npm run test:ui` - Run tests with vitest UI
- `npm run test:run` - Run tests with vitest and exit

# Key Classes

- **`main.js`**: The main entry point of the application. It initializes the PixiJS application, loads assets, and sets up the layout.
- **`Board.js`**: Creates the 8x8 checkered game board.
- **`Tile.js`**: Represents the draggable tiles on the board.
- **`MyButton.js`**: A custom, animatable button component.
- **`MyList.js`**: A scrollable list component used to display game data.
- **`MyLayoutManager.js`**: Manages the three-column layout and handles responsive resizing.
- **`MyVerticalPanel.js`**: A layout container that arranges its children vertically.
- **`MyConfirmDialog.js`**: A modal dialog for user confirmations.
- **`MySwapDialog.js`**: A modal dialog for swapping tiles, featuring checkboxes.
- **`TestData.js`**: Provides mock data for the game list.
- **`Theme.js`**: Defines the visual theme and UI constants.
- **`vite-plugin-localize.js`**: A custom Vite plugin to handle localization by replacing placeholders in the code with translated strings.
- **`locales/`**: Directory containing language files (`en.js`, `de.js`, `fr.js`) for localization.

# Tests

- **`tests/Board.test.js`**: Tests the board creation, including the checkered pattern and resizing logic.
- **`tests/MyButton.test.js`**: Tests the button creation, animations, and state management.
- **`tests/MyList.test.js`**: Tests the game list creation, scrolling, and game categorization.
- **`tests/MyVerticalPanel.test.js`**: Tests the vertical layout panel and its resizing logic.
- **`tests/Tile.test.js`**: Tests tile creation, positioning, and drag-and-drop setup.

