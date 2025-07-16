import { CURRENT_YEAR, MONTHS } from '../constants'
import {
  getCurrentDateInTimezone,
  getUserTimezone,
  parseICSDateWithTimezone,
} from './timezoneUtils'

/**
 * Generates an array of all days in a given year
 */
export const generateYearDays = (year: number): Array<Date> => {
  const days = []
  const startDate = new Date(year, 0, 1) // January 1st
  const endDate = new Date(year, 11, 31) // December 31st

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }

  return days
}

/**
 * Generates an array of all days in a date range (multi-year support)
 */
export const generateDateRangeDays = (
  startYear: number,
  endYear: number,
): Array<Date> => {
  const days = []

  for (let year = startYear; year <= endYear; year++) {
    const yearDays = generateYearDays(year)
    days.push(...yearDays)
  }

  return days
}

/**
 * Gets the total number of days in a year range
 */
export const getTotalDaysInRange = (
  startYear: number,
  endYear: number,
): number => {
  let totalDays = 0

  for (let year = startYear; year <= endYear; year++) {
    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    totalDays += isLeapYear ? 366 : 365
  }

  return totalDays
}

/**
 * Formats a date into day name, day number, and month name
 */
export const formatDate = (date: Date) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Helper for ordinal suffix
  function getOrdinal(n: number) {
    if (n > 3 && n < 21) return n + 'th'
    switch (n % 10) {
      case 1:
        return n + 'st'
      case 2:
        return n + 'nd'
      case 3:
        return n + 'rd'
      default:
        return n + 'th'
    }
  }
  return {
    dayName: dayNames[date.getDay()],
    dayNumber: date.getDate(),
    dayNumberOrdinal: getOrdinal(date.getDate()),
    monthName: MONTHS[date.getMonth()],
    fullDate: date,
  }
}

/**
 * Checks if a date is today (timezone-aware)
 */
export const isToday = (date: Date): boolean => {
  const today = getCurrentDateInTimezone()
  const userTimezone = getUserTimezone()

  // Format both dates in the user's timezone for comparison
  const todayStr = today.toLocaleDateString('en-CA', { timeZone: userTimezone })
  const dateStr = date.toLocaleDateString('en-CA', { timeZone: userTimezone })

  return todayStr === dateStr
}

/**
 * Checks if a date is in the past
 */
export const isPastDay = (date: Date): boolean => {
  const today = new Date()
  const checkDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
  return checkDate < todayDate
}

/**
 * Checks if a date is the first day of the month
 */
export const isFirstOfMonth = (date: Date): boolean => {
  return date.getDate() === 1
}

/**
 * Checks if a date is on a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

/**
 * Parses an ICS date string into a Date object (timezone-aware)
 * Handles both date-only (YYYYMMDD) and datetime (YYYYMMDDTHHMMSS) formats
 */
export const parseICSDate = (dateStr: string): Date => {
  return parseICSDateWithTimezone(dateStr)
}

/**
 * Gets the current year
 */
export const getCurrentYear = (): number => CURRENT_YEAR
