import { test, expect } from '@playwright/test';

test.describe('Chat Flow Integration Tests', () => {
  test('complete user journey: join, chat, and leave', async ({ page }) => {
    // Navigate to the chat application
    await page.goto('/');
    
    // Wait for the page to load completely
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('#chat-messages')).toBeVisible();
    
    // Initially, the send button should be disabled (user not joined)
    await expect(page.locator('#send-button')).toBeDisabled();
    
    // Open the name dialog
    await page.locator('#name-button').click();
    await expect(page.locator('#name-dialog')).toBeVisible();
    
    // Try to join with empty name (should show error)
    await page.locator('#join-button').click();
    await expect(page.locator('#name-input')).toHaveClass(/error/);
    
    // Try to join with name too long (should show error)
    await page.locator('#name-input').fill('ThisNameIsWayTooLongAndShouldFail');
    await page.locator('#join-button').click();
    await expect(page.locator('#name-input')).toHaveClass(/error/);
    
    // Join with valid name
    const testUsername = `TestUser${Date.now()}`;
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    
    // Name dialog should close and connection should be established
    await expect(page.locator('#name-dialog')).toBeHidden();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    await expect(page.locator('#send-button')).toBeEnabled();
    
    // User should see join notification in chat
    await expect(page.locator('#chat-messages')).toContainText(`${testUsername} joined the chat`);
    
    // Send a chat message
    const testMessage = `Hello from ${testUsername}!`;
    await page.locator('#message-input').fill(testMessage);
    await page.locator('#send-button').click();
    
    // Message should appear in chat
    await expect(page.locator('#chat-messages')).toContainText(testMessage);
    await expect(page.locator('#chat-messages')).toContainText(testUsername);
    
    // Input should be cleared after sending
    await expect(page.locator('#message-input')).toHaveValue('');
    
    // Check that user appears on canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Send message using Enter key
    const secondMessage = 'Sent with Enter key';
    await page.locator('#message-input').fill(secondMessage);
    await page.locator('#message-input').press('Enter');
    await expect(page.locator('#chat-messages')).toContainText(secondMessage);
  });

  test('name validation prevents duplicate usernames', async ({ page, context }) => {
    const testUsername = `DuplicateTest${Date.now()}`;
    
    // First user joins
    await page.goto('/');
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Second user tries to join with same name
    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await secondPage.locator('#name-button').click();
    await secondPage.locator('#name-input').fill(testUsername);
    await secondPage.locator('#join-button').click();
    
    // Should show error for duplicate name
    await expect(secondPage.locator('#name-input')).toHaveClass(/error/);
    await expect(secondPage.locator('#name-dialog')).toBeVisible();
    
    // Second user can join with different name
    await secondPage.locator('#name-input').fill(`${testUsername}_2`);
    await secondPage.locator('#join-button').click();
    await expect(secondPage.locator('#connection-status')).toHaveText('Connected');
  });

  test('user can rejoin after page refresh', async ({ page }) => {
    const testUsername = `RefreshTest${Date.now()}`;
    
    // Join and send message
    await page.goto('/');
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    await page.locator('#message-input').fill('Message before refresh');
    await page.locator('#send-button').click();
    
    // Refresh page
    await page.reload();
    
    // Should be able to rejoin (previous user should have disconnected)
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Should see fresh chat (no previous messages)
    await expect(page.locator('#chat-messages')).toContainText(`${testUsername} joined the chat`);
  });

  test('multiple users can chat simultaneously', async ({ page, context }) => {
    const user1Name = `User1_${Date.now()}`;
    const user2Name = `User2_${Date.now()}`;
    
    // First user joins
    await page.goto('/');
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(user1Name);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Second user joins
    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await secondPage.locator('#name-button').click();
    await secondPage.locator('#name-input').fill(user2Name);
    await secondPage.locator('#join-button').click();
    await expect(secondPage.locator('#connection-status')).toHaveText('Connected');
    
    // Both users should see join notifications
    await expect(page.locator('#chat-messages')).toContainText(`${user2Name} joined the chat`);
    await expect(secondPage.locator('#chat-messages')).toContainText(`${user1Name} joined the chat`);
    
    // User 1 sends message
    await page.locator('#message-input').fill('Hello from User 1');
    await page.locator('#send-button').click();
    
    // Both users should see the message
    await expect(page.locator('#chat-messages')).toContainText('Hello from User 1');
    await expect(secondPage.locator('#chat-messages')).toContainText('Hello from User 1');
    
    // User 2 responds
    await secondPage.locator('#message-input').fill('Hello from User 2');
    await secondPage.locator('#send-button').click();
    
    // Both users should see the response
    await expect(page.locator('#chat-messages')).toContainText('Hello from User 2');
    await expect(secondPage.locator('#chat-messages')).toContainText('Hello from User 2');
    
    // Close first user's tab (simulate leaving)
    await page.close();
    
    // Second user should see leave notification
    await expect(secondPage.locator('#chat-messages')).toContainText(`${user1Name} left the chat`);
  });
});