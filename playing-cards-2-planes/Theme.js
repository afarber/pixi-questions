/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Rectangle } from 'pixi.js';

// Table gradient colors - darker at top (farther), lighter at bottom (closer)
export const TABLE_COLOR_TOP = '#1A3D0A';
export const TABLE_COLOR_MID = '#2D5016';
export const TABLE_COLOR_BOTTOM = '#8BC34A';

// App background color (matches mid-gradient)
export const APP_BACKGROUND = TABLE_COLOR_MID;

// Base dimension - card area is a 1:1 square
export const CARD_AREA_SIZE = 720;

// GUI panel size (space for avatars, scores, etc.)
export const GUI_AREA_SIZE = 280;

// Derived: Total app dimensions
const APP_LONG_SIDE = CARD_AREA_SIZE + 2 * GUI_AREA_SIZE;
const APP_SHORT_SIDE = CARD_AREA_SIZE;

// Landscape layout (16:9) - GUI on left/right
export const APP_BOUNDS_LANDSCAPE = new Rectangle(0, 0, APP_LONG_SIDE, APP_SHORT_SIDE);

// Portrait layout (9:16) - GUI on top/bottom
export const APP_BOUNDS_PORTRAIT = new Rectangle(0, 0, APP_SHORT_SIDE, APP_LONG_SIDE);

// User component dimensions
export const USER_SIZE = 240;
export const USER_AVATAR_SIZE = 200;
export const USER_LABEL_HEIGHT = 40;

// User font sizes
export const USER_FONT_SIZE_NAME = 16;
export const USER_FONT_SIZE_LABEL = 20;

// User colors
export const USER_BACKGROUND_COLOR = 0xFFFFFF;
export const USER_BACKGROUND_ALPHA = 0.9;
export const USER_BORDER_COLOR = 0x888888;
export const USER_TEXT_COLOR = 0x333333;
