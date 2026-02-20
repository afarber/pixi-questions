/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, FillGradient, Graphics, Sprite, Text } from 'pixi.js';
import { toTextureKey } from './cardKey.js';

const CARD_W = 94;
const CARD_H = 132;
const TABLE_COLOR_TOP = '#1A3D0A';
const TABLE_COLOR_MID = '#2D5016';
const TABLE_COLOR_BOTTOM = '#8BC34A';
const JACK_SUIT_PRIORITY = {
  c: { priority: 10, next: 's' },
  s: { priority: 20, next: 'h' },
  h: { priority: 30, next: 'd' },
  d: { priority: 40, next: 'c' }
};

const TRUMP_RANK_PRIORITY = {
  j: { priority: -200 },
  a: { priority: 0 },
  t: { priority: 1 },
  k: { priority: 2 },
  q: { priority: 3 },
  '9': { priority: 4 },
  '8': { priority: 5 },
  '7': { priority: 6 }
};

const NULL_RANK_PRIORITY = {
  a: { priority: 0 },
  k: { priority: 1 },
  q: { priority: 2 },
  j: { priority: 3 },
  t: { priority: 4 },
  '9': { priority: 5 },
  '8': { priority: 6 },
  '7': { priority: 7 }
};

/**
 * Pixi rendering surface for table, avatars, hand cards and turn/trick feedback.
 */
export class TableScene {
  /**
   * @param {import('pixi.js').Application} app - Pixi app instance.
   * @param {object} cardSheet - Loaded card atlas.
   * @param {object} avatarSheet - Loaded avatar atlas.
   * @param {Function} onAction - Callback for user card actions.
   */
  constructor(app, cardSheet, avatarSheet, onAction) {
    this.app = app;
    this.cardSheet = cardSheet;
    this.avatarSheet = avatarSheet;
    this.onAction = onAction;

    this.root = new Container();
    app.stage.addChild(this.root);

    this.bg = new Graphics();
    this.root.addChild(this.bg);

    this.scoreText = new Text({ text: '', style: { fontSize: 36, fill: 0xffffff, fontWeight: '700' } });
    this.scoreText.anchor.set(0.5, 0);
    this.root.addChild(this.scoreText);

    this.scoreRows = new Text({ text: '', style: { fontSize: 32, fill: 0xffffff, fontWeight: '600' } });
    this.scoreRows.anchor.set(0.5, 0);
    this.root.addChild(this.scoreRows);

    this.bidHistoryText = new Text({ text: '', style: { fontSize: 22, fill: 0xffdeaa, fontWeight: '600' } });
    this.bidHistoryText.anchor.set(0.5, 0);
    this.root.addChild(this.bidHistoryText);

    this.playHistoryText = new Text({ text: '', style: { fontSize: 22, fill: 0xb9dcff, fontWeight: '600' } });
    this.playHistoryText.anchor.set(0.5, 0);
    this.root.addChild(this.playHistoryText);

    this.playersLayer = new Container();
    this.tableLayer = new Container();
    this.handLayer = new Container();
    this.root.addChild(this.playersLayer, this.tableLayer, this.handLayer);

    this.lastSnapshot = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Recomputes static UI anchors when viewport changes.
   */
  resize() {
    this.w = this.app.screen.width;
    this.h = this.app.screen.height;

    this.bg.clear();
    const gradient = new FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops: [
        { offset: 0, color: TABLE_COLOR_TOP },
        { offset: 0.3, color: TABLE_COLOR_MID },
        { offset: 1, color: TABLE_COLOR_BOTTOM }
      ],
      textureSpace: 'local'
    });
    this.bg.rect(0, 0, this.w, this.h).fill(gradient);

