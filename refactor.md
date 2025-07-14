# Linear Calendar Refactoring Plan

## Overview

The current `src/routes/index.tsx` file is 1,140 lines and contains everything from data processing to UI components. This plan breaks it down into maintainable, reusable components and utilities.

## ✅ Progress Status

### Phase 0: Pre-refactor Testing ✅ COMPLETED

- [x] Created comprehensive test suite using Vitest
- [x] Fixed all test runner configuration issues
- [x] All utility tests passing (33/33 tests)
- [x] Component tests created (failing as expected before refactor)

### Phase 1: Utility Extraction ✅ COMPLETED

- [x] Extracted and refactored all utility functions from index.tsx
- [x] Created `/src/utils/` with 8 utility modules
- [x] Created `/src/types/index.ts` with proper TypeScript types
- [x] Created `/src/constants/index.ts` with constants
- [x] All utilities fully tested and passing
- [x] Fixed emoji utility logic and keyword priority issues

### Phase 1.5: Component Creation 🚧 IN PROGRESS

- [x] Created `ImportControls.tsx` component with proper typing
- [x] Created `CalendarHeader.tsx` component
- [x] Created `DayDisplay.tsx` component with event rendering
- [ ] Next: Integrate components into main index.tsx file
- [ ] Update main LinearCalendar component to use new modular structure

### Remaining Phases:

- **Phase 2**: Extract remaining components and integrate
- **Phase 3**: Create custom hooks for state management
- **Phase 4**: Optimize and add advanced features
- **Phase 5**: Final testing and cleanup

## Proposed Structure

```
src/
├── components/
│   ├── calendar/
│   │   ├── CalendarContainer.tsx          # Main calendar wrapper
│   │   ├── CalendarHeader.tsx             # Title and year display
│   │   ├── MonthSection.tsx               # Month header and days container
│   │   ├── DayEntry.tsx                   # Individual day row component
│   │   ├── EventDisplay.tsx               # Event badge/time display
│   │   └── JumpToTodayButton.tsx          # Floating action button
│   ├── import/
│   │   ├── ImportSection.tsx              # Container for all import options
│   │   ├── CalDAVImport.tsx               # Live calendar import form
│   │   ├── FileImport.tsx                 # ICS file upload
│   │   └── ImportStatus.tsx               # Import status and clear data
│   └── ui/
│       ├── Badge.tsx                      # Reusable badge component
│       ├── Button.tsx                     # Reusable button component
│       └── Input.tsx                      # Reusable input component
├── hooks/
│   ├── useCalendarEvents.tsx              # Event management state
│   ├── useCalDAVImport.tsx                # CalDAV import logic
│   ├── useLocalStorage.tsx                # Generic localStorage hook
│   └── useScrollToToday.tsx               # Scroll to today functionality
├── utils/
│   ├── dateUtils.ts                       # Date formatting and calculations
│   ├── holidayUtils.ts                    # School holiday logic
│   ├── emojiUtils.ts                      # Event emoji mapping
│   ├── icsParser.ts                       # ICS file parsing
│   ├── recurrenceUtils.ts                 # Recurring event expansion
│   └── eventUtils.ts                      # Event filtering and display
├── types/
│   └── calendar.ts                        # TypeScript interfaces
└── constants/
    └── calendar.ts                        # Storage keys, holidays, etc.
```

## Phase 1: Extract Types and Constants (Low Risk)

### 1.1 Create Types

- `src/types/calendar.ts`
  - `CalendarEvent` interface
  - `RecurrenceRule` interface
  - `ImportInfo` interface
  - `CalDAVCredentials` interface

### 1.2 Create Constants

- `src/constants/calendar.ts`
  - Storage keys (`STORAGE_KEY`, `IMPORT_INFO_KEY`, `CREDENTIALS_KEY`)
  - School holidays array
  - Day and month names

## Phase 2: Extract Utility Functions (Low Risk)

### 2.1 Date Utilities

- `src/utils/dateUtils.ts`
  - `generateYearDays(year: number): Date[]`
  - `formatDate(date: Date)`
  - `isToday(date: Date): boolean`
  - `isPastDay(date: Date): boolean`
  - `isFirstOfMonth(date: Date): boolean`
  - `isWeekend(date: Date): boolean`
  - `parseICSDate(dateStr: string): Date`

