/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { User } from './User.js';

// Create a mock sprite sheet
const createMockSpriteSheet = () => ({
  textures: {
    'king1': { width: 200, height: 200 },
    'king2': { width: 200, height: 200 },
  }
});

describe('User', () => {
  let user;
  let spriteSheet;

  beforeEach(() => {
    user = new User();
    spriteSheet = createMockSpriteSheet();
  });

  describe('setAvatar', () => {
    it('with null textureKey clears existing avatar', () => {
      // First set an avatar
      user.setAvatar(spriteSheet, 'king1');
      expect(user._avatarSprite).not.toBeNull();

      // Then clear it with null textureKey
      user.setAvatar(spriteSheet, null);
      expect(user._avatarSprite).toBeNull();
    });
  });

  describe('updateData', () => {
    it('updates username, bid, and tricks text', () => {
      user.updateData(spriteSheet, {
        username: 'TestPlayer',
        avatarKey: 'king1',
        bid: '6S',
        tricks: '(2)'
      });

      expect(user.username).toBe('TestPlayer');
      expect(user.bid).toBe('6S');
      expect(user.tricks).toBe('(2)');
    });
  });

  describe('property setters', () => {
    it('username setter updates the username text field', () => {
      user.username = 'NewPlayer';
      expect(user.username).toBe('NewPlayer');
    });

    it('bid setter updates the bid text field', () => {
      user.bid = 'Pass';
      expect(user.bid).toBe('Pass');
    });

    it('tricks setter updates the tricks text field', () => {
      user.tricks = '(5)';
      expect(user.tricks).toBe('(5)');
    });
  });
});
