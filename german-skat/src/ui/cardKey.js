/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

const RANK_TO_TEX = {
  '7': '7',
  '8': '8',
  '9': '9',
  t: 'T',
  j: 'J',
  q: 'Q',
  k: 'K',
  a: 'A'
};

const SUIT_TO_TEX = {
  c: 'C',
  s: 'S',
  h: 'H',
  d: 'D'
};

export function toTextureKey(card) {
  const rank = String.fromCharCode(card.rankEnum);
  const suit = String.fromCharCode(card.suitEnum);
  return `${RANK_TO_TEX[rank]}${SUIT_TO_TEX[suit]}`;
}
