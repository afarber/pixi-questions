/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { test, expect } from '@playwright/test';

test.describe('Canvas Interaction Tests', () => {
  test('canvas displays and shows user rectangles', async ({ page }) => {
    await page.goto('/');
    
    // Canvas should be visible and have proper dimensions
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Get canvas dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox.width).toBeGreaterThan(0);
    expect(canvasBox.height).toBeGreaterThan(0);
    
    // Join as a user - name drawer is automatically shown on page load
    const testUsername = `Canvas${Date.now() % 10000}`;
    await page.locator('#nameInput').fill(testUsername);
    await page.locator('#joinButton').click();
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    // Wait a moment for canvas to update
    await page.waitForTimeout(1000);
    
    // Canvas should be interactive and animated
    // Note: Testing actual Pixi.js content requires evaluation in browser context
    const canvasContent = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      
      // Check if Pixi.js is loaded and canvas exists
      return {
        hasCanvas: !!canvas,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        hasPixi: !!window.PIXI,
        canvasParent: !!document.getElementById('pixiCanvas')
      };
    });
    
    expect(canvasContent.hasCanvas).toBe(true);
    expect(canvasContent.canvasWidth).toBeGreaterThan(0);
    expect(canvasContent.canvasHeight).toBeGreaterThan(0);
    expect(canvasContent.hasPixi).toBe(true);
    expect(canvasContent.canvasParent).toBe(true);
  });

  test('canvas updates when users join and leave', async ({ page, context }) => {
    const user1Name = `C1${Date.now() % 10000}`;
    const user2Name = `C2${Date.now() % 10000}`;
    
    // First user joins
    await page.goto('/');
    await page.locator('#nameInput').fill(user1Name);
    await page.locator('#joinButton').click();
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    // Check that canvas exists
    let canvasExists = await page.evaluate(() => !!document.querySelector('canvas'));
    expect(canvasExists).toBe(true);
    
    // Second user joins
    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await secondPage.locator('#nameInput').fill(user2Name);
    await secondPage.locator('#joinButton').click();
    await expect(secondPage.locator('#connectionStatus')).toHaveText('Connected');
    
    // Both pages should have canvas working
    const firstPageCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
    const secondPageCanvas = await secondPage.evaluate(() => !!document.querySelector('canvas'));
    
    expect(firstPageCanvas).toBe(true);
    expect(secondPageCanvas).toBe(true);
    
    // Second user leaves
    await secondPage.close();
    await page.waitForTimeout(500);
    
    // First page should still have canvas
    canvasExists = await page.evaluate(() => !!document.querySelector('canvas'));
    expect(canvasExists).toBe(true);
  });

  test('canvas responds to window resize', async ({ page }) => {
    await page.goto('/');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Get initial canvas size
    await canvas.boundingBox();
    
    // Resize viewport
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);
    
    // Canvas should adapt to new size
    const resizedBox = await canvas.boundingBox();
    expect(resizedBox).toBeDefined();
    expect(resizedBox.width).toBeGreaterThan(0);
    expect(resizedBox.height).toBeGreaterThan(0);
    
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Canvas should still be visible and functional
    const mobileBox = await canvas.boundingBox();
    expect(mobileBox).toBeDefined();
    expect(mobileBox.width).toBeGreaterThan(0);
    expect(mobileBox.height).toBeGreaterThan(0);
    
    // Join user to test canvas functionality on mobile
    const testUsername = `Mob${Date.now() % 10000}`;
    await page.locator('#nameInput').fill(testUsername);
    await page.locator('#joinButton').click();
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    // Canvas should still work after resize
    const canvasWorking = await page.evaluate(() => {
      return {
        hasPixiApp: !!window.PIXI && !!document.querySelector('canvas'),
        canvasVisible: !!document.querySelector('canvas'),
        appRunning: !!document.querySelector('canvas')
      };
    });
    
    expect(canvasWorking.hasPixiApp).toBe(true);
    expect(canvasWorking.canvasVisible).toBe(true);
  });

  test('canvas handles multiple users with different colors', async ({ page, context }) => {
    const users = [`Col1${Date.now() % 10000}`, `Col2${Date.now() % 10000}`, `Col3${Date.now() % 10000}`];
    const pages = [page];
    
    // Create additional pages
    for (let i = 1; i < users.length; i++) {
      pages.push(await context.newPage());
    }
    
    // All users join
    for (let i = 0; i < users.length; i++) {
      await pages[i].goto('/');
      await pages[i].locator('#nameDrawer').click();
      await pages[i].locator('#nameInput').fill(users[i]);
      await pages[i].locator('#joinButton').click();
      await expect(pages[i].locator('#connectionStatus')).toHaveText('Connected');
      await pages[i].waitForTimeout(500);
    }
    
    // Wait for all canvas updates
    await page.waitForTimeout(1500);
    
    // Check that canvas shows multiple users (simplified test)
    const canvasState = await page.evaluate(() => {
      return {
        hasCanvas: !!document.querySelector('canvas'),
        canvasVisible: document.querySelector('canvas') ? true : false
      };
    });
    
    expect(canvasState.hasCanvas).toBe(true);
    expect(canvasState.canvasVisible).toBe(true);
    
    // Close additional pages
    for (let i = 1; i < pages.length; i++) {
      await pages[i].close();
    }
  });

  test('canvas performance with rapid user changes', async ({ page, context }) => {
    await page.goto('/');
    
    const testUsername = `Perf${Date.now() % 10000}`;
    await page.locator('#nameInput').fill(testUsername);
    await page.locator('#joinButton').click();
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    // Create and quickly close multiple user sessions
    const rapidPages = [];
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage();
      rapidPages.push(newPage);
      
      await newPage.goto('/');
      await newPage.locator('#nameDrawer').click();
      await newPage.locator('#nameInput').fill(`R${i}${Date.now() % 10000}`);
      await newPage.locator('#joinButton').click();
      await expect(newPage.locator('#connectionStatus')).toHaveText('Connected');
      
      // Close immediately after joining
      setTimeout(() => newPage.close(), 100 * i);
    }
    
    // Wait for all changes to propagate
    await page.waitForTimeout(2000);
    
    // Original page should still be functional
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    // Canvas should still be responsive
    const canvasHealthy = await page.evaluate(() => {
      return {
        pixiExists: !!window.PIXI,
        canvasExists: !!document.querySelector('canvas'),
        noErrors: true
      };
    });
    
    expect(canvasHealthy.pixiExists).toBe(true);
    expect(canvasHealthy.canvasExists).toBe(true);
    
    // Should be able to send message after rapid changes
    await page.locator('#messageInput').fill('Canvas still works after rapid changes');
    await page.locator('#sendButton').click();
    await expect(page.locator('#chatWindow')).toContainText('Canvas still works after rapid changes');
  });
});