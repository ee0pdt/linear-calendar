# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (runs Vite build + TypeScript compilation)
- `npm run test` - Run Vitest tests
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run check` - Auto-fix with Prettier and ESLint

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
- Recurring event handling with RRULE parsing
- All-day event detection and proper display
- Timezone-aware event processing
- Auto-refresh with configurable intervals

## Project Structure

### Key Components
- `src/components/CalendarGrid.tsx` - Main calendar component displaying all 365 days
- `src/components/CalendarDay.tsx` - Individual day component with events
- `src/components/CalendarMonth.tsx` - Month separator with headers
- `src/components/Header.tsx` - Top navigation with import controls
- `src/components/ImportControls.tsx` - File upload and CalDAV connection UI
- `src/components/AutoRefreshIndicator.tsx` - Shows live refresh status
- `src/components/TimeRings/` - Time visualization components (day, week, month, year rings)

### Key Utilities
- `src/utils/dateUtils.ts` - Date calculations and formatting
- `src/utils/eventUtils.ts` - Event processing and sorting
- `src/utils/icsParser.ts` - ICS file parsing for calendar imports
- `src/utils/recurrenceUtils.ts` - Recurring event expansion
- `src/utils/holidayUtils.ts` - UK school holiday data
- `src/utils/storageUtils.ts` - Local storage management

### Key Hooks
- `src/hooks/useEvents.ts` - Event state management
- `src/hooks/useCalDAVImport.ts` - CalDAV connection handling
- `src/hooks/useAutoRefresh.ts` - Automatic refresh functionality
- `src/hooks/useScrollToToday.ts` - Navigation to current date

## Application Features

This is a specialized calendar application for ADHD-friendly time management:

### Core Features
- **Linear 365-day view** - All days of the year displayed vertically
- **Print optimization** - Formats to 4 A4 pages for wall mounting
- **Live Apple Calendar integration** - Real-time event synchronization
- **ICS file import** - Alternative to live calendar connection
- **UK school holidays** - Built-in holiday data for planning
- **Auto-refresh** - Configurable intervals for live updates
- **Timezone support** - Configurable timezone handling
- **Verse of the day** - Daily inspirational content

### Visual Design
- **Past days** - Automatically marked with green checkmarks
- **Today highlight** - Current day prominently displayed
- **Weekend styling** - Italicized Saturday/Sunday
- **School holidays** - Special border and emoji indicators
- **Event display** - Inline with times for scheduled events
- **Print CSS** - Optimized black and white printing
