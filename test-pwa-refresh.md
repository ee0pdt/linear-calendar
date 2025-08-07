# Testing PWA Date Refresh

## How to Test the PWA Date Refresh Fix

### 1. Simulating the "Next Day" Scenario (Recommended Test)

This test simulates returning to the app after a day has passed:

1. **Set the app to yesterday**: 
   - Open: http://localhost:3000?testDate=2025-08-06 (or any past date)
   - The calendar will show August 6 as "today" with a yellow TEST MODE banner
   
2. **Switch to another tab/window** for a few seconds

3. **Return to the calendar tab**:
   - The test date will automatically clear
   - The calendar will refresh to show the REAL current date
   - Check console for: `[usePageRefresh] Clearing test date and returning to real date`
   - The yellow TEST MODE banner will disappear
   - Today's actual date will be highlighted

This perfectly simulates the real-world PWA scenario where you open the app the next day!

### 2. Test Different Dates

You can test with any date to see how the app behaves:

- **Yesterday**: `?testDate=2025-08-06` - Most realistic test
- **Last week**: `?testDate=2025-08-01` - See more dramatic updates
- **Last month**: `?testDate=2025-07-01` - Test month transitions
- **Future date**: `?testDate=2025-12-25` - Test future scenarios

### 3. How the Auto-Refresh Works

The app now automatically refreshes when:
- The page becomes visible after being hidden
- The window regains focus 
- The page is restored from browser cache
- Every minute while the page is visible

In test mode, returning focus will:
1. Clear the test date from the URL
2. Force a refresh to show the real current date
3. Update all visual indicators (today highlight, past day checkmarks)

### 3. Test PWA Behavior

1. Install as PWA:
   - In Chrome/Edge: Click the install icon in the address bar
   - Or use the browser menu: "Install Linear Calendar..."

2. Close the PWA completely

3. Use test mode to verify behavior:
   - Open PWA with test parameter in the URL
   - The PWA should show the test date as "today"

4. Real-world testing:
   - Open PWA at end of day
   - Leave it open overnight
   - Check in the morning - it should update to the new date when you return to it

## What Was Fixed

1. **Page Visibility Detection**: Added `usePageRefresh` hook that listens for:
   - `visibilitychange` events
   - `focus` events  
   - `pageshow` events (for back-forward cache)
   - Periodic checks every minute

2. **Force Re-render**: When date changes are detected:
   - Updates a refresh key that forces CalendarGrid to re-render
   - This causes all day components to recalculate `isToday`

3. **Test Mode**: Added ability to override current date via URL parameter for easy testing

## Console Logs

When testing, you'll see these logs in the console:
- `[usePageRefresh] Page became visible` - When returning to the tab
- `[usePageRefresh] Window focused` - When window gains focus
- `[usePageRefresh] Date changed from [date] to [date]` - When date change detected
- `[TEST MODE] Using test date: [date]` - When using test mode

## Files Changed

- `src/hooks/usePageRefresh.ts` - New hook for page visibility detection
- `src/utils/testDateUtils.ts` - Test date override utilities
- `src/utils/dateUtils.ts` - Updated to use test dates
- `src/routes/index.tsx` - Integrated refresh hook and test mode indicator
- `src/hooks/useScrollToToday.ts` - Updated to use test dates