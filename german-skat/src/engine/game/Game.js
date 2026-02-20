/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Announce } from './Announce.js';
import { Bid } from './Bid.js';
import { Deck } from './Deck.js';
import { Player } from './Player.js';
import { Table } from './Table.js';
import { BidderType, BidType } from '../utils/enums.js';
import { GameDefs } from '../utils/GameDefs.js';
import { ScoreCalculator } from '../utils/ScoreCalculator.js';

export class Game {
  constructor(playerIds) {
    this.players = playerIds.map((id, idx) => new Player(id, `team${idx + 1}`, id !== 'Du'));
    this.playerScores = Object.fromEntries(playerIds.map((id) => [id, 0]));
    this.playerTricks = Object.fromEntries(playerIds.map((id) => [id, []]));
    this.currentRound = 1;
    this.dealerIndex = Math.floor(Math.random() * this.players.length);
    this.setAllPlayersRoles(this.dealerIndex);
    this.resetRoundData();
  }

  resetRoundData() {
    this.deck = new Deck();
    this.deck.shuffle();
    this.bid = new Bid();
    this.announce = new Announce();
    this.table = new Table();
    this.skatCards = [];
    this.tricksCounter = 0;
    this.declarerIndex = -1;
    this.currentPlayerIndex = this.nextIdx(this.dealerIndex);
    for (const p of this.players) {
      p.reset();
      this.playerTricks[p.id] = [];
    }
  }

  setAllPlayersRoles(dealerIndex) {
    const forehand = this.nextIdx(dealerIndex);
    const middlehand = this.nextIdx(forehand);
    const rearhand = dealerIndex;
    this.players[forehand].BidderType = BidderType.FOREHAND;
    this.players[middlehand].BidderType = BidderType.MIDDLEHAND;
    this.players[rearhand].BidderType = BidderType.REARHAND;
    this.bidderIndex = forehand;
    this.answererIndex = middlehand;
  }

  nextIdx(idx) {
    return idx + 1 > this.players.length - 1 ? 0 : idx + 1;
  }

  get allPlayers() { return this.players; }
  get DeclarerId() { return this.declarerIndex === -1 ? null : this.players[this.declarerIndex].id; }
  get BidderId() { return this.players[this.bidderIndex].id; }
  get AnswererId() { return this.players[this.answererIndex].id; }

  getCurrentPlayer() { return this.players[this.currentPlayerIndex]; }
  advancePlayerIndex() { this.currentPlayerIndex = this.nextIdx(this.currentPlayerIndex); }
  setCurrentPlayerById(id) {
    const idx = this.players.findIndex((p) => p.id === id);
    if (idx >= 0) {
      this.currentPlayerIndex = idx;
    }
  }

  getBid() { return this.bid; }
  getAnnounce() { return this.announce; }
  getTable() { return this.table; }
  getCurrentRound() { return this.currentRound; }
  getTrickCounter() { return this.tricksCounter; }
  getPlayerTricks(id) { return this.playerTricks[id] || []; }
  getTotalPlayerScores() { return this.playerScores; }
  getPlayerById(id) { return this.players.find((p) => p.id === id); }

  deal() {
    const start = this.nextIdx(this.dealerIndex);
    for (let i = 0; i < 3; i++) {
      const player = this.players[(start + i) % 3];
      for (let k = 0; k < 10; k++) {
        player.putCard(this.deck.drawTopCard());
      }
    }
    this.skatCards = [this.deck.drawTopCard(), this.deck.drawTopCard()];
  }

  applyBid(bidAction) {
    this.bid.setBid(this.getCurrentPlayer(), bidAction);
  }

  finalizeDeclarer(activeBidderIds) {
    const top = this.bid.TopBidder;
    let declarerId = top?.id || activeBidderIds[0] || this.players[this.nextIdx(this.dealerIndex)].id;
    if (this.bid.Type === BidType.PASS && !top) {
      declarerId = null;
    }
    this.declarerIndex = declarerId ? this.players.findIndex((p) => p.id === declarerId) : -1;
  }

  applyCardMove(card) {
    const player = this.getCurrentPlayer();
    player.removeCard(card);
    this.table.addCard(player.id, card);
  }

  getCurrentTrick() {
    return {
      cards: [...this.table.getCards()],
      ownerId: this.table.MajorCardOwner
    };
  }

  getTrickOwner() {
    return this.table.getCards().length === GameDefs.TOTAL_NUM_CARDS_IN_TRICK ? this.table.MajorCardOwner : null;
  }

  takeTrick() {
    const owner = this.getTrickOwner();
    this.playerTricks[owner].push({ cards: [...this.table.getCards()] });
    this.table.clear();
    this.tricksCounter++;
  }

  finishRound() {
    const roundScore = ScoreCalculator.calculateCurrentRoundScore(this);
    for (const p of this.players) {
      this.playerScores[p.id] += roundScore[p.id];
    }
    this.currentRound++;
    this.dealerIndex = this.nextIdx(this.dealerIndex);
    this.setAllPlayersRoles(this.dealerIndex);
  }
}
