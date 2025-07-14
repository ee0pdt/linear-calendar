export interface Holiday {
  start: [number, number] // [month, day]
  end: [number, number] // [month, day]
  name: string
}

// Multi-year school holidays data
const schoolHolidaysData: Record<number, Array<Holiday>> = {
  2024: [
    { start: [1, 1], end: [1, 5], name: 'Christmas Holiday' },
    { start: [2, 12], end: [2, 16], name: 'February Half Term' },
    { start: [3, 29], end: [4, 12], name: 'Easter Holiday' },
    { start: [5, 27], end: [5, 31], name: 'May Half Term' },
    { start: [7, 22], end: [9, 2], name: 'Summer Holiday' },
    { start: [10, 28], end: [11, 1], name: 'October Half Term' },
    { start: [12, 23], end: [12, 31], name: 'Christmas Holiday' },
  ],
  2025: [
    { start: [1, 1], end: [1, 6], name: 'Christmas Holiday' },
    { start: [2, 17], end: [2, 21], name: 'February Half Term' },
    { start: [4, 7], end: [4, 21], name: 'Easter Holiday' },
    { start: [5, 26], end: [5, 30], name: 'May Half Term' },
    { start: [7, 21], end: [9, 1], name: 'Summer Holiday' },
    { start: [10, 27], end: [10, 31], name: 'October Half Term' },
    { start: [12, 22], end: [12, 31], name: 'Christmas Holiday' },
  ],
  2026: [
    { start: [1, 1], end: [1, 2], name: 'Christmas Holiday' },
    { start: [2, 16], end: [2, 20], name: 'February Half Term' },
    { start: [3, 30], end: [4, 10], name: 'Easter Holiday' },
    { start: [5, 25], end: [5, 29], name: 'May Half Term' },
    { start: [7, 21], end: [9, 1], name: 'Summer Holiday' },
    { start: [10, 26], end: [10, 30], name: 'October Half Term' },
    { start: [12, 21], end: [12, 31], name: 'Christmas Holiday' },
  ],
}

export const getSchoolHolidays = (year: number): Array<Holiday> => {
  return schoolHolidaysData[year] || []
}

/**
 * Gets school holidays with support for dynamic fetching
 * In the future, this could fetch from external sources
 */
export const getSchoolHolidaysWithFetch = async (
  year: number,
): Promise<Array<Holiday>> => {
  // For now, return static data
  // In the future, this could try to fetch from external sources
  return getSchoolHolidays(year)
}

/**
 * Checks if a date falls within any school holiday
 */
export const isSchoolHoliday = (date: Date): boolean => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()

  const schoolHolidays = getSchoolHolidays(year)

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
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()

  const schoolHolidays = getSchoolHolidays(year)

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
      const startDate = new Date(year, startMonth - 1, startDay)
      const endDate = new Date(year, endMonth - 1, endDay)
      const currentDate = new Date(year, month - 1, day)

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
