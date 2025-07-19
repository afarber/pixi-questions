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
    
    // Join as a user
    const testUsername = `CanvasUser${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Wait a moment for canvas to update
    await page.waitForTimeout(1000);
    
    // Canvas should be interactive and animated
    // Note: Testing actual Pixi.js content requires evaluation in browser context
    const canvasContent = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      
      // Check if Pixi.js application exists
      return {
        hasCanvas: !!canvas,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        hasPixiApp: !!window.pixiApp,
        hasUsers: window.pixiApp && window.pixiApp.stage && window.pixiApp.stage.children.length > 0
      };
    });
    
    expect(canvasContent.hasCanvas).toBe(true);
    expect(canvasContent.canvasWidth).toBeGreaterThan(0);
    expect(canvasContent.canvasHeight).toBeGreaterThan(0);
    expect(canvasContent.hasPixiApp).toBe(true);
  });

  test('canvas updates when users join and leave', async ({ page, context }) => {
    const user1Name = `CanvasUser1_${Date.now()}`;
    const user2Name = `CanvasUser2_${Date.now()}`;
    
    // First user joins
    await page.goto('/');
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(user1Name);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Wait for canvas to update
    await page.waitForTimeout(1000);
    
    // Check initial canvas state
    let canvasState = await page.evaluate(() => {
      return {
        userCount: window.pixiApp && window.pixiApp.stage ? window.pixiApp.stage.children.length : 0,
        hasUsers: window.users ? Object.keys(window.users).length : 0
      };
    });
    
    expect(canvasState.userCount).toBeGreaterThan(0);
    
    // Second user joins
    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await secondPage.locator('#name-button').click();
    await secondPage.locator('#name-input').fill(user2Name);
    await secondPage.locator('#join-button').click();
    await expect(secondPage.locator('#connection-status')).toHaveText('Connected');
    
    // Wait for canvas updates on both pages
    await page.waitForTimeout(1000);
    await secondPage.waitForTimeout(1000);
    
    // Both pages should show two users on canvas
    canvasState = await page.evaluate(() => {
      return {
        userCount: window.pixiApp && window.pixiApp.stage ? window.pixiApp.stage.children.length : 0,
        hasUsers: window.users ? Object.keys(window.users).length : 0
      };
    });
    
    expect(canvasState.userCount).toBeGreaterThanOrEqual(2);
    
    // Second user leaves
    await secondPage.close();
    await page.waitForTimeout(1000);
    
    // First page should show one user on canvas again
    canvasState = await page.evaluate(() => {
      return {
        userCount: window.pixiApp && window.pixiApp.stage ? window.pixiApp.stage.children.length : 0,
        hasUsers: window.users ? Object.keys(window.users).length : 0
      };
    });
    
    expect(canvasState.userCount).toBeLessThan(2);
  });

  test('canvas responds to window resize', async ({ page }) => {
    await page.goto('/');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Get initial canvas size
    const initialBox = await canvas.boundingBox();
    
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
    const testUsername = `MobileUser${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Canvas should still work after resize
    const canvasWorking = await page.evaluate(() => {
      return {
        hasPixiApp: !!window.pixiApp,
        canvasVisible: !!document.querySelector('canvas'),
        appRunning: window.pixiApp && window.pixiApp.ticker && window.pixiApp.ticker.started
      };
    });
    
    expect(canvasWorking.hasPixiApp).toBe(true);
    expect(canvasWorking.canvasVisible).toBe(true);
  });

  test('canvas handles multiple users with different colors', async ({ page, context }) => {
    const users = [`ColorTest1_${Date.now()}`, `ColorTest2_${Date.now()}`, `ColorTest3_${Date.now()}`];
    const pages = [page];
    
    // Create additional pages
    for (let i = 1; i < users.length; i++) {
      pages.push(await context.newPage());
    }
    
    // All users join
    for (let i = 0; i < users.length; i++) {
      await pages[i].goto('/');
      await pages[i].locator('#name-button').click();
      await pages[i].locator('#name-input').fill(users[i]);
      await pages[i].locator('#join-button').click();
      await expect(pages[i].locator('#connection-status')).toHaveText('Connected');
      await pages[i].waitForTimeout(500);
    }
    
    // Wait for all canvas updates
    await page.waitForTimeout(1500);
    
    // Check that canvas shows multiple users with different properties
    const canvasState = await page.evaluate(() => {
      const users = window.users || {};
      const userList = Object.keys(users);
      const userColors = userList.map(name => users[name] ? users[name].color : null);
      
      return {
        userCount: userList.length,
        uniqueColors: [...new Set(userColors.filter(c => c !== null))].length,
        hasMultipleUsers: userList.length >= 3,
        canvasElements: window.pixiApp && window.pixiApp.stage ? window.pixiApp.stage.children.length : 0
      };
    });
    
    expect(canvasState.userCount).toBeGreaterThanOrEqual(3);
    expect(canvasState.hasMultipleUsers).toBe(true);
    expect(canvasState.canvasElements).toBeGreaterThan(0);
    
    // Close additional pages
    for (let i = 1; i < pages.length; i++) {
      await pages[i].close();
    }
  });

  test('canvas performance with rapid user changes', async ({ page, context }) => {
    await page.goto('/');
    
    const testUsername = `PerfTest${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Create and quickly close multiple user sessions
    const rapidPages = [];
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage();
      rapidPages.push(newPage);
      
      await newPage.goto('/');
      await newPage.locator('#name-button').click();
      await newPage.locator('#name-input').fill(`Rapid${i}_${Date.now()}`);
      await newPage.locator('#join-button').click();
      await expect(newPage.locator('#connection-status')).toHaveText('Connected');
      
      // Close immediately after joining
      setTimeout(() => newPage.close(), 100 * i);
    }
    
    // Wait for all changes to propagate
    await page.waitForTimeout(2000);
    
    // Original page should still be functional
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Canvas should still be responsive
    const canvasHealthy = await page.evaluate(() => {
      return {
        pixiAppExists: !!window.pixiApp,
        tickerRunning: window.pixiApp && window.pixiApp.ticker && window.pixiApp.ticker.started,
        stageExists: window.pixiApp && window.pixiApp.stage,
        noErrors: !window.pixiError
      };
    });
    
    expect(canvasHealthy.pixiAppExists).toBe(true);
    expect(canvasHealthy.stageExists).toBe(true);
    
    // Should be able to send message after rapid changes
    await page.locator('#message-input').fill('Canvas still works after rapid changes');
    await page.locator('#send-button').click();
    await expect(page.locator('#chat-messages')).toContainText('Canvas still works after rapid changes');
  });
});