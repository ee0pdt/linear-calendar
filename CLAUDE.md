# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (runs Vite build + TypeScript compilation)
- `npm run test` - Run Vitest tests
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run check` - Auto-fix with Prettier and ESLint

**IMPORTANT: Testing Requirements**
- **Always run tests before committing**: Use `npm run test` to ensure all tests pass
- **Add tests for new functionality**: When adding features or fixing bugs, include appropriate test coverage
- **Update existing tests**: When modifying components or hooks, ensure tests reflect the changes
- **Test both unit and integration**: Tests are located in `src/__tests__/` with subdirectories for `components/`, `hooks/`, `utils/`, and `integration/`

## Git Workflow and Branch Management

**IMPORTANT**: When implementing new features or fixing bugs, always use feature branches:

1. **Check Current Branch**: Before starting work, verify you're not on `main`
   ```bash
   git branch --show-current
   ```

2. **Create Feature Branch**: If on `main` or need a new branch for your work
   ```bash
   git checkout -b feature-name  # e.g., feature-name, fix-bug-name, etc.
   ```

3. **Work and Commit**: Make your changes and commit to the feature branch
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

4. **Push and Create PR**: Push the branch and create a pull request
   ```bash
   git push origin feature-name
   ```

5. **Merge**: Only merge to `main` after code review via pull request

**Branch Naming Convention**:
- `feature-*` for new features (e.g., `feature-event-details`)
- `fix-*` for bug fixes (e.g., `fix-calendar-scroll`)
- `update-*` for updates/improvements (e.g., `update-performance`)

**Never commit directly to `main`** - always use feature branches for development work.

## Architecture

This is a React application built with:

- **Vite** as the build tool and dev server
- **TanStack Router** for file-based routing with automatic code splitting
- **Tailwind CSS v4** for styling
- **TypeScript** with strict mode enabled
- **Vitest** for testing with jsdom environment

### Key Architecture Points

- **File-based routing**: Routes are defined as files in `src/routes/` directory
- **Route tree generation**: TanStack Router automatically generates `routeTree.gen` from route files
- **Layout system**: Root layout is in `src/routes/__root.tsx` with `<Outlet />` for route content
- **Type safety**: Router instance is registered globally for TypeScript inference
- **Path aliases**: `@/*` maps to `./src/*` for imports

### Router Configuration

The router is configured with:

- Intent-based preloading
- Scroll restoration
- Structural sharing enabled
- Zero preload stale time

### Testing Setup

- Uses Vitest with jsdom environment
- Testing utilities: `@testing-library/react` and `@testing-library/dom`
- Global test configuration in `vite.config.js`
- Test files organized in `src/__tests__/` with subdirectories for components, utils, and integration tests
- Mock fixtures in `src/__tests__/fixtures/` for testing with sample data
- Component tests include EventSearch and EventDetailsModal with map link functionality

### Performance Architecture

This application features comprehensive performance optimization and monitoring:

- **Web Vitals monitoring** with real-time console logging (FCP, LCP, CLS, INP, TTFB)
- **Performance dashboard** accessible via blue activity icon (top-right corner)
- **React.memo optimization** for CalendarMonth and CalendarDay components
- **useMemo optimization** for expensive date calculations and event processing
- **Progressive loading system** with branded 5-stage initialization
- **Custom performance timers** for modal interactions and page load tracking
- **Memoized component architecture** prevents unnecessary re-renders

## CalDAV Integration Architecture

This application features a sophisticated CalDAV integration for live Apple Calendar synchronization:

### CalDAV Proxy Server

- **Express.js backend** in `caldav-proxy/` directory
- **Tech stack**: Express, tsdav, ical, cors
- **Purpose**: Handles Apple Calendar authentication and data fetching via CalDAV protocol
- **Deployment**: Configured for Railway with health checks

### Key CalDAV Files

- `caldav-proxy/server.js` - Main proxy server handling CalDAV requests
- `src/utils/caldavUtils.ts` - Client-side CalDAV utility functions
- `src/hooks/useCalDAVImport.ts` - React hook for CalDAV imports
- `src/hooks/useAutoRefresh.ts` - Auto-refresh functionality for live updates

### CalDAV Proxy Commands

- `cd caldav-proxy && npm install` - Install proxy dependencies
- `cd caldav-proxy && npm run dev` - Start proxy in development mode
- `cd caldav-proxy && npm start` - Start proxy in production mode

### CalDAV Configuration

- **Development**: Proxy runs on port 3001, UI on port 3000
- **Production**: Environment variable `CALDAV_PROXY_URL` points to deployed proxy
- **Authentication**: Uses Apple app-specific passwords for secure access
- **Timezone**: Defaults to Europe/London, configurable via UI

### CalDAV Features

- Multi-calendar support with statistics
- Recurring event handling with RRULE parsing across multiple years
- All-day event detection and proper display
- Timezone-aware event processing
- Auto-refresh with configurable intervals
- Multi-year event support (2024, 2025, 2026+)

## Project Structure

### Key Components

- `src/components/CalendarGrid.tsx` - Main calendar component with infinite scroll and multi-year support (memoized)
- `src/components/CalendarDay.tsx` - Individual day component with events (memoized with performance optimizations)
- `src/components/CalendarMonth.tsx` - Month separator with headers (memoized)
- `src/components/Header.tsx` - Top navigation with import controls
- `src/components/ImportControls.tsx` - File upload and CalDAV connection UI (supports multi-year imports)
- `src/components/EventSearch.tsx` - Event search modal with filtering and scroll-to-event functionality
- `src/components/EventDetailsModal.tsx` - Event details display with location map links
- `src/components/AutoRefreshIndicator.tsx` - Shows live refresh status
- `src/components/TimeRings/` - Time visualization components (day, week, month, year rings)
- `src/components/PerformanceDashboard.tsx` - Real-time performance metrics display
- `src/components/LoadingIndicator.tsx` - Progressive loading with branded experience

### Key Utilities

- `src/utils/dateUtils.ts` - Date calculations and formatting (supports multi-year ranges)
- `src/utils/eventUtils.ts` - Event processing and sorting
- `src/utils/icsParser.ts` - ICS file parsing for calendar imports (supports multi-year processing)
- `src/utils/recurrenceUtils.ts` - Recurring event expansion across multiple years
- `src/utils/holidayUtils.ts` - UK school holiday data (2024, 2025, 2026+)
- `src/utils/storageUtils.ts` - Local storage management
- `src/reportWebVitals.ts` - Enhanced Web Vitals monitoring with performance tracking

### Key Hooks

- `src/hooks/useEvents.ts` - Event state management
- `src/hooks/useCalDAVImport.ts` - CalDAV connection handling (supports multi-year imports)
- `src/hooks/useAutoRefresh.ts` - Automatic refresh functionality (supports multi-year range)
- `src/hooks/useScrollToToday.ts` - Navigation to current date across any year
- `src/hooks/useInfiniteScroll.ts` - Infinite scroll functionality for multi-year support
- `src/hooks/usePerformanceTracking.ts` - Performance monitoring and timing utilities
- `src/hooks/useModalPerformance.ts` - Modal interaction performance tracking

## Application Features

This is a specialized calendar application for ADHD-friendly time management:

### Core Features

- **Multi-year linear view** - Infinite scroll through 2024, 2025, 2026+ with all days displayed vertically
- **Event search** - Fast search across all events by title, description, or location with scroll-to-date functionality
- **Smart location links** - Automatic Apple Maps and Google Maps links generated from event locations
- **Print optimization** - Formats to 4 A4 pages for wall mounting
- **Live Apple Calendar integration** - Real-time event synchronization across all years
- **ICS file import** - Alternative to live calendar connection (supports multi-year processing)
- **UK school holidays** - Built-in holiday data for planning (2024-2026+)
- **Auto-refresh** - Configurable intervals for live updates across full date range
- **Timezone support** - Configurable timezone handling
- **Verse of the day** - Daily inspirational content
- **Infinite scroll** - Dynamic year range expansion as user scrolls
- **Future year support** - Events and recurring events work correctly for 2026+

### Visual Design

- **Past days** - Automatically marked with green checkmarks
- **Today highlight** - Current day prominently displayed
- **Weekend styling** - Italicized Saturday/Sunday
- **School holidays** - Special border and emoji indicators
- **Event display** - Inline with times for scheduled events
- **Print CSS** - Optimized black and white printing

## Multi-Year Architecture

The calendar supports infinite scroll across multiple years with the following architecture:

### Date Range Management

- **Initial Load**: Starts with `currentYear ± 1` (e.g., 2024 shows 2023-2025)
- **Infinite Scroll**:
  - Scrolling near top adds `startYear - 1`
  - Scrolling near bottom adds `endYear + 1`
- **Jump to Today**: Expands range to include current year if not already loaded
- **Navigation**: Expands range to include any selected year

### Event Processing

- **CalDAV Imports**: `importFromCalDAV(credentials, startYear, endYear)` processes events for full displayed range
- **ICS File Processing**: `parseICSFile(content, startYear, endYear)` handles multi-year imports
- **Recurring Events**: `expandRecurringEvent(event, startYear, endYear)` generates occurrences across all years
- **Auto-refresh**: Uses current date range for live updates

### Key Files for Multi-Year Support

- `src/routes/index.tsx` - Main date range state management with infinite scroll
- `src/utils/icsParser.ts` - Multi-year ICS file processing
- `src/utils/caldavUtils.ts` - Multi-year CalDAV import processing
- `src/utils/recurrenceUtils.ts` - Multi-year recurring event expansion
- `src/hooks/useInfiniteScroll.ts` - Infinite scroll implementation
- `src/hooks/useScrollToToday.ts` - Cross-year navigation
