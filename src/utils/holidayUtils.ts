import { CURRENT_YEAR } from '../constants'

export interface Holiday {
  start: [number, number] // [month, day]
  end: [number, number] // [month, day]
  name: string
}

export const schoolHolidays: Array<Holiday> = [
  // Christmas holidays (late Dec 2024 into Jan 2025)
  { start: [1, 1], end: [1, 6], name: 'Christmas Holiday' },

  // February half term
  { start: [2, 17], end: [2, 21], name: 'February Half Term' },

  // Easter holidays
  { start: [4, 7], end: [4, 21], name: 'Easter Holiday' },

  // May half term
  { start: [5, 26], end: [5, 30], name: 'May Half Term' },

  // Summer holidays
  { start: [7, 21], end: [9, 1], name: 'Summer Holiday' },

  // October half term
  { start: [10, 27], end: [10, 31], name: 'October Half Term' },

  // Christmas holidays (end of year)
  { start: [12, 22], end: [12, 31], name: 'Christmas Holiday' },
]

/**
 * Checks if a date falls within any school holiday
 */
export const isSchoolHoliday = (date: Date): boolean => {
  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()

  return schoolHolidays.some((holiday) => {
    const [startMonth, startDay] = holiday.start
    const [endMonth, endDay] = holiday.end

    if (startMonth === endMonth) {
      return month === startMonth && day >= startDay && day <= endDay
    } else {
      return (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      )
    }
  })
}

/**
 * Gets detailed information about which school holiday a date falls in
 */
export const getSchoolHolidayInfo = (
  date: Date,
): {
  name: string
  dayNumber: number
  totalDays: number
} | null => {
  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()

  for (const holiday of schoolHolidays) {
    const [startMonth, startDay] = holiday.start
    const [endMonth, endDay] = holiday.end

    let isInHoliday = false
    if (startMonth === endMonth) {
      isInHoliday = month === startMonth && day >= startDay && day <= endDay
    } else {
      isInHoliday =
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
    }

    if (isInHoliday) {
      // Calculate the day number and total days
      const startDate = new Date(CURRENT_YEAR, startMonth - 1, startDay)
      const endDate = new Date(CURRENT_YEAR, endMonth - 1, endDay)
      const currentDate = new Date(CURRENT_YEAR, month - 1, day)

      const dayNumber =
        Math.floor(
          (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1
      const totalDays =
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1

      return {
        name: holiday.name,
        dayNumber,
        totalDays,
      }
    }
  }

  return null
}
