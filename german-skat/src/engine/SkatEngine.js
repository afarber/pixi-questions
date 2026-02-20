/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Game } from './game/Game.js';
import { State } from './utils/enums.js';
import { CardPlayController } from './state/CardPlayController.js';
import { AnnounceController } from './state/AnnounceController.js';
import { BidController } from './state/BidController.js';
import { DealController } from './state/DealController.js';
import { GameEndController } from './state/GameEndController.js';
import { GameInitController } from './state/GameInitController.js';
import { RoundEndController } from './state/RoundEndController.js';
import { RoundStartController } from './state/RoundStartController.js';
import { ShouldTakeSkatController } from './state/ShouldTakeSkatController.js';
import { SkatTakeController } from './state/SkatTakeController.js';
import { TakeTrickController } from './state/TakeTrickController.js';

/**
 * Central game coordinator that owns the state machine and emits immutable snapshots to the UI.
 */
export class SkatEngine {
  /**
   * Builds initial engine state for a 3-player local game.
   */
  constructor() {
    this.listeners = new Set();
    this.game = new Game(['Du', 'Sarah', 'Simon']);
    this.stateController = null;
    this.state = State.GAME_INIT;
    this.currentPrompt = null;
    this.currentPlayableCards = [];
    this.selectedSkatDiscard = [];
    this.bidHistory = [];
    this.playHistory = [];
    this.lastPlayedEvent = null;
    this.lastTrickWinnerId = null;
    this.trickTakeAnimation = null;
  }

  /**
   * Starts the game from GAME_INIT.
   */
  startGame() {
    this.transition(State.GAME_INIT);
  }

  /**
   * Recreates all game data and restarts from GAME_INIT.
   */
  restart() {
    this.game = new Game(['Du', 'Sarah', 'Simon']);
    this.selectedSkatDiscard = [];
    this.bidHistory = [];
    this.playHistory = [];
    this.lastPlayedEvent = null;
    this.lastTrickWinnerId = null;
    this.trickTakeAnimation = null;
    this.transition(State.GAME_INIT);
  }

  /**
   * Transitions to another controller state and emits fresh UI data.
   * @param {string} nextState - One of the State enum values.
   */
  transition(nextState) {
    if (this.stateController) {
      this.stateController.destroy();
    }
    this.currentPrompt = null;
    this.state = nextState;
    switch (nextState) {
    case State.GAME_INIT:
      this.stateController = new GameInitController(this);
      break;
    case State.ROUND_START:
      this.stateController = new RoundStartController(this);
      break;
    case State.DEAL:
      this.stateController = new DealController(this);
      break;
    case State.BID:
      this.stateController = new BidController(this);
      break;
    case State.SHOULD_TAKE_SKAT:
      this.stateController = new ShouldTakeSkatController(this);
      break;
    case State.SKAT_TAKE:
      this.selectedSkatDiscard = [];
      this.stateController = new SkatTakeController(this);
      break;
    case State.ANNOUNCE:
      this.stateController = new AnnounceController(this);
      break;
    case State.CARD_PLAY:
      this.stateController = new CardPlayController(this);
      break;
    case State.TAKE_TRICK:
      this.stateController = new TakeTrickController(this);
      break;
    case State.ROUND_END:
      this.stateController = new RoundEndController(this);
      break;
    case State.GAME_END:
      this.stateController = new GameEndController(this);
      break;
    default:
      throw new Error(`Unsupported state ${nextState}`);
    }
    this.stateController.start();
    this.emit();
  }

  /**
   * Sets the currently visible action prompt.
   * @param {object} prompt - Prompt descriptor consumed by PromptOverlay.
   */
  requestAction(prompt) {
    this.currentPrompt = prompt;
    this.emit();
  }

  /**
   * Clears the currently visible prompt.
   */
  clearPrompt() {
    if (!this.currentPrompt) {
      return;
    }
    this.currentPrompt = null;
    this.emit();
  }

  /**
   * Appends a bidding status line for user-visible game flow.
   * @param {string} text - Human-readable bid message.
   */
  pushBidHistory(text) {
    this.bidHistory.push(text);
    if (this.bidHistory.length > 8) {
      this.bidHistory.shift();
    }
    this.emit();
  }

