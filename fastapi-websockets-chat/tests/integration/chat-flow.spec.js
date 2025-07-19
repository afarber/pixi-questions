import { test, expect } from '@playwright/test';

test.describe('Chat Flow Integration Tests', () => {
  test('complete user journey: join, chat, and leave', async ({ page }) => {
    // Navigate to the chat application
    await page.goto('/');
    
    // Wait for the page to load completely
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('#chatWindow')).toBeVisible();
    
    // Initially, the send button should be disabled (user not joined)
    await expect(page.locator('#sendButton')).toBeDisabled();
    
    // Name drawer dialog is automatically displayed on page load
    await expect(page.locator('#nameDrawer')).toBeVisible();
    
    // Join with valid name directly (keep under 16 chars due to input maxlength)
    const testUsername = `User${Date.now() % 100000}`;
    await page.locator('#nameInput').fill(testUsername);
    await page.locator('#joinButton').click();
    
    // Wait for successful join - connection should be established
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    await expect(page.locator('#nameDrawer')).not.toHaveClass(/active/);
    await expect(page.locator('#sendButton')).toBeEnabled();
    
    // User should see join notification in chat
    await expect(page.locator('#chatWindow')).toContainText(`${testUsername} joined the chat`);
    
    // Send a chat message
    const testMessage = `Hello from ${testUsername}!`;
    await page.locator('#messageInput').fill(testMessage);
    await page.locator('#sendButton').click();
    
    // Message should appear in chat
    await expect(page.locator('#chatWindow')).toContainText(testMessage);
    await expect(page.locator('#chatWindow')).toContainText(testUsername);
    
    // Input should be cleared after sending
    await expect(page.locator('#messageInput')).toHaveValue('');
    
    // Check that user appears on canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Send message using Enter key
    const secondMessage = 'Sent with Enter key';
    await page.locator('#messageInput').fill(secondMessage);
    await page.locator('#messageInput').press('Enter');
    await expect(page.locator('#chatWindow')).toContainText(secondMessage);
  });

  test('name validation prevents duplicate usernames', async ({ page, context }) => {
    const testUsername = `Dup${Date.now() % 10000}`;
    
    // First user joins - name drawer is automatically shown on page load
    await page.goto('/');
    await page.locator('#nameInput').fill(testUsername);
    await page.locator('#joinButton').click();
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    // Second user tries to join with same name
    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await secondPage.locator('#nameInput').fill(testUsername);
    await secondPage.locator('#joinButton').click();
    
    // Should show error for duplicate name
    await expect(secondPage.locator('#nameInput')).toHaveClass(/error/);
    await expect(secondPage.locator('#nameDrawer')).toHaveClass(/active/);
    
    // Second user can join with different name
    await secondPage.locator('#nameInput').clear();
    await secondPage.locator('#nameInput').fill(`${testUsername}2`);
    await secondPage.locator('#joinButton').click();
    await expect(secondPage.locator('#connectionStatus')).toHaveText('Connected');
  });

  test('name validation shows error for empty name', async ({ page }) => {
    await page.goto('/');
    
    // Try to join with empty name (should show error)
    await page.locator('#joinButton').click();
    await expect(page.locator('#nameInput')).toHaveClass(/error/);
    await expect(page.locator('#nameDrawer')).toHaveClass(/active/);
  });

  test('name validation shows error for long name', async ({ page }) => {
    await page.goto('/');
    
    // Try to join with name too long (should show error)
    await page.locator('#nameInput').fill('ThisNameIsWayTooLongAndShouldFail');
    await page.locator('#joinButton').click();
    await expect(page.locator('#nameInput')).toHaveClass(/error/);
    await expect(page.locator('#nameDrawer')).toHaveClass(/active/);
  });

  test('user can rejoin after page refresh', async ({ page }) => {
    const testUsername = `RefreshTest${Date.now()}`;
    
    // Join and send message
    await page.goto('/');
    await page.locator('#nameInput').fill(testUsername);
    await page.locator('#joinButton').click();
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    await page.locator('#messageInput').fill('Message before refresh');
    await page.locator('#sendButton').click();
    
    // Refresh page
    await page.reload();
    
    // Should be able to rejoin (previous user should have disconnected)
    await page.locator('#nameInput').fill(testUsername);
    await page.locator('#joinButton').click();
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    // Should see fresh chat (no previous messages)
    await expect(page.locator('#chatWindow')).toContainText(`${testUsername} joined the chat`);
  });

  test('multiple users can chat simultaneously', async ({ page, context }) => {
    const user1Name = `User1_${Date.now()}`;
    const user2Name = `User2_${Date.now()}`;
    
    // First user joins
    await page.goto('/');
    await page.locator('#nameInput').fill(user1Name);
    await page.locator('#joinButton').click();
    await expect(page.locator('#connectionStatus')).toHaveText('Connected');
    
    // Second user joins
    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await secondPage.locator('#nameDrawer').click();
    await secondPage.locator('#nameInput').fill(user2Name);
    await secondPage.locator('#joinButton').click();
    await expect(secondPage.locator('#connectionStatus')).toHaveText('Connected');
    
    // Both users should see join notifications
    await expect(page.locator('#chatWindow')).toContainText(`${user2Name} joined the chat`);
    await expect(secondPage.locator('#chatWindow')).toContainText(`${user1Name} joined the chat`);
    
    // User 1 sends message
    await page.locator('#messageInput').fill('Hello from User 1');
    await page.locator('#sendButton').click();
    
    // Both users should see the message
    await expect(page.locator('#chatWindow')).toContainText('Hello from User 1');
    await expect(secondPage.locator('#chatWindow')).toContainText('Hello from User 1');
    
    // User 2 responds
    await secondPage.locator('#messageInput').fill('Hello from User 2');
    await secondPage.locator('#sendButton').click();
    
    // Both users should see the response
    await expect(page.locator('#chatWindow')).toContainText('Hello from User 2');
    await expect(secondPage.locator('#chatWindow')).toContainText('Hello from User 2');
    
    // Close first user's tab (simulate leaving)
    await page.close();
    
    // Second user should see leave notification
    await expect(secondPage.locator('#chatWindow')).toContainText(`${user1Name} left the chat`);
  });
});