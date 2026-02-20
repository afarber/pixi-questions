/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

export const GameDefs = {
  CARD_IMAGE_FILE_IDS: [
    '7s', '8s', '9s', 'js', 'qs', 'ks', 'ts', 'as',
    '7d', '8d', '9d', 'jd', 'qd', 'kd', 'td', 'ad',
    '7c', '8c', '9c', 'jc', 'qc', 'kc', 'tc', 'ac',
    '7h', '8h', '9h', 'jh', 'qh', 'kh', 'th', 'ah'
  ],
  trumpGameRankPriorities: {
    j: { priority: -200 },
    a: { priority: 0 },
    t: { priority: 1 },
    k: { priority: 2 },
    q: { priority: 3 },
    '9': { priority: 4 },
    '8': { priority: 5 },
    '7': { priority: 6 }
  },
  nullGameRankPriorities: {
    a: { priority: 0 },
    k: { priority: 1 },
    q: { priority: 2 },
    j: { priority: 3 },
    t: { priority: 4 },
    '9': { priority: 5 },
    '8': { priority: 6 },
    '7': { priority: 7 }
  },
  mapCardRankPriority: {
    j: { priority: -200 },
    a: { priority: 0 },
    t: { priority: 1 },
    k: { priority: 2 },
    q: { priority: 3 },
    '9': { priority: 4 },
    '8': { priority: 5 },
    '7': { priority: 6 }
  },
  mapJacksSuitPriority: {
    c: { priority: 10, next: 's' },
    s: { priority: 20, next: 'h' },
    h: { priority: 30, next: 'd' },
    d: { priority: 40, next: 'c' }
  },
  cardPoints: {
    a: 11,
    t: 10,
    k: 4,
    q: 3,
    j: 2,
    '9': 0,
    '8': 0,
    '7': 0
  },
  ALL_BID_VALUES: [
    18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54,
    55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88, 90, 96, 99, 100, 108,
    110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154,
    156, 160, 162, 165, 168, 170, 176, 180, 187, 192, 198, 204, 216, 240, 264
  ],
  MAX_PLAYERS: 3,
  TOTAL_NUM_TRICKS: 10,
  MIN_PTS_TO_WIN: 61,
  MIN_PTS_FOR_SCHNEIDER: 90,
  TOTAL_NUM_CARDS_IN_TRICK: 3,
  NUM_CARDS_IN_SKAT: 2,
  TOTAL_ROUNDS: 3
};
