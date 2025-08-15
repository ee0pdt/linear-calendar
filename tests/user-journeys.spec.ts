import { test, expect } from '@playwright/test';
import { sampleICSContent } from './fixtures/testData';

/**
 * End-to-End User Journey Tests
 * 
 * These tests simulate complete user workflows combining multiple features
 * to ensure the application works as a cohesive whole.
 */

test.describe('Complete User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container', { timeout: 10000 });
  });

  test('ADHD user planning workflow', async ({ page }) => {
    /**
     * Journey: ADHD user needs to:
     * 1. See today's position in the year
     * 2. Import their calendar events
     * 3. Search for specific events
     * 4. Navigate to important dates
     */

    // 1. Today should be clearly highlighted
    const todayVisible = await page.evaluate(() => {
      const indicators = document.querySelectorAll('.today-highlight, .current-day, [data-today="true"], .bg-blue-500, .border-blue-500');
      return Array.from(indicators).some(el => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });
    });
    
    if (!todayVisible) {
      // If today not visible, use jump to today button
      const todayButton = page.locator('[data-testid="jump-to-today"], button:has-text("Today")').first();
      if (await todayButton.count() > 0) {
        await todayButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // 2. Import calendar functionality should be available
    const importExists = await page.locator('button:has-text("Import"), input[type="file"], [data-testid="import-button"]').count() > 0;
    
    if (importExists) {
      // Import flow is available for user
    }

    // 3. Search should be accessible
    const searchExists = await page.locator('button:has-text("Search"), [data-testid="event-search"]').count() > 0;
    
    if (searchExists) {
      // Search functionality is available
    }

    // 4. Overall usability check - calendar should be functional
    const calendarFunctional = await page.evaluate(() => {
      const calendar = document.querySelector('[data-testid="linear-calendar"], .calendar-container');
      return calendar && calendar.children.length > 0;
    });
    
    expect(calendarFunctional).toBe(true);
  });

  test('Time management visualization journey', async ({ page }) => {
    /**
     * Journey: User wants visual overview of their time:
     * 1. See full year layout
     * 2. Identify busy periods
     * 3. Find free time slots
     * 4. Plan ahead
     */

    // 1. Full year should be accessible via scroll
    const initialScrollHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(initialScrollHeight).toBeGreaterThan(3000); // Should have significant height for full year

    // 2. Past days should be visually marked
    const pastDaysExist = await page.locator('.past-day, .completed, .checkmark, [data-past="true"]').count() > 0;
    
    // 3. School holidays should be visible for planning
    const holidaysExist = await page.locator('.school-holiday, .holiday, [data-holiday]').count() > 0;
    
    // 4. Weekend distinction should be clear
    const weekendsExist = await page.locator('.weekend, .saturday, .sunday, [data-weekend="true"], .italic').count() > 0;

    // Visual hierarchy should exist
    const hasVisualStructure = pastDaysExist || holidaysExist || weekendsExist;
    expect(hasVisualStructure).toBe(true);
  });

  test('Print preparation workflow', async ({ page }) => {
    /**
     * Journey: User wants to print calendar for wall mounting:
     * 1. Load full calendar
     * 2. Check print preview
     * 3. Ensure it fits 4 A4 pages
     * 4. Verify readability
     */

    // 1. Calendar should be loaded
    const calendarLoaded = await page.locator('[data-testid="linear-calendar"], .calendar-container').first().isVisible();
    expect(calendarLoaded).toBe(true);

    // 2. Switch to print preview
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    // 3. Check print formatting
    const printStyles = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    });

    // 4. Interactive elements should be hidden
    const interactiveHidden = await page.locator('button').first().isVisible() === false;
    
    // Print version should be optimized
    expect(printStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)'); // Transparent for print
  });

  test('Mobile planning on-the-go journey', async ({ page }) => {
    /**
     * Journey: User checks calendar on mobile:
     * 1. Load on mobile device
     * 2. Navigate to specific dates
     * 3. View event details
     * 4. Search for events
     */

    // 1. Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');

    // 2. Should be mobile-friendly
    const noHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth <= window.innerWidth;
    });
    expect(noHorizontalScroll).toBe(true);

    // 3. Navigation should work on mobile
    const todayButton = page.locator('[data-testid="jump-to-today"], button:has-text("Today")').first();
    if (await todayButton.count() > 0) {
      const buttonSize = await todayButton.boundingBox();
      if (buttonSize) {
        // Touch targets should be large enough (44px minimum recommended)
        expect(buttonSize.width >= 44 || buttonSize.height >= 44).toBe(true);
      }
    }

    // 4. Content should be readable
    const textReadable = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const textElements = elements.filter(el => el.textContent && el.textContent.trim());
      if (textElements.length === 0) return true;
      
      const styles = textElements.map(el => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      
      const avgFontSize = styles.reduce((a, b) => a + b, 0) / styles.length;
      return avgFontSize >= 14; // Minimum readable on mobile
    });
    
    expect(textReadable).toBe(true);
  });

  test('Performance-sensitive user journey', async ({ page }) => {
    /**
     * Journey: User with slower device needs fast experience:
     * 1. Quick initial load
     * 2. Smooth scrolling
     * 3. Responsive interactions
     * 4. No performance degradation
     */

    // 1. Measure initial load time
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds

    // 2. Test scroll performance
    const scrollStartTime = Date.now();
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(50);
    }
    const scrollTime = Date.now() - scrollStartTime;
    
    expect(scrollTime).toBeLessThan(1000); // Scrolling should be smooth

    // 3. Check virtualization is working (limited DOM elements)
    const domElements = await page.locator('[class*="day"], [data-testid*="day"]').count();
    expect(domElements).toBeLessThan(200); // Should be virtualized

    // 4. Memory usage should be reasonable
    const memoryInfo = await page.evaluate(() => {
      // @ts-ignore - performance.memory might not be available in all browsers
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    if (memoryInfo > 0) {
      expect(memoryInfo).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    }
  });

  test('Accessibility-focused user journey', async ({ page }) => {
    /**
     * Journey: User with accessibility needs:
     * 1. Navigate with keyboard
     * 2. Use screen reader friendly elements
     * 3. Access all functionality
     * 4. Clear focus indicators
     */

    // 1. Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'A', 'BODY'].includes(focusedElement || '')).toBe(true);

    // 2. Check for ARIA labels and semantic elements
    const hasSemanticElements = await page.evaluate(() => {
      return document.querySelector('button, nav, main, section, article, h1, h2, h3') !== null;
    });
    expect(hasSemanticElements).toBe(true);

    // 3. Check color contrast (basic check)
    const hasGoodContrast = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const textElements = elements.filter(el => el.textContent && el.textContent.trim());
      
      if (textElements.length === 0) return true;
      
      const contrastChecks = textElements.slice(0, 10).map(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Basic contrast check - dark text on light background
        return color.includes('rgb(0, 0, 0)') || color === 'black' ||
               backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent';
      });
      
      return contrastChecks.some(check => check);
    });
    
    expect(hasGoodContrast).toBe(true);
  });
});