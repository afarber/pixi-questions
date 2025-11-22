/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

// Current timestamp (to use as reference)
const now = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000; // One day in milliseconds

export const games = [
  // Game 1: Active game, player 1's turn (recently played)
  {
    id: 1,
    finished: 0,
    played1: now - 3 * ONE_DAY, // Player 1 played 3 days ago
    played2: now - 2 * ONE_DAY // Player 2 played 2 days ago (so it's player 1's turn)
  },

  // Game 2: Active game, player 2's turn (recently started)
  {
    id: 2,
    finished: 0,
    played1: now - 4 * 60 * 60 * 1000, // Player 1 played 4 hours ago
    played2: 0 // Player 2 hasn't played yet
  },

  // Game 3: Active game, player 1's turn (longer game)
  {
    id: 3,
    finished: 0,
    played1: now - 14 * ONE_DAY, // Player 1 played 14 days ago
    played2: now - 7 * ONE_DAY // Player 2 played a week ago
  },

  // Game 4: Active game, player 2's turn (recently played)
  {
    id: 4,
    finished: 0,
    played1: now - 1 * ONE_DAY, // Player 1 played yesterday
    played2: now - 3 * 60 * 60 * 1000 // Player 2 played 3 hours ago
  },

  // Game 5: Finished game (recently)
  {
    id: 5,
    finished: now - 12 * 60 * 60 * 1000, // Finished 12 hours ago
    played1: now - 2 * ONE_DAY,
    played2: now - 2 * ONE_DAY
  },

  // Game 6: Finished game (a while ago)
  {
    id: 6,
    finished: now - 30 * ONE_DAY, // Finished a month ago
    played1: now - 31 * ONE_DAY,
    played2: now - 32 * ONE_DAY
  },

  // Game 7: Active game, player 1's turn (new game)
  {
    id: 7,
    finished: 0,
    played1: 0, // Player 1 hasn't played yet
    played2: 0 // Player 2 hasn't played yet (defaults to player 1's turn)
  },

  // Game 8: Active game, player 2's turn (competitive)
  {
    id: 8,
    finished: 0,
    played1: now - 30 * 60 * 1000, // Player 1 played 30 minutes ago
    played2: now - 45 * 60 * 1000 // Player 2 played 45 minutes ago
  },

  // Game 9: Finished game (older)
  {
    id: 9,
    finished: now - 60 * ONE_DAY, // Finished 2 months ago
    played1: now - 62 * ONE_DAY,
    played2: now - 61 * ONE_DAY
  },

  // Game 10: Active game, player 1's turn (slow game)
  {
    id: 10,
    finished: 0,
    played1: now - 45 * ONE_DAY, // Player 1 played 45 days ago
    played2: now - 20 * ONE_DAY // Player 2 played 20 days ago
  }
];
