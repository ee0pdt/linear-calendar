# Linear Calendar E2E Tests

This directory contains Playwright end-to-end tests for the Linear Calendar application, covering critical user journeys and functionality.

## Test Structure

### 🎯 Critical User Journey Tests

1. **Core Navigation Journey** (`core-navigation.spec.ts`)
   - Calendar loading and today highlighting
   - "Jump to Today" functionality
   - Smooth scrolling across multi-year ranges
   - Month header display
   - Navigation modal interactions
   - Weekend styling and past day indicators

2. **Event Management Journey** (`event-management.spec.ts`)
   - ICS file import and event display
   - Event search functionality
   - Event details modal interactions
   - Location map link generation
   - CalDAV integration (when available)
   - Recurring event indicators
   - Event emoji detection
   - Event tooltips

3. **Performance Journey** (`performance.spec.ts`)
   - Instant calendar loading with virtualization
   - 60fps scrolling performance validation
   - Performance dashboard monitoring
   - Large scroll distance handling
   - React.memo optimization verification
   - localStorage event loading speed
   - Multi-year range efficiency
   - Web Vitals measurement

4. **Mobile Responsive Journey** (`mobile-responsive.spec.ts`)
   - Mobile viewport compatibility
   - Touch scrolling interactions
   - Mobile navigation usability
   - Event display on mobile
   - Modal interactions on mobile
   - Tablet viewport testing
   - Orientation change handling
   - Text readability on mobile
   - Touch event interactions

5. **Print Functionality Journey** (`print-functionality.spec.ts`)
   - Print media query activation
   - Interactive element hiding in print
   - 4 A4 page formatting validation
   - Black and white print readability
   - Calendar structure preservation
   - School holiday print display
   - Current day highlighting removal
   - Event information preservation
   - Print layout spacing
   - PDF generation testing

6. **Complete User Journeys** (`user-journeys.spec.ts`)
   - ADHD user planning workflow
   - Time management visualization
   - Print preparation workflow
   - Mobile planning on-the-go
   - Performance-sensitive user journey
   - Accessibility-focused user journey

## Test Data & Fixtures

- **`fixtures/testData.ts`** - Sample ICS content, test events, and UI selectors
- **Test Events** - Meeting, birthday, gym session, vacation events
- **Test Dates** - Current, past, future, and specific event dates
- **UI Selectors** - Centralized element selectors for maintainability

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug

# Run both unit and E2E tests
npm run test:all
```

## Test Configuration

- **Auto-start dev server** on `http://localhost:3000`
- **Multi-browser testing** (Chrome, Firefox, Safari)
- **Automatic retries** on CI environments
- **Trace collection** on first retry for debugging
- **HTML reporting** for test results

## Key Features Tested

### 🚀 Performance Optimizations
- TanStack Virtual rendering (~15 visible days vs 1000+)
- Instant loading regardless of event count
- Smooth 60fps scrolling across multi-year ranges
- Web Vitals monitoring (FCP, LCP, CLS, INP, TTFB)

### 📱 Multi-Device Support  
- Responsive design on mobile (375px) and tablet (768px)
- Touch-friendly interactions
- Orientation change handling
- Print optimization for 4 A4 pages

### 🎨 ADHD-Friendly Features
- Clear today highlighting
- Past day checkmarks
- Weekend italic styling
- School holiday badges
- Visual time management aids

### 📅 Calendar Integration
- ICS file import with multi-year support
- Live CalDAV integration for Apple Calendar
- Recurring event handling with RRULE parsing
- Event search across all dates
- Location-based map links

## Browser Support

Tests run on:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)  
- **Webkit** (Desktop Safari)

Mobile browser testing can be enabled by uncommenting the mobile configurations in `playwright.config.ts`.

## Test Strategy

These tests focus on **user journeys** rather than isolated component testing:

1. **Critical Path Coverage** - All essential user workflows are tested
2. **Performance Validation** - Ensures the app meets performance requirements
3. **Cross-Browser Compatibility** - Validates functionality across browsers
4. **Accessibility Compliance** - Basic accessibility checks included
5. **Real User Scenarios** - Tests simulate actual user behavior patterns

## Debugging Failed Tests

1. **HTML Reports** - Check `playwright-report/` for detailed results
2. **Traces** - Inspect traces for failed tests in the report
3. **Screenshots** - Failure screenshots are automatically captured
4. **Debug Mode** - Use `npm run test:e2e:debug` for step-by-step debugging
5. **UI Mode** - Use `npm run test:e2e:ui` for interactive test running

## Maintenance

- **Selector Updates** - Update `fixtures/testData.ts` when UI changes
- **Test Data** - Modify sample ICS content as needed for new features
- **Browser Coverage** - Adjust browser configurations in `playwright.config.ts`
- **Performance Thresholds** - Update timing expectations in performance tests as needed

These tests ensure the Linear Calendar delivers a fast, reliable, and user-friendly experience across all supported platforms and use cases.