    this.scoreText.x = this.w / 2;
    this.scoreText.y = 16;
    this.scoreRows.x = this.w / 2;
    this.scoreRows.y = 64;
    this.bidHistoryText.x = this.w / 2;
    this.bidHistoryText.y = 220;
    this.playHistoryText.x = this.w / 2;
    this.playHistoryText.y = 360;
  }

  /**
   * Renders the complete frame from a snapshot.
   * @param {object} snapshot - Engine snapshot.
   */
  render(snapshot) {
    this.lastSnapshot = snapshot;
    this.playersLayer.removeChildren();
    this.tableLayer.removeChildren();
    this.handLayer.removeChildren();

    this.scoreText.text = `___ROUND___ ${Math.min(snapshot.round, 3)}/3`;
    this.scoreRows.text = `Du  ${snapshot.score.Du ?? 0}\nSarah  ${snapshot.score.Sarah ?? 0}\nSimon  ${snapshot.score.Simon ?? 0}`;
    this.bidHistoryText.text = snapshot.bidHistory.length ? snapshot.bidHistory.join('\n') : '___BIDDING_STARTS___';
    this.playHistoryText.text = snapshot.playHistory.length ? snapshot.playHistory.join('\n') : '___TRICK_PHASE_STARTS___';

    this.renderAvatars(snapshot);
    this.renderTableCards(snapshot);
    this.renderHands(snapshot);
  }

  /**
   * Draws all avatar panels including turn/winner highlighting.
   * @param {object} snapshot - Engine snapshot.
   */
  renderAvatars(snapshot) {
    const left = this.makeAvatar('Sarah', 'king1', 24, 24, snapshot);
    const right = this.makeAvatar('Simon', 'king2', this.w - 170, 24, snapshot);
    const me = this.makeAvatar('Du', 'king3', this.w / 2 - 80, this.h - 118, snapshot);

    if (snapshot.currentPlayerId === 'Sarah') {
      left.alpha = 1;
      right.alpha = 0.8;
      me.alpha = 0.8;
    } else if (snapshot.currentPlayerId === 'Simon') {
      right.alpha = 1;
      left.alpha = 0.8;
      me.alpha = 0.8;
    } else {
      me.alpha = 1;
      left.alpha = 0.8;
      right.alpha = 0.8;
    }

    this.playersLayer.addChild(left, right, me);
  }

  /**
   * Builds one avatar panel with badge and optional emphasis.
   * @param {string} name - Player name.
   * @param {string} textureKey - Avatar texture key.
   * @param {number} x - Panel X.
   * @param {number} y - Panel Y.
   * @param {object} snapshot - Engine snapshot.
   * @returns {Container} Avatar container.
   */
  makeAvatar(name, textureKey, x, y, snapshot) {
    const c = new Container();
    c.x = x;
    c.y = y;

    const isTurn = snapshot.currentPlayerId === name;
    const isTrickWinner = snapshot.trickTakeAnimation?.winnerId === name;
    const box = new Graphics();
    box.roundRect(0, 0, 146, 176, 10).fill({ color: 0x07252a }).stroke({ width: 2, color: 0x123f44 });
    if (isTurn) {
      box.roundRect(-4, -4, 154, 184, 12).stroke({ width: 4, color: 0xe2a04a });
    }
    if (isTrickWinner) {
      box.roundRect(-8, -8, 162, 192, 14).stroke({ width: 5, color: 0x6ec8ff });
    }
    c.addChild(box);

    const avatar = new Sprite(this.avatarSheet.textures[textureKey]);
    avatar.x = 12;
    avatar.y = 8;
    avatar.width = 122;
    avatar.height = 122;
    c.addChild(avatar);

    const label = new Text({ text: name, style: { fontSize: 34, fontWeight: '700', fill: 0xffffff } });
    label.anchor.set(0.5, 0);
    label.x = 73;
    label.y = 134;
    c.addChild(label);

    const tricks = new Text({
      text: `___TRICKS___: ${snapshot.playerTrickCounts?.[name] ?? 0}`,
      style: { fontSize: 18, fontWeight: '700', fill: 0xcfe9ff }
    });
    tricks.anchor.set(0.5, 0);
    tricks.x = 73;
    tricks.y = 164;
    c.addChild(tricks);

    return c;
  }

  /**
   * Renders current trick cards or in-flight trick-take animation cards.
   * @param {object} snapshot - Engine snapshot.
   */
  renderTableCards(snapshot) {
    const anim = snapshot.trickTakeAnimation;
    const sourceCards = anim ? anim.cards : snapshot.tableCards;
    const sourceOwners = anim ? anim.owners : snapshot.tableOwners;
    const count = sourceCards.length;
    const centerX = this.w / 2;
    const centerY = this.h / 2 + 10;
    let progress = 0;
    if (anim) {
      progress = Math.min(1, Math.max(0, (Date.now() - anim.startedAt) / anim.durationMs));
    }
    const winnerTarget = anim ? this.getTrickTarget(anim.winnerId) : null;

    for (let i = 0; i < count; i++) {
      const card = sourceCards[i];
      const key = toTextureKey(card);
      const sprite = new Sprite(this.cardSheet.textures[key]);
      sprite.anchor.set(0.5);
      sprite.width = CARD_W;
      sprite.height = CARD_H;
      const offset = (i - 1) * 120;
      const startX = centerX + offset;
      const startY = centerY;
      // During trick-take phase cards fly from center trick slots towards winner seat.
      if (winnerTarget) {
        sprite.x = startX + (winnerTarget.x - startX) * progress;
        sprite.y = startY + (winnerTarget.y - startY) * progress;
        sprite.alpha = 1 - 0.6 * progress;
        sprite.scale.set(1 - 0.35 * progress);
      } else {
        sprite.x = startX;
        sprite.y = startY;
      }
      this.tableLayer.addChild(sprite);

      const owner = new Text({
        text: sourceOwners[i] ?? '',
        style: { fontSize: 20, fill: 0xffffff, fontWeight: '700' }
      });
      owner.anchor.set(0.5, 0);
      owner.x = sprite.x;
      owner.y = sprite.y + CARD_H / 2 + 8;
      this.tableLayer.addChild(owner);
    }
  }

  /**
   * Returns approximate card collection target point for trick winner animation.
   * @param {string} playerId - Winner id.
   * @returns {{x:number,y:number}} Target point.
   */
  getTrickTarget(playerId) {
    if (playerId === 'Sarah') {
      return { x: 100, y: 200 };
    }
    if (playerId === 'Simon') {
      return { x: this.w - 100, y: 200 };
    }
    return { x: this.w / 2, y: this.h - 130 };
  }

  /**
   * Renders both opponent backs and user hand.
   * @param {object} snapshot - Engine snapshot.
   */
  renderHands(snapshot) {
    const players = Object.fromEntries(snapshot.players.map((p) => [p.id, p]));
    this.renderOpponentHand(players.Sarah?.cards?.length ?? 0, 18, this.h / 2 - 20, 'left');
    this.renderOpponentHand(players.Simon?.cards?.length ?? 0, this.w - 18, this.h / 2 - 20, 'right');
    this.renderMyHand(players.Du?.cards ?? [], snapshot);
  }

  /**
   * Renders opponent card-back stack.
   * @param {number} count - Number of cards.
   * @param {number} x - Stack center X.
   * @param {number} y - Stack center Y.
   * @param {'left'|'right'} side - Side orientation.
   */
  renderOpponentHand(count, x, y, side) {
    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(this.cardSheet.textures['1B']);
      sprite.anchor.set(0.5);
      sprite.width = CARD_W * 0.82;
      sprite.height = CARD_H * 0.82;
      sprite.x = x;
      sprite.y = y - (count * 12) / 2 + i * 12;
      sprite.angle = side === 'left' ? 90 : -90;
      this.handLayer.addChild(sprite);
    }
  }

  /**
   * Renders local player's sorted hand with playability/selection cues.
   * @param {object[]} cards - Current hand cards.
   * @param {object} snapshot - Engine snapshot.
   */
  renderMyHand(cards, snapshot) {
    const sortedCards = this.sortHandCards(cards, snapshot.announce);
    const baseY = this.h - 42;
    const spacing = Math.min(82, Math.max(48, (this.w - 120) / Math.max(sortedCards.length, 1)));
    const startX = this.w / 2 - ((sortedCards.length - 1) * spacing) / 2;

    sortedCards.forEach((card, i) => {
      const key = toTextureKey(card);
      const sprite = new Sprite(this.cardSheet.textures[key]);
      sprite.anchor.set(0.5, 1);
      sprite.width = CARD_W;
      sprite.height = CARD_H;
      sprite.x = startX + i * spacing;
      sprite.y = baseY;
      sprite.alpha = 1;
      sprite.tint = 0xffffff;

      const isPlayable = snapshot.currentPlayableCards.some(
        (c) => c.rankEnum === card.rankEnum && c.suitEnum === card.suitEnum
      );
      const isSelected = snapshot.selectedSkatDiscard.some(
        (c) => c.rankEnum === card.rankEnum && c.suitEnum === card.suitEnum
      );

      if (snapshot.state === 'CARD_PLAY') {
        if (!isPlayable) {
          sprite.tint = 0x6f6f6f;
        }
        if (isPlayable && snapshot.currentPlayerId === 'Du') {
          sprite.eventMode = 'static';
          sprite.cursor = 'pointer';
          sprite.on('pointerdown', () => this.onAction({ type: 'PLAY_CARD', card }));
        }
      } else if (snapshot.state === 'SKAT_TAKE' && snapshot.currentPlayerId === 'Du') {
        sprite.y = isSelected ? baseY - 28 : baseY;
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => this.onAction({ type: 'TOGGLE_SKAT_CARD', card }));
      }

      this.handLayer.addChild(sprite);
    });
  }

  /**
   * Returns suit grouping order map used by original Skat hand sorting flow.
   * @param {string|null} announce - Current announce.
   * @returns {object} Suit ordering map.
   */
  getMapCardSuitPriority(announce) {
    switch (announce) {
    case 'clubs':
      return {
        c: { priority: 10, next: 'h' },
        h: { priority: 20, next: 's' },
        s: { priority: 30, next: 'd' },
        d: { priority: 40, next: 'c' }
      };
    case 'spades':
      return {
        s: { priority: 10, next: 'h' },
        h: { priority: 20, next: 'c' },
        c: { priority: 30, next: 'd' },
        d: { priority: 40, next: 's' }
      };
    case 'hearts':
      return {
        h: { priority: 10, next: 'c' },
        c: { priority: 20, next: 'd' },
        d: { priority: 30, next: 's' },
        s: { priority: 40, next: 'h' }
      };
    case 'diamonds':
      return {
        d: { priority: 10, next: 'c' },
        c: { priority: 20, next: 'h' },
        h: { priority: 30, next: 's' },
        s: { priority: 40, next: 'd' }
      };
    default:
      return {
        c: { priority: 10, next: 'h' },
        h: { priority: 20, next: 's' },
        s: { priority: 30, next: 'd' },
        d: { priority: 40, next: 'c' }
      };
    }
  }

  /**
   * Compares two cards by announce-dependent rank ordering.
   * @param {object} a - First card.
   * @param {object} b - Second card.
   * @param {string|null} announce - Current announce.
   * @returns {number} Comparator delta.
   */
  cardCompareByRank(a, b, announce) {
    const rankA = String.fromCharCode(a.rankEnum);
    const rankB = String.fromCharCode(b.rankEnum);
    const map = announce === 'null' ? NULL_RANK_PRIORITY : TRUMP_RANK_PRIORITY;
    return map[rankA].priority - map[rankB].priority;
  }

  /**
   * Sorts hand cards with original-like grouping: rank, suit groups, and jack special order.
   * @param {object[]} cards - Unsorted cards.
   * @param {string|null} announce - Current announce.
   * @returns {object[]} Sorted copy.
   */
  sortHandCards(cards, announce) {
    const suitPriority = this.getMapCardSuitPriority(announce);
    return [...cards].sort((a, b) => {
      const rankDelta = -this.cardCompareByRank(a, b, announce);
      const suitA = String.fromCharCode(a.suitEnum);
      const suitB = String.fromCharCode(b.suitEnum);

      const mapA = String.fromCharCode(a.rankEnum) === 'j' && announce !== 'null' ? JACK_SUIT_PRIORITY : suitPriority;
      const mapB = String.fromCharCode(b.rankEnum) === 'j' && announce !== 'null' ? JACK_SUIT_PRIORITY : suitPriority;

      let prioA = mapA[suitA].priority;
      let prioB = mapB[suitB].priority;
      const nextA = mapA[suitA].next;
      const nextB = mapB[suitB].next;
      const nextPrioA = mapA[nextA].priority;
      const nextPrioB = mapB[nextB].priority;

      if (nextPrioA < 0) {
        prioA = Math.abs(nextPrioA);
      }
      if (nextPrioB < 0) {
        prioB = Math.abs(nextPrioB);
      }
      return -rankDelta + (prioA - prioB);
    });
  }
}
