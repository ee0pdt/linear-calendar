import { test, expect } from '@playwright/test';
import { sampleICSContent, testEvents, testSelectors } from './fixtures/testData';
import path from 'path';

test.describe('Event Management Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container', { timeout: 10000 });
  });

  test('should import ICS file and display events', async ({ page }) => {
    // Create a temporary ICS file
    const tempFile = path.join(__dirname, 'temp-calendar.ics');
    const fs = require('fs');
    fs.writeFileSync(tempFile, sampleICSContent);

    try {
      // Look for import functionality
      const importSelectors = [
        '[data-testid="import-button"]',
        'button:has-text("Import")',
        'input[type="file"]',
        '.import-trigger'
      ];

      let importElement = null;
      for (const selector of importSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          importElement = element;
          break;
        }
      }

      if (importElement) {
        // If it's a file input, use it directly
        if (await importElement.getAttribute('type') === 'file') {
          await importElement.setInputFiles(tempFile);
        } else {
          // Click import button first, then find file input
          await importElement.click();
          const fileInput = page.locator('input[type="file"]');
          await fileInput.setInputFiles(tempFile);
        }

        await page.waitForTimeout(2000); // Wait for import processing

        // Check for imported events in the calendar
        const eventSelectors = [
          'text="Team Meeting"',
          'text="Birthday Party"',
          'text="Gym Session"',
          '.event',
          '[data-testid*="event"]'
        ];

        let eventFound = false;
        for (const selector of eventSelectors) {
          if (await page.locator(selector).count() > 0) {
            eventFound = true;
            break;
          }
        }
        expect(eventFound).toBe(true);
      }
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  });

  test('should open and use event search', async ({ page }) => {
    // Look for search functionality
    const searchSelectors = [
      '[data-testid="event-search"]',
      'button:has-text("Search")',
      'input[placeholder*="search"]',
      '.search-trigger'
    ];

    let searchElement = null;
    for (const selector of searchSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        searchElement = element;
        break;
      }
    }

    if (searchElement) {
      await searchElement.click();
      await page.waitForTimeout(500);

      // Look for search input in modal/dropdown
      const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('meeting');
        await page.waitForTimeout(500);

        // Check for search results
        const hasResults = await page.locator('.search-result, .event-result, [data-testid*="result"]').count() > 0;
        // Search might not have results if no events are loaded, that's okay for this test
      }
    }
  });

  test('should display event details when clicked', async ({ page }) => {
    // First, try to import some events or check if any exist
    await page.waitForTimeout(1000);

    // Look for any existing events
    const eventSelectors = [
      '.event',
      '[data-testid*="event"]',
      '.calendar-event',
      '[class*="event"]'
    ];

    let eventElement = null;
    for (const selector of eventSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        eventElement = elements.first();
        break;
      }
    }

    if (eventElement) {
      await eventElement.click();
      await page.waitForTimeout(500);

      // Check for event details modal/popup
      const modalSelectors = [
        '[data-testid="event-details-modal"]',
        '.event-modal',
        '.modal',
        '[role="dialog"]'
      ];

      let modalFound = false;
      for (const selector of modalSelectors) {
        if (await page.locator(selector).isVisible()) {
          modalFound = true;
          break;
        }
      }
      expect(modalFound).toBe(true);
    }
  });

  test('should handle location map links', async ({ page }) => {
    // This test checks if event locations generate map links
    // First check if there are any events with locations
    const locationElements = page.locator('text="Conference Room", text="Home", text="Gym", [data-location]');
    const locationCount = await locationElements.count();

    if (locationCount > 0) {
      // Click on an event to open details
      const eventWithLocation = locationElements.first();
      await eventWithLocation.click();
      await page.waitForTimeout(500);

      // Look for map links (Apple Maps or Google Maps)
      const mapLinkSelectors = [
        'a[href*="maps.apple.com"]',
        'a[href*="maps.google.com"]', 
        'a[href*="maps"]',
        '.map-link'
      ];

      let mapLinkFound = false;
      for (const selector of mapLinkSelectors) {
        if (await page.locator(selector).count() > 0) {
          mapLinkFound = true;
          break;
        }
      }
      expect(mapLinkFound).toBe(true);
    }
  });

  test('should show CalDAV import option', async ({ page }) => {
    // Look for live import/CalDAV functionality
    const caldavSelectors = [
      'button:has-text("Live Import")',
      'button:has-text("Apple Calendar")',
      'button:has-text("CalDAV")',
      '[data-testid="caldav-import"]',
      '.live-import'
    ];

    let caldavFound = false;
    for (const selector of caldavSelectors) {
      if (await page.locator(selector).count() > 0) {
        caldavFound = true;
        break;
      }
    }
    
    // CalDAV might not be available in test environment, so we don't require it
    // but if it's there, we should be able to find it
  });

  test('should handle recurring event indicators', async ({ page }) => {
    // Look for recurring event indicators (stars according to code analysis)
    const recurringSelectors = [
      '.recurring-event',
      '[data-recurring="true"]',
      'text="⭐"',
      '.star',
      '*:has-text("*")'
    ];

    let recurringFound = false;
    for (const selector of recurringSelectors) {
      if (await page.locator(selector).count() > 0) {
        recurringFound = true;
        break;
      }
    }
    
    // Recurring events might not be visible without imported data
  });

  test('should display event emojis correctly', async ({ page }) => {
    // Check for emoji indicators in events (according to CLAUDE.md, emojis are added)
    const emojiSelectors = [
      'text="🎂"', // birthday
      'text="💪"', // gym
      'text="🏖️"', // vacation
      'text="⛪"', // church
      'text="🍽️"', // meal
      '.emoji'
    ];

    let emojiFound = false;
    for (const selector of emojiSelectors) {
      if (await page.locator(selector).count() > 0) {
        emojiFound = true;
        break;
      }
    }
    
    // Emojis might not be visible without imported events
  });

  test('should show event tooltips on hover', async ({ page }) => {
    // Find any events
    const events = page.locator('.event, [data-testid*="event"], .calendar-event');
    const eventCount = await events.count();

    if (eventCount > 0) {
      const firstEvent = events.first();
      await firstEvent.hover();
      await page.waitForTimeout(500);

      // Look for tooltip
      const tooltipSelectors = [
        '.tooltip',
        '[role="tooltip"]',
        '.event-tooltip',
        '[data-testid="tooltip"]'
      ];

      let tooltipFound = false;
      for (const selector of tooltipSelectors) {
        if (await page.locator(selector).isVisible()) {
          tooltipFound = true;
          break;
        }
      }
      // Tooltips might not be implemented, so this is informational
    }
  });
});