  /**
   * Appends a play/trick status line for user-visible game flow.
   * @param {string} text - Human-readable play message.
   */
  pushPlayHistory(text) {
    this.playHistory.push(text);
    if (this.playHistory.length > 8) {
      this.playHistory.shift();
    }
    this.emit();
  }

  /**
   * Stores the latest play event for turn-by-turn UX signals.
   * @param {string} playerId - Actor id.
   * @param {object} card - Card model played.
   */
  pushPlayEvent(playerId, card) {
    this.lastPlayedEvent = {
      playerId,
      card,
      at: Date.now()
    };
    this.emit();
  }

  /**
   * Starts an in-progress trick take animation descriptor.
   * @param {string} winnerId - Trick winner id.
   * @param {object[]} cards - Trick cards.
   * @param {string[]} owners - Owners in card order.
   * @param {number} durationMs - Animation duration.
   */
  setTrickTakeAnimation(winnerId, cards, owners, durationMs) {
    this.lastTrickWinnerId = winnerId;
    this.trickTakeAnimation = {
      winnerId,
      cards,
      owners,
      startedAt: Date.now(),
      durationMs
    };
    this.emit();
  }

  /**
   * Clears the current trick take animation descriptor.
   */
  clearTrickTakeAnimation() {
    this.trickTakeAnimation = null;
    this.emit();
  }

  /**
   * Resets bid history for a new round.
   */
  clearBidHistory() {
    this.bidHistory = [];
    this.emit();
  }

  /**
   * Resets play history for a new round.
   */
  clearPlayHistory() {
    this.playHistory = [];
    this.emit();
  }

  /**
   * Handles all user-triggered actions from UI.
   * @param {object} action - Action payload.
   */
  dispatchPlayerAction(action) {
    if (this.state === State.SKAT_TAKE && action?.type === 'TOGGLE_SKAT_CARD') {
      this.toggleSkatCard(action.card);
      return;
    }
    if (this.state === State.SKAT_TAKE && action?.type === 'CONFIRM_SKAT_DISCARD') {
      if (this.selectedSkatDiscard.length === 2) {
        this.stateController.onPlayerAction({ type: 'SKAT_DISCARD', cards: [...this.selectedSkatDiscard] });
      }
      return;
    }
    this.currentPrompt = null;
    this.stateController.onPlayerAction(action);
    this.emit();
  }

  /**
   * Toggles a card in the temporary skat-discard selection.
   * @param {object} card - Card model.
   */
  toggleSkatCard(card) {
    const idx = this.selectedSkatDiscard.findIndex((c) => c.rankEnum === card.rankEnum && c.suitEnum === card.suitEnum);
    if (idx >= 0) {
      this.selectedSkatDiscard.splice(idx, 1);
    } else if (this.selectedSkatDiscard.length < 2) {
      this.selectedSkatDiscard.push(card);
    }
    this.emit();
  }

  /**
   * Subscribes to state updates.
   * @param {Function} listener - Callback that receives snapshots.
   * @returns {Function} Unsubscribe callback.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  /**
   * Creates a shallow immutable snapshot for rendering.
   * @returns {object} Render snapshot.
   */
  snapshot() {
    const players = this.game.allPlayers.map((p) => ({
      id: p.id,
      bot: p.bot,
      cards: [...p.getCards()]
    }));

    return {
      state: this.state,
      prompt: this.currentPrompt,
      currentPlayableCards: this.currentPlayableCards,
      selectedSkatDiscard: this.selectedSkatDiscard,
      round: this.game.getCurrentRound(),
      players,
      currentPlayerId: this.game.getCurrentPlayer()?.id,
      declarerId: this.game.DeclarerId,
      announce: this.game.getAnnounce().Type,
      bid: this.game.getBid().Value,
      tableCards: [...this.game.getTable().getCards()],
      tableOwners: [...this.game.getTable().cardOwners],
      score: { ...this.game.getTotalPlayerScores() },
      bidHistory: [...this.bidHistory],
      playHistory: [...this.playHistory],
      lastPlayedEvent: this.lastPlayedEvent,
      lastTrickWinnerId: this.lastTrickWinnerId,
      trickTakeAnimation: this.trickTakeAnimation,
      playerTrickCounts: Object.fromEntries(this.game.allPlayers.map((p) => [p.id, this.game.getPlayerTricks(p.id).length]))
    };
  }

  /**
   * Broadcasts a new snapshot to all subscribers.
   */
  emit() {
    const snap = this.snapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }
}
