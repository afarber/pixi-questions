/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

export const SuitEnum = {
  CLUBS: 'c'.charCodeAt(0),
  SPADES: 's'.charCodeAt(0),
  HEARTS: 'h'.charCodeAt(0),
  DIAMONDS: 'd'.charCodeAt(0)
};

export const RankEnum = {
  SEVEN: '7'.charCodeAt(0),
  EIGHT: '8'.charCodeAt(0),
  NINE: '9'.charCodeAt(0),
  TEN: 't'.charCodeAt(0),
  JACK: 'j'.charCodeAt(0),
  QUEEN: 'q'.charCodeAt(0),
  KING: 'k'.charCodeAt(0),
  ACE: 'a'.charCodeAt(0)
};

export const AnnounceType = {
  CLUBS: 'clubs',
  SPADES: 'spades',
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  GRAND: 'grand',
  NULL_GAME: 'null'
};

export const AnnounceBaseValue = {
  CLUBS: 12,
  SPADES: 11,
  HEARTS: 10,
  DIAMONDS: 9,
  GRAND: 24,
  NULL_GAME: 23
};

export const MultiplierType = {
  GAME: 1,
  SCHNEIDER: 2,
  SCHWARZ: 3,
  SCHNEIDER_DECLARED: 4,
  SCHWARZ_DECLARED: 5,
  OUVERT: 6
};

export const BidType = {
  PASS: 'pass',
  VALUE: 'value',
  ANSWER: 'answer'
};

export const BidderType = {
  FOREHAND: 'forehand',
  MIDDLEHAND: 'middlehand',
  REARHAND: 'rearhand'
};

export const State = {
  GAME_INIT: 'GAME_INIT',
  ROUND_START: 'ROUND_START',
  DEAL: 'DEAL',
  BID: 'BID',
  SHOULD_TAKE_SKAT: 'SHOULD_TAKE_SKAT',
  SKAT_TAKE: 'SKAT_TAKE',
  ANNOUNCE: 'ANNOUNCE',
  CARD_PLAY: 'CARD_PLAY',
  TAKE_TRICK: 'TAKE_TRICK',
  ROUND_END: 'ROUND_END',
  GAME_END: 'GAME_END'
};
