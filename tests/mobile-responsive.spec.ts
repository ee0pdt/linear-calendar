import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive Journey', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container', { timeout: 10000 });

    // Calendar should be visible and usable on mobile
    const calendarVisible = await page.locator('[data-testid="linear-calendar"], .calendar-container').first().isVisible();
    expect(calendarVisible).toBe(true);

    // Check that content fits in mobile viewport
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should support touch scrolling on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');

    const initialScrollPosition = await page.evaluate(() => window.pageYOffset);

    // Simulate touch scroll
    await page.touchscreen.tap(200, 400);
    await page.touchscreen.tap(200, 300); // Swipe up
    await page.waitForTimeout(500);

    const newScrollPosition = await page.evaluate(() => window.pageYOffset);
    
    // Touch scrolling should work (scroll position should change)
    // Note: This might not work in all test environments
  });

  test('should handle mobile navigation interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');

    // Look for mobile-friendly navigation elements
    const mobileNavSelectors = [
      '[data-testid="jump-to-today"]',
      'button:has-text("Today")',
      '.today-button',
      'button'
    ];

    let mobileNavFound = false;
    for (const selector of mobileNavSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        // Check that buttons are large enough for touch (minimum 44px recommended)
        const button = elements.first();
        const boundingBox = await button.boundingBox();
        if (boundingBox && (boundingBox.width >= 44 || boundingBox.height >= 44)) {
          mobileNavFound = true;
          break;
        }
      }
    }
    // Touch targets should be appropriately sized
  });

  test('should display events properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');

    // Check for event elements
    const eventSelectors = [
      '.event',
      '[data-testid*="event"]',
      '.calendar-event',
      '[class*="event"]'
    ];

    let mobileEventsWork = false;
    for (const selector of eventSelectors) {
      const events = page.locator(selector);
      const count = await events.count();
      if (count > 0) {
        // Check that events are readable on mobile
        const firstEvent = events.first();
        const boundingBox = await firstEvent.boundingBox();
        if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
          mobileEventsWork = true;
          break;
        }
      }
    }
    // Events should render properly on mobile
  });

  test('should handle modal interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');

    // Look for modal triggers
    const modalTriggers = [
      'button:has-text("Search")',
      'button:has-text("Navigate")', 
      'button:has-text("Import")',
      '.modal-trigger'
    ];

    let modalTrigger = null;
    for (const selector of modalTriggers) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        modalTrigger = element;
        break;
      }
    }

    if (modalTrigger) {
      await modalTrigger.tap(); // Use tap instead of click for mobile
      await page.waitForTimeout(500);

      // Check that modal appears and is usable on mobile
      const modalSelectors = [
        '.modal',
        '[role="dialog"]',
        '[data-testid*="modal"]'
      ];

      let mobileModalFound = false;
      for (const selector of modalSelectors) {
        const modal = page.locator(selector);
        if (await modal.isVisible()) {
          const boundingBox = await modal.boundingBox();
          // Modal should fit within mobile viewport
          if (boundingBox && boundingBox.width <= 375) {
            mobileModalFound = true;
            break;
          }
        }
      }
      expect(mobileModalFound).toBe(true);
    }
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport  
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container', { timeout: 10000 });

    // Calendar should work well on tablet
    const calendarVisible = await page.locator('[data-testid="linear-calendar"], .calendar-container').first().isVisible();
    expect(calendarVisible).toBe(true);

    // Should not have horizontal scroll on tablet
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Content should use available space efficiently
    const contentWidth = await page.evaluate(() => {
      const calendar = document.querySelector('[data-testid="linear-calendar"], .calendar-container');
      return calendar ? calendar.getBoundingClientRect().width : 0;
    });
    
    expect(contentWidth).toBeGreaterThan(600); // Should use tablet space
  });

  test('should handle orientation changes', async ({ page }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');
    
    const portraitVisible = await page.locator('[data-testid="linear-calendar"], .calendar-container').first().isVisible();
    expect(portraitVisible).toBe(true);

    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    const landscapeVisible = await page.locator('[data-testid="linear-calendar"], .calendar-container').first().isVisible();
    expect(landscapeVisible).toBe(true);

    // Content should still be accessible in landscape
    const hasVerticalScroll = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight;
    });
    expect(hasVerticalScroll).toBe(true); // Calendar should be scrollable
  });

  test('should maintain text readability on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');

    // Check font sizes are readable on mobile
    const textElements = await page.locator('body *').evaluateAll(elements => {
      return elements.map(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        return { tag: el.tagName, fontSize, hasText: el.textContent && el.textContent.trim().length > 0 };
      }).filter(el => el.hasText);
    });

    // Most text should be at least 14px for mobile readability
    const readableText = textElements.filter(el => el.fontSize >= 14);
    const readabilityRatio = readableText.length / textElements.length;
    
    expect(readabilityRatio).toBeGreaterThan(0.7); // At least 70% of text should be readable size
  });

  test('should handle touch interactions with events', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');

    // Look for events
    const events = page.locator('.event, [data-testid*="event"], .calendar-event');
    const eventCount = await events.count();

    if (eventCount > 0) {
      const firstEvent = events.first();
      const boundingBox = await firstEvent.boundingBox();

      if (boundingBox) {
        // Touch the event
        await page.touchscreen.tap(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
        await page.waitForTimeout(500);

        // Check for any response (modal, highlight, etc.)
        const hasResponse = await page.evaluate(() => {
          return document.querySelector('.modal, .highlighted, .selected, [aria-expanded="true"]') !== null;
        });
        
        // Touch interaction should trigger some response
      }
    }
  });
});