import { CURRENT_YEAR, MONTHS } from '../constants'

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
 * Formats a date into day name, day number, and month name
 */
export const formatDate = (date: Date) => {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]

  return {
    dayName: dayNames[date.getDay()],
    dayNumber: date.getDate(),
    monthName: MONTHS[date.getMonth()],
    fullDate: date,
  }
}

/**
 * Checks if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
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
 * Parses an ICS date string into a Date object
 * Handles both date-only (YYYYMMDD) and datetime (YYYYMMDDTHHMMSS) formats
 */
export const parseICSDate = (dateStr: string): Date => {
  if (dateStr.includes('T')) {
    const [datePart, timePart] = dateStr.split('T')
    const year = parseInt(datePart.substring(0, 4))
    const month = parseInt(datePart.substring(4, 6)) - 1
    const day = parseInt(datePart.substring(6, 8))
    const hour = parseInt(timePart.substring(0, 2))
    const minute = parseInt(timePart.substring(2, 4))
    return new Date(year, month, day, hour, minute)
  } else {
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))
    return new Date(year, month, day)
  }
}

/**
 * Gets the current year
 */
export const getCurrentYear = (): number => CURRENT_YEAR
