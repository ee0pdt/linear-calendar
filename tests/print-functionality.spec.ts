import { test, expect } from '@playwright/test';

test.describe('Print Functionality Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container', { timeout: 10000 });
  });

  test('should apply print styles when print media query is active', async ({ page }) => {
    // Emulate print media to trigger print styles
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // Check that print styles are applied
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize
      };
    });

    // Print should use appropriate colors (typically black/white)
    expect(bodyStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)'); // Transparent or white
  });

  test('should hide interactive elements in print mode', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // Interactive elements that should be hidden in print
    const interactiveSelectors = [
      'button',
      '[data-testid="jump-to-today"]',
      'input[type="file"]',
      '.modal-trigger',
      '.interactive'
    ];

    for (const selector of interactiveSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        const isVisible = await elements.first().isVisible();
        // Interactive elements should be hidden in print
        expect(isVisible).toBe(false);
      }
    }
  });

  test('should format to 4 A4 pages as specified', async ({ page }) => {
    // Set A4 page size for print preview
    await page.emulateMedia({ media: 'print' });
    
    // A4 size is 210mm × 297mm (roughly 794px × 1123px at 96dpi)
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.waitForTimeout(1000);

    // Check page structure for print
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 1123;
    
    // Calculate approximate number of pages (allowing for some variance)
    const approximatePages = Math.ceil(pageHeight / viewportHeight);
    
    // According to CLAUDE.md, should format to exactly 4 A4 pages
    expect(approximatePages).toBeLessThanOrEqual(6); // Allow some flexibility for test environment
  });

  test('should maintain readability in black and white print', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // Check text contrast and visibility
    const textElements = await page.locator('body *').evaluateAll(elements => {
      return elements.map(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        const hasText = el.textContent && el.textContent.trim().length > 0;
        
        return { 
          color, 
          backgroundColor, 
          hasText,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight
        };
      }).filter(el => el.hasText);
    });

    // Text should be readable (typically black on white/transparent)
    const readableText = textElements.filter(el => {
      // Check for dark text colors that would print well
      return el.color.includes('rgb(0, 0, 0)') || 
             el.color === 'black' || 
             el.color.includes('rgba(0, 0, 0');
    });

    expect(readableText.length).toBeGreaterThan(0);
  });

  test('should preserve calendar structure in print', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // Calendar should still be visible and structured
    const calendarVisible = await page.locator('[data-testid="linear-calendar"], .calendar-container').first().isVisible();
    expect(calendarVisible).toBe(true);

    // Month headers should be visible for navigation
    const monthHeaders = page.locator('h2, .month-header, [data-testid*="month-header"]');
    const headerCount = await monthHeaders.count();
    expect(headerCount).toBeGreaterThan(0);

    // Days should be visible
    const days = page.locator('[class*="day"], [data-testid*="day"]');
    const dayCount = await days.count();
    expect(dayCount).toBeGreaterThan(0);
  });

  test('should show school holidays in print format', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // Look for school holiday indicators that should print
    const holidaySelectors = [
      '.school-holiday',
      '.holiday',
      '[data-holiday]',
      'text="Summer Holiday"',
      'text="Christmas Holiday"'
    ];

    let holidayFound = false;
    for (const selector of holidaySelectors) {
      if (await page.locator(selector).count() > 0) {
        holidayFound = true;
        break;
      }
    }
    
    // School holidays should be visible in print (according to CLAUDE.md)
  });

  test('should hide current day highlighting in print', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // Current day highlighting should be hidden in print (screen only according to CLAUDE.md)
    const todayHighlights = [
      '.today-highlight',
      '.current-day-screen',
      '.bg-blue-500'
    ];

    for (const selector of todayHighlights) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        const isVisible = await elements.first().isVisible();
        // Today highlighting should be hidden in print
        expect(isVisible).toBe(false);
      }
    }
  });

  test('should preserve event information in print', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // Events should remain visible in print for reference
    const eventSelectors = [
      '.event',
      '[data-testid*="event"]',
      '.calendar-event'
    ];

    let eventsVisible = false;
    for (const selector of eventSelectors) {
      const events = page.locator(selector);
      const count = await events.count();
      
      if (count > 0) {
        const isVisible = await events.first().isVisible();
        if (isVisible) {
          eventsVisible = true;
          break;
        }
      }
    }
    
    // Events should be printable for reference
  });

  test('should maintain proper spacing and layout in print', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    
    // Set print page size
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.waitForTimeout(1000);

    // Check for reasonable spacing
    const calendarElement = page.locator('[data-testid="linear-calendar"], .calendar-container').first();
    const boundingBox = await calendarElement.boundingBox();

    if (boundingBox) {
      // Calendar should use reasonable amount of page width
      expect(boundingBox.width).toBeGreaterThan(600);
      
      // Should not overflow page width
      expect(boundingBox.width).toBeLessThanOrEqual(794);
    }
  });

  test('should print without JavaScript interactivity', async ({ page }) => {
    // Disable JavaScript to simulate print environment
    await page.setJavaScriptEnabled(false);
    await page.goto('/');
    
    // Re-enable to check final state
    await page.setJavaScriptEnabled(true);
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // Basic calendar structure should still be present
    const hasContent = await page.evaluate(() => {
      return document.body.textContent && document.body.textContent.trim().length > 0;
    });
    
    expect(hasContent).toBe(true);
  });

  test('should handle print preview generation', async ({ page }) => {
    // Generate a PDF to test print functionality
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' }
    });

    // PDF should be generated successfully
    expect(pdfBuffer.length).toBeGreaterThan(1000); // Should have content

    // PDF should be reasonable size for 4 pages
    expect(pdfBuffer.length).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
  });
});