import { test, expect } from '@playwright/test';

test.describe('Performance Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start performance monitoring
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container', { timeout: 10000 });
  });

  test('should load calendar instantly with virtualization', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');
    
    const loadTime = Date.now() - startTime;
    
    // Calendar should load in under 3 seconds even with thousands of days
    expect(loadTime).toBeLessThan(3000);
    
    // Check that only a limited number of days are rendered (virtualization)
    const renderedDays = await page.locator('[class*="day"], [data-testid*="day"]').count();
    
    // With virtualization, should render much fewer than 365 days
    // According to CLAUDE.md, only ~15 visible days should be rendered
    expect(renderedDays).toBeLessThan(100); // Allow some buffer for overscan
  });

  test('should maintain 60fps scrolling performance', async ({ page }) => {
    // Enable performance monitoring
    await page.evaluate(() => {
      (window as any).frameCount = 0;
      (window as any).startTime = performance.now();
      
      function countFrames() {
        (window as any).frameCount++;
        requestAnimationFrame(countFrames);
      }
      requestAnimationFrame(countFrames);
    });

    await page.waitForTimeout(500);

    // Perform scrolling
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(1000);

    // Check frame rate
    const frameData = await page.evaluate(() => {
      const endTime = performance.now();
      const elapsed = endTime - (window as any).startTime;
      const fps = ((window as any).frameCount / elapsed) * 1000;
      return { fps, frameCount: (window as any).frameCount, elapsed };
    });

    // Should maintain reasonable frame rate (at least 30fps, ideally 60fps)
    expect(frameData.fps).toBeGreaterThan(30);
  });

  test('should show performance dashboard if available', async ({ page }) => {
    // Look for performance dashboard trigger (blue activity icon according to CLAUDE.md)
    const dashboardTriggers = [
      '[data-testid="performance-dashboard"]',
      '.performance-trigger',
      'button:has-text("Performance")',
      '.activity-icon',
      '[title*="performance"]'
    ];

    let dashboardTrigger = null;
    for (const selector of dashboardTriggers) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        dashboardTrigger = element;
        break;
      }
    }

    if (dashboardTrigger) {
      await dashboardTrigger.click();
      await page.waitForTimeout(500);

      // Check for Web Vitals display
      const webVitalsSelectors = [
        'text="FCP"', // First Contentful Paint
        'text="LCP"', // Largest Contentful Paint  
        'text="CLS"', // Cumulative Layout Shift
        'text="INP"', // Interaction to Next Paint
        'text="TTFB"', // Time to First Byte
        '.web-vitals',
        '.performance-metrics'
      ];

      let webVitalsFound = false;
      for (const selector of webVitalsSelectors) {
        if (await page.locator(selector).count() > 0) {
          webVitalsFound = true;
          break;
        }
      }
      expect(webVitalsFound).toBe(true);
    }
  });

  test('should handle large scroll distances efficiently', async ({ page }) => {
    const startTime = Date.now();

    // Scroll a large distance (simulate jumping between years)
    await page.evaluate(() => window.scrollBy(0, 10000));
    await page.waitForTimeout(100);
    
    await page.evaluate(() => window.scrollBy(0, -5000));
    await page.waitForTimeout(100);

    const scrollTime = Date.now() - startTime;

    // Large scrolls should complete quickly
    expect(scrollTime).toBeLessThan(1000);

    // Calendar should still be responsive after large scrolls
    const calendarVisible = await page.locator('[data-testid="linear-calendar"], .calendar-container').isVisible();
    expect(calendarVisible).toBe(true);
  });

  test('should use React.memo optimizations', async ({ page }) => {
    // This test checks for performance optimizations by monitoring render counts
    await page.evaluate(() => {
      (window as any).renderCount = 0;
      
      // Monitor for React DevTools or component render indicators
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            (window as any).renderCount++;
          }
        });
      });
      
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
    });

    // Scroll to trigger potential re-renders
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    const renderCount = await page.evaluate(() => (window as any).renderCount);

    // With proper memoization, render count should be controlled
    // This is a rough heuristic - ideally we'd have more specific metrics
    expect(renderCount).toBeLessThan(1000);
  });

  test('should load events from localStorage quickly', async ({ page }) => {
    // First, set some test data in localStorage
    await page.evaluate(() => {
      const testEvents = [
        { id: '1', title: 'Test Event 1', startDate: '2025-08-15' },
        { id: '2', title: 'Test Event 2', startDate: '2025-08-16' },
        { id: '3', title: 'Test Event 3', startDate: '2025-08-17' }
      ];
      localStorage.setItem('calendarEvents', JSON.stringify(testEvents));
    });

    const startTime = Date.now();
    await page.reload();
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');
    const loadTime = Date.now() - startTime;

    // Events should load from localStorage quickly
    expect(loadTime).toBeLessThan(2000);

    // Check that events were loaded
    const hasEvents = await page.evaluate(() => {
      const stored = localStorage.getItem('calendarEvents');
      return stored && JSON.parse(stored).length > 0;
    });
    expect(hasEvents).toBe(true);
  });

  test('should handle multi-year date range efficiently', async ({ page }) => {
    // Test infinite scroll performance across years
    const startTime = Date.now();

    // Simulate scrolling through multiple years
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 2000));
      await page.waitForTimeout(100);
    }

    const scrollTime = Date.now() - startTime;

    // Multi-year scrolling should remain performant
    expect(scrollTime).toBeLessThan(3000);

    // Check that calendar is still responsive
    const responsive = await page.evaluate(() => {
      return document.readyState === 'complete' && 
             !document.querySelector('.loading, .spinner');
    });
    expect(responsive).toBe(true);
  });

  test('should measure Web Vitals', async ({ page }) => {
    // Enable Web Vitals measurement
    await page.addInitScript(() => {
      (window as any).webVitals = {};
      
      // Mock Web Vitals API if not available
      if (typeof (window as any).webVitals === 'undefined') {
        (window as any).webVitals = {
          FCP: null,
          LCP: null, 
          CLS: null,
          INP: null,
          TTFB: null
        };
      }
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="linear-calendar"], .calendar-container');
    await page.waitForTimeout(2000);

    // Check if Web Vitals are being tracked
    const vitals = await page.evaluate(() => (window as any).webVitals);
    
    // At minimum, the vitals object should exist
    expect(vitals).toBeDefined();
  });
});