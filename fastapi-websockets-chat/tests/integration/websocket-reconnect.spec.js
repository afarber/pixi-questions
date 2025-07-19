import { test, expect } from '@playwright/test';

test.describe('WebSocket Reconnection Tests', () => {
  test('automatically reconnects after connection loss', async ({ page }) => {
    await page.goto('/');
    
    // Join as a user
    const testUsername = `ReconnectUser${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Send initial message to confirm connection
    await page.locator('#message-input').fill('Before disconnect');
    await page.locator('#send-button').click();
    await expect(page.locator('#chat-messages')).toContainText('Before disconnect');
    
    // Simulate network disconnection by blocking WebSocket requests
    await page.route('**/ws', route => route.abort());
    
    // Trigger a message send that will fail
    await page.locator('#message-input').fill('This should fail');
    await page.locator('#send-button').click();
    
    // Should show disconnected status
    await expect(page.locator('#connection-status')).toHaveText('Disconnected', { timeout: 10000 });
    await expect(page.locator('#send-button')).toBeDisabled();
    
    // Should show reconnecting status
    await expect(page.locator('#connection-status')).toHaveText('Reconnecting...', { timeout: 15000 });
    
    // Re-enable WebSocket connections
    await page.unroute('**/ws');
    
    // Should automatically reconnect
    await expect(page.locator('#connection-status')).toHaveText('Connected', { timeout: 30000 });
    await expect(page.locator('#send-button')).toBeEnabled();
    
    // Should be able to send messages after reconnection
    await page.locator('#message-input').fill('After reconnect');
    await page.locator('#send-button').click();
    await expect(page.locator('#chat-messages')).toContainText('After reconnect');
  });

  test('maintains user state during reconnection', async ({ page }) => {
    await page.goto('/');
    
    const testUsername = `StateUser${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // User should not need to rejoin after reconnection
    // Check that username is preserved in localStorage or memory
    const userStateBefore = await page.evaluate(() => {
      return {
        username: window.userName,
        hasJoined: !!window.userName,
        localStorage: localStorage.getItem('chatUsername')
      };
    });
    
    expect(userStateBefore.hasJoined).toBe(true);
    expect(userStateBefore.username).toBe(testUsername);
    
    // Simulate connection loss
    await page.route('**/ws', route => route.abort());
    
    // Wait for disconnection
    await expect(page.locator('#connection-status')).toHaveText('Disconnected', { timeout: 10000 });
    
    // User state should still be preserved
    const userStateDuring = await page.evaluate(() => {
      return {
        username: window.userName,
        hasJoined: !!window.userName
      };
    });
    
    expect(userStateDuring.hasJoined).toBe(true);
    expect(userStateDuring.username).toBe(testUsername);
    
    // Re-enable connections
    await page.unroute('**/ws');
    
    // Should reconnect automatically
    await expect(page.locator('#connection-status')).toHaveText('Connected', { timeout: 30000 });
    
    // User state should still be preserved after reconnection
    const userStateAfter = await page.evaluate(() => {
      return {
        username: window.userName,
        hasJoined: !!window.userName
      };
    });
    
    expect(userStateAfter.hasJoined).toBe(true);
    expect(userStateAfter.username).toBe(testUsername);
    
    // Should be able to send messages without rejoining
    await page.locator('#message-input').fill('Reconnected automatically');
    await page.locator('#send-button').click();
    await expect(page.locator('#chat-messages')).toContainText('Reconnected automatically');
  });

  test('handles multiple quick disconnections gracefully', async ({ page }) => {
    await page.goto('/');
    
    const testUsername = `MultiDisconnectUser${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Rapidly toggle connection 3 times
    for (let i = 0; i < 3; i++) {
      // Disconnect
      await page.route('**/ws', route => route.abort());
      await page.waitForTimeout(1000);
      
      // Reconnect
      await page.unroute('**/ws');
      await page.waitForTimeout(2000);
    }
    
    // Should eventually settle in connected state
    await expect(page.locator('#connection-status')).toHaveText('Connected', { timeout: 30000 });
    await expect(page.locator('#send-button')).toBeEnabled();
    
    // Should be functional after multiple reconnections
    await page.locator('#message-input').fill('Survived multiple disconnects');
    await page.locator('#send-button').click();
    await expect(page.locator('#chat-messages')).toContainText('Survived multiple disconnects');
  });

  test('shows proper connection status indicators', async ({ page }) => {
    await page.goto('/');
    
    // Initial status before joining
    await expect(page.locator('#connection-status')).toHaveText('Disconnected');
    
    // Join user
    const testUsername = `StatusUser${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    
    // Should show connected
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Check that status indicator has proper styling
    const connectedStyles = await page.locator('#connection-status').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        className: el.className
      };
    });
    
    expect(connectedStyles.className).toContain('connected');
    
    // Simulate disconnection
    await page.route('**/ws', route => route.abort());
    
    // Should show disconnected status
    await expect(page.locator('#connection-status')).toHaveText('Disconnected', { timeout: 10000 });
    
    const disconnectedStyles = await page.locator('#connection-status').evaluate(el => {
      return {
        className: el.className
      };
    });
    
    expect(disconnectedStyles.className).toContain('disconnected');
    
    // Should show reconnecting status
    await expect(page.locator('#connection-status')).toHaveText('Reconnecting...', { timeout: 15000 });
    
    const reconnectingStyles = await page.locator('#connection-status').evaluate(el => {
      return {
        className: el.className
      };
    });
    
    expect(reconnectingStyles.className).toContain('reconnecting');
    
    // Re-enable connections
    await page.unroute('**/ws');
    
    // Should return to connected
    await expect(page.locator('#connection-status')).toHaveText('Connected', { timeout: 30000 });
  });

  test('handles server restart gracefully', async ({ page }) => {
    await page.goto('/');
    
    const testUsername = `ServerRestartUser${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Send message before "server restart"
    await page.locator('#message-input').fill('Before server restart');
    await page.locator('#send-button').click();
    await expect(page.locator('#chat-messages')).toContainText('Before server restart');
    
    // Simulate server being down (all requests fail)
    await page.route('**/*', route => route.abort());
    
    // Should detect disconnection
    await expect(page.locator('#connection-status')).toHaveText('Disconnected', { timeout: 10000 });
    
    // Should attempt to reconnect
    await expect(page.locator('#connection-status')).toHaveText('Reconnecting...', { timeout: 15000 });
    
    // "Server comes back up"
    await page.unroute('**/*');
    
    // Should reconnect successfully
    await expect(page.locator('#connection-status')).toHaveText('Connected', { timeout: 30000 });
    
    // Chat should be reset (new session)
    // User should automatically rejoin if username is preserved
    await page.locator('#message-input').fill('After server restart');
    await page.locator('#send-button').click();
    await expect(page.locator('#chat-messages')).toContainText('After server restart');
  });

  test('reconnection works across different network conditions', async ({ page }) => {
    await page.goto('/');
    
    const testUsername = `NetworkUser${Date.now()}`;
    await page.locator('#name-button').click();
    await page.locator('#name-input').fill(testUsername);
    await page.locator('#join-button').click();
    await expect(page.locator('#connection-status')).toHaveText('Connected');
    
    // Test slow network (delay responses)
    await page.route('**/ws', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      route.continue();
    });
    
    // Should handle slow connections
    await page.locator('#message-input').fill('Slow network test');
    await page.locator('#send-button').click();
    
    // Clear slow network simulation
    await page.unroute('**/ws');
    
    // Test intermittent failures (some requests succeed, some fail)
    let requestCount = 0;
    await page.route('**/ws', route => {
      requestCount++;
      if (requestCount % 3 === 0) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Should handle intermittent failures
    await page.waitForTimeout(5000);
    
    // Clear intermittent failure simulation
    await page.unroute('**/ws');
    
    // Should return to stable connection
    await expect(page.locator('#connection-status')).toHaveText('Connected', { timeout: 30000 });
    
    // Should be able to send messages normally
    await page.locator('#message-input').fill('Network conditions handled');
    await page.locator('#send-button').click();
    await expect(page.locator('#chat-messages')).toContainText('Network conditions handled');
  });
});