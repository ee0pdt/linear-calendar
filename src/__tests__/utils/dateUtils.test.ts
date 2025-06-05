import { describe, expect, it } from 'vitest'
import { MOCK_DATES, MOCK_YEAR } from '../fixtures/mockDates'

// Since we haven't extracted these functions yet, we'll copy them temporarily
// These tests will help us ensure the extracted functions work correctly

/**
 * These are the utility functions we'll be extracting from the main component.
 * For now, we're copying them here to create baseline tests.
 */

// Generate all days of the year
const generateYearDays = (year: number): Array<Date> => {
  const days = []
  const startDate = new Date(year, 0, 1) // January 1st
  const endDate = new Date(year, 11, 31) // December 31st

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }

  return days
}

const formatDate = (date: Date) => {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return {
    dayName: dayNames[date.getDay()],
    dayNumber: date.getDate(),
    monthName: monthNames[date.getMonth()],
    fullDate: date,
  }
}

const isToday = (date: Date, today = new Date()): boolean => {
  return date.toDateString() === today.toDateString()
}

const isPastDay = (date: Date, today = new Date()): boolean => {
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

const isFirstOfMonth = (date: Date): boolean => {
  return date.getDate() === 1
}

const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

const parseICSDate = (dateStr: string): Date => {
  // Handle both date-only (YYYYMMDD) and datetime (YYYYMMDDTHHMMSS) formats
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

describe('Date Utilities', () => {
  describe('generateYearDays', () => {
    it('generates all days for a regular year (365 days)', () => {
      const days = generateYearDays(2025)
      expect(days).toHaveLength(365)
    })

    it('generates all days for a leap year (366 days)', () => {
      const days = generateYearDays(2024)
      expect(days).toHaveLength(366)
    })

    it('starts with January 1st', () => {
      const days = generateYearDays(MOCK_YEAR)
      expect(days[0]).toEqual(new Date(MOCK_YEAR, 0, 1))
    })

    it('ends with December 31st', () => {
      const days = generateYearDays(MOCK_YEAR)
      expect(days[days.length - 1]).toEqual(new Date(MOCK_YEAR, 11, 31))
    })
  })

  describe('formatDate', () => {
    it('formats a regular Tuesday correctly', () => {
      const formatted = formatDate(MOCK_DATES.regularDay)
      expect(formatted.dayName).toBe('Tuesday')
      expect(formatted.dayNumber).toBe(10)
      expect(formatted.monthName).toBe('June')
      expect(formatted.fullDate).toEqual(MOCK_DATES.regularDay)
    })

    it('formats a weekend day correctly', () => {
      const formatted = formatDate(MOCK_DATES.weekend)
      expect(formatted.dayName).toBe('Saturday')
      expect(formatted.dayNumber).toBe(14)
      expect(formatted.monthName).toBe('June')
    })

    it('formats first of month correctly', () => {
      const formatted = formatDate(MOCK_DATES.firstOfJune)
      expect(formatted.dayName).toBe('Sunday')
      expect(formatted.dayNumber).toBe(1)
      expect(formatted.monthName).toBe('June')
    })
  })

  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(MOCK_DATES.today, MOCK_DATES.today)).toBe(true)
    })

    it('returns false for yesterday', () => {
      expect(isToday(MOCK_DATES.yesterday, MOCK_DATES.today)).toBe(false)
    })

    it('returns false for tomorrow', () => {
      expect(isToday(MOCK_DATES.tomorrow, MOCK_DATES.today)).toBe(false)
    })
  })

  describe('isPastDay', () => {
    it('returns true for yesterday', () => {
      expect(isPastDay(MOCK_DATES.yesterday, MOCK_DATES.today)).toBe(true)
    })

    it('returns false for today', () => {
      expect(isPastDay(MOCK_DATES.today, MOCK_DATES.today)).toBe(false)
    })

    it('returns false for tomorrow', () => {
      expect(isPastDay(MOCK_DATES.tomorrow, MOCK_DATES.today)).toBe(false)
    })
  })

  describe('isFirstOfMonth', () => {
    it('returns true for first of month', () => {
      expect(isFirstOfMonth(MOCK_DATES.firstOfJune)).toBe(true)
      expect(isFirstOfMonth(MOCK_DATES.firstOfJanuary)).toBe(true)
    })

    it('returns false for other days', () => {
      expect(isFirstOfMonth(MOCK_DATES.regularDay)).toBe(false)
      expect(isFirstOfMonth(MOCK_DATES.today)).toBe(false)
    })
  })

  describe('isWeekend', () => {
    it('returns true for Saturday', () => {
      expect(isWeekend(MOCK_DATES.weekend)).toBe(true)
    })

    it('returns true for Sunday', () => {
      expect(isWeekend(MOCK_DATES.sunday)).toBe(true)
    })

    it('returns false for weekdays', () => {
      expect(isWeekend(MOCK_DATES.regularDay)).toBe(false) // Tuesday
      expect(isWeekend(MOCK_DATES.today)).toBe(false) // Thursday
    })
  })

  describe('parseICSDate', () => {
    it('parses date-only format (YYYYMMDD)', () => {
      const parsed = parseICSDate('20250610')
      expect(parsed).toEqual(new Date(2025, 5, 10)) // June 10, 2025
    })

    it('parses datetime format (YYYYMMDDTHHMMSS)', () => {
      const parsed = parseICSDate('20250610T143000')
      expect(parsed).toEqual(new Date(2025, 5, 10, 14, 30)) // June 10, 2025, 2:30 PM
    })

    it('handles midnight correctly', () => {
      const parsed = parseICSDate('20250610T000000')
      expect(parsed).toEqual(new Date(2025, 5, 10, 0, 0)) // June 10, 2025, midnight
    })
  })
})
