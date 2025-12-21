/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Rectangle } from "pixi.js";

// Table gradient colors - darker at top (farther), lighter at bottom (closer)
export const TABLE_COLOR_TOP = '#1A3D0A';
export const TABLE_COLOR_MID = '#2D5016';
export const TABLE_COLOR_BOTTOM = '#8BC34A';

// App background color (matches mid-gradient)
export const APP_BACKGROUND = TABLE_COLOR_MID;

// Design resolution for scaling (16:9 aspect ratio)
export const DESIGN_SCREEN = new Rectangle(0, 0, 1600, 900);