### 2.2 Holiday Utilities

- `src/utils/holidayUtils.ts`
  - `isSchoolHoliday(date: Date): boolean`
  - `getSchoolHolidayInfo(date: Date)`

### 2.3 Emoji Utilities

- `src/utils/emojiUtils.ts`
  - `getEventEmoji(title: string): string`

### 2.4 ICS Parser

- `src/utils/icsParser.ts`
  - `parseICSFile(icsContent: string): CalendarEvent[]`

### 2.5 Recurrence Utilities

- `src/utils/recurrenceUtils.ts`
  - `parseRRule(rrule: string): RecurrenceRule`
  - `expandRecurringEvent(baseEvent: CalendarEvent, year: number): CalendarEvent[]`

### 2.6 Event Utilities

- `src/utils/eventUtils.ts`
  - `getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[]`
  - `getEventDisplayForDate(event: CalendarEvent, date: Date): string`

## Phase 3: Extract Custom Hooks (Medium Risk)

### 3.1 Local Storage Hook

- `src/hooks/useLocalStorage.tsx`
  - Generic hook for localStorage operations
  - Type-safe get/set operations
  - Error handling

### 3.2 Calendar Events Hook

- `src/hooks/useCalendarEvents.tsx`
  - Event state management
  - Loading/saving events
  - Import info state

### 3.3 CalDAV Import Hook

- `src/hooks/useCalDAVImport.tsx`
  - CalDAV credentials state
  - Import loading state
  - Import functionality

### 3.4 Scroll to Today Hook

- `src/hooks/useScrollToToday.tsx`
  - Ref management
  - Scroll functionality

## Phase 4: Extract UI Components (Medium Risk)

### 4.1 Basic UI Components

- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Badge.tsx`

### 4.2 Import Components

- `src/components/import/FileImport.tsx`
  - File upload input
  - File handling logic
- `src/components/import/CalDAVImport.tsx`
  - Credentials form
  - Import button and logic
- `src/components/import/ImportStatus.tsx`
  - Status display
  - Clear data button
- `src/components/import/ImportSection.tsx`
  - Container for all import components

### 4.3 Calendar Components

- `src/components/calendar/EventDisplay.tsx`
  - Event badge rendering
  - Time display logic
- `src/components/calendar/DayEntry.tsx`
  - Individual day row
  - Events integration
- `src/components/calendar/MonthSection.tsx`
  - Month header
  - Days container
- `src/components/calendar/CalendarHeader.tsx`
  - Title and year
- `src/components/calendar/JumpToTodayButton.tsx`
  - Floating action button
- `src/components/calendar/CalendarContainer.tsx`
  - Main container component

## Phase 5: Refactor Main Component (High Risk)

### 5.1 Simplified Index Component

- Use extracted hooks for state management
- Compose UI from smaller components
- Minimal logic, mostly orchestration

## Benefits After Refactoring

### 1. **Maintainability**

- Smaller, focused files (50-150 lines each)
- Single responsibility principle
- Easier to locate and modify functionality

### 2. **Testability**

- Individual utilities can be unit tested
- Components can be tested in isolation
- Hooks can be tested independently

### 3. **Reusability**

- UI components can be reused across the app
- Utilities can be imported where needed
- Hooks can be shared between components

### 4. **Developer Experience**

- Better IntelliSense and autocomplete
- Clearer file structure
- Easier onboarding for new developers

### 5. **Performance**

- Better tree-shaking potential
- Smaller bundle sizes for unused code
- More opportunities for React optimization

## Implementation Strategy

### Recommended Order

1. **Phase 0** (Pre-Refactor Tests) - Create comprehensive test suite first
2. **Phase 1** (Types & Constants) - Start here, lowest risk
3. **Phase 2** (Utilities) - Pure functions, easy to test
4. **Phase 3** (Hooks) - Extract state logic
5. **Phase 4** (Components) - Break down UI
6. **Phase 5** (Main Component) - Final orchestration

### Risk Mitigation

- Keep original file as backup during refactoring
- Implement one phase at a time
- Test thoroughly after each phase
- Use TypeScript to catch breaking changes
- Consider feature flags for major changes

## Pre-Refactor Testing Strategy (Phase 0)

Before we start refactoring, we need to create comprehensive tests that capture the current behavior. This will serve as our safety net during the refactoring process.

### Current Testing Setup ✅

- Vitest already configured in `vite.config.js`
- React Testing Library available
- JSDOM environment ready
- Test script: `npm test`

### Phase 0: Create Baseline Tests

#### 0.1 Utility Function Tests

Create tests for all the pure functions currently embedded in the main component:

**`src/__tests__/utils/dateUtils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
// Test functions we'll extract:
// - generateYearDays()
// - formatDate()
// - isToday()
// - isPastDay()
// - isWeekend()
// - parseICSDate()
```

**`src/__tests__/utils/holidayUtils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
// Test functions:
// - isSchoolHoliday()
// - getSchoolHolidayInfo()
```

**`src/__tests__/utils/emojiUtils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
// Test function:
// - getEventEmoji()
```

**`src/__tests__/utils/icsParser.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
// Test functions:
// - parseICSFile()
// - parseICSDate()
```

**`src/__tests__/utils/recurrenceUtils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
// Test functions:
// - parseRRule()
// - expandRecurringEvent()
```

**`src/__tests__/utils/eventUtils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
// Test functions:
// - getEventsForDate()
// - getEventDisplayForDate()
```

#### 0.2 Component Integration Tests

**`src/__tests__/components/LinearCalendar.test.tsx`**

- Test calendar rendering with different years
- Test event display
- Test holiday highlighting
- Test import functionality
- Test today highlighting
- Test past day marking

#### 0.3 Test Data Setup

**`src/__tests__/fixtures/`**

- Sample ICS files for testing
- Mock calendar events
- Test date ranges

### Test Implementation Priority

1. **Utility Functions** (2-3 hours)
   - Start with pure functions - easiest to test
   - High test coverage for date/holiday/emoji logic
   - Create comprehensive test cases

2. **ICS Parser** (1-2 hours)
   - Test with real-world ICS examples
   - Edge cases (malformed files, different formats)
   - Recurring event expansion

3. **Main Component** (2-3 hours)
   - Smoke tests to ensure rendering
   - Event display accuracy
   - Import workflows

### Test Files to Create

```
src/
├── __tests__/
│   ├── utils/
│   │   ├── dateUtils.test.ts
│   │   ├── holidayUtils.test.ts
│   │   ├── emojiUtils.test.ts
│   │   ├── icsParser.test.ts
│   │   ├── recurrenceUtils.test.ts
│   │   └── eventUtils.test.ts
│   ├── components/
│   │   └── LinearCalendar.test.tsx
│   └── fixtures/
│       ├── sampleEvents.ts
│       ├── sampleIcs.ts
│       └── mockDates.ts
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- dateUtils.test.ts
```

### Benefits of Pre-Refactor Testing

1. **Confidence**: Know that refactoring preserves behavior
2. **Documentation**: Tests serve as specification for current behavior
3. **Regression Prevention**: Catch breaking changes immediately
4. **Faster Development**: Quick feedback loop during refactoring

## Post-Refactor Testing Strategy

### Unit Tests

- All utility functions in `utils/`
- Custom hooks with React Testing Library
- Component testing for UI components

### Integration Tests

- Full calendar rendering
- Import functionality
- Event display accuracy

### E2E Tests

- File import workflow
- CalDAV import workflow
- Calendar navigation and interaction

## Future Enhancements Made Easier

With this structure, future features become much easier:

- **Multiple calendar views** (weekly, monthly, etc.)
- **Event editing** - contained in event utilities
- **Different holiday sets** - pluggable holiday providers
- **Theming** - isolated UI components
- **Mobile responsiveness** - component-level optimization
- **Performance optimization** - targeted at specific components

## Estimated Timeline

- **Phase 1**: 1-2 hours
- **Phase 2**: 4-6 hours
- **Phase 3**: 3-4 hours
- **Phase 4**: 6-8 hours
- **Phase 5**: 2-3 hours
- **Testing**: 4-6 hours

**Total**: ~20-30 hours of focused development time

## Files to Create

This refactoring will result in approximately 25-30 new files, replacing the single 1,140-line monster with a clean, maintainable structure.
