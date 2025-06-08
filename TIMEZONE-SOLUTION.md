# Timezone Configuration for Linear Calendar

This document explains how to handle timezone issues when deploying the Linear Calendar to servers that may be in different timezones.

## The Problem

When you run the calendar locally, it uses your local machine's timezone (London/UK). However, when deployed to a server, the server might be running in UTC or a different timezone, causing events to appear shifted by the timezone offset (e.g., 1 hour).

## The Solution

I've implemented a comprehensive timezone handling system with two approaches:

### Option 1: UI Timezone Selector (Recommended)

The calendar now includes a timezone selector in the header that allows users to choose their preferred timezone. This is the most flexible solution as it:

- Allows users from different timezones to use the calendar
- Persists the timezone preference in localStorage
- Automatically refreshes the calendar when timezone changes
- Defaults to London (Europe/London) timezone

**Available timezones:**

- London (GMT/BST) - Default
- New York (EST/EDT)
- Los Angeles (PST/PDT)
- Paris (CET/CEST)
- Tokyo (JST)
- Sydney (AEST/AEDT)
- UTC

### Option 2: Hard-coded Timezone

If you prefer to hard-code the timezone for your specific use case, you can modify the `DEFAULT_TIMEZONE` constant in `src/constants/index.ts`:

```typescript
export const DEFAULT_TIMEZONE = 'Europe/London' // Change this to your preferred timezone
```

## What Was Changed

### 1. New Files Added:

- `src/utils/timezoneUtils.ts` - Core timezone handling functions
- `src/components/TimezoneSelect.tsx` - UI component for timezone selection

### 2. Modified Files:

- `src/constants/index.ts` - Added timezone configuration
- `src/utils/dateUtils.ts` - Updated to use timezone-aware functions
- `src/utils/caldavUtils.ts` - Updated CalDAV imports to respect timezone
- `src/routes/index.tsx` - Added timezone selector to header
- `src/styles.css` - Added styling for timezone selector
- `src/utils/index.ts` - Export timezone utilities

### 3. Key Functions:

#### `getUserTimezone()` & `setUserTimezone(timezone)`

- Get/set user's timezone preference from localStorage

#### `getCurrentDateInTimezone(timezone?)`

- Get current date/time in the specified timezone

#### `parseICSDateWithTimezone(dateStr, timezone?)`

- Parse ICS dates while respecting timezone

#### `isToday()` & `isPastDay()`

- Updated to be timezone-aware

## How It Works

1. **Timezone Detection**: On first load, defaults to London timezone
2. **Persistent Storage**: User's timezone choice is saved in localStorage
3. **Date Processing**: All date comparisons and formatting use the selected timezone
4. **Event Parsing**: ICS files and CalDAV imports respect the timezone setting
5. **UI Updates**: Changing timezone refreshes the calendar to show correct times

## Usage

### For End Users:

1. Look for the "Timezone:" selector in the calendar header
2. Select your preferred timezone from the dropdown
3. The calendar will refresh and show events in your timezone

### For Developers:

```typescript
import {
  getUserTimezone,
  setUserTimezone,
  getCurrentDateInTimezone,
} from './utils/timezoneUtils'

// Get current timezone
const userTz = getUserTimezone() // 'Europe/London'

// Set a new timezone
setUserTimezone('America/New_York')

// Get current time in user's timezone
const now = getCurrentDateInTimezone()
```

## Testing

To test the timezone functionality:

1. **Local Testing**: Use the timezone selector to switch between timezones and verify events display correctly
2. **Server Testing**: Deploy to your server and verify the timezone selector works as expected
3. **Import Testing**: Import events via file or CalDAV and verify they appear at the correct times

## Benefits

- ✅ Solves timezone shift issues when deploying to servers
- ✅ Provides flexibility for users in different timezones
- ✅ Maintains backward compatibility
- ✅ Persists user preferences
- ✅ Works with both file imports and CalDAV

The timezone selector approach is recommended as it provides the most flexibility while solving the core deployment timezone issue.
