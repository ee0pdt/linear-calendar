import { DEFAULT_TIMEZONE, TIMEZONE_STORAGE_KEY } from '../constants'

/**
 * Gets the user's selected timezone from storage or returns default
 */
export const getUserTimezone = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY)
    if (stored) {
      return stored
    }
  }
  return DEFAULT_TIMEZONE
}

/**
 * Sets the user's timezone preference
 */
export const setUserTimezone = (timezone: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone)
  }
}

/**
 * Converts a Date to a specific timezone and returns a new Date object
 * that represents the same moment in time but adjusted for display
 */
export const convertToTimezone = (date: Date, timezone: string): Date => {
  // Create a date formatter for the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0')
  const month =
    parseInt(parts.find((p) => p.type === 'month')?.value || '0') - 1
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '0')
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0')
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0')
  const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0')

  return new Date(year, month, day, hour, minute, second)
}

/**
 * Gets current date/time in the user's selected timezone
 */
export const getCurrentDateInTimezone = (timezone?: string): Date => {
  const tz = timezone || getUserTimezone()
  return convertToTimezone(new Date(), tz)
}

/**
 * Parses an ICS date string and converts it to the user's timezone
 */
export const parseICSDateWithTimezone = (
  dateStr: string,
  timezone?: string,
): Date => {
  const tz = timezone || getUserTimezone()

  if (dateStr.includes('T')) {
    // Parse datetime
    const [datePart, timePart] = dateStr.split('T')
    const year = parseInt(datePart.substring(0, 4))
    const month = parseInt(datePart.substring(4, 6)) - 1
    const day = parseInt(datePart.substring(6, 8))
    const hour = parseInt(timePart.substring(0, 2))
    const minute = parseInt(timePart.substring(2, 4))

    // Create UTC date first
    const utcDate = new Date(Date.UTC(year, month, day, hour, minute))

    // If the date string ends with 'Z', it's already UTC
    if (dateStr.endsWith('Z')) {
      return convertToTimezone(utcDate, tz)
    }

    // Otherwise, assume it's in the target timezone already
    return new Date(year, month, day, hour, minute)
  } else {
    // Date-only events are timezone-agnostic
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))
    return new Date(year, month, day)
  }
}

/**
 * Formats a date for display in the user's timezone
 */
export const formatDateInTimezone = (date: Date, timezone?: string): string => {
  const tz = timezone || getUserTimezone()
  return date.toLocaleString('en-GB', {
    timeZone: tz,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Parses an event date from CalDAV/API response and ensures it's in the correct timezone
 * This handles dates that come as ISO strings from the server
 */
export const parseEventDateWithTimezone = (dateInput: string | Date): Date => {
  // If it's already a Date object, just return it as-is
  // (the timezone conversion should happen at display time)
  if (dateInput instanceof Date) {
    return dateInput
  }

  // If it's a string, parse it normally
  // The server should be sending proper ISO strings
  return new Date(dateInput)
}
