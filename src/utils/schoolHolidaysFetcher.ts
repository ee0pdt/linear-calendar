import type { Holiday } from './holidayUtils'

interface OxfordshireHolidayPeriod {
  name: string
  start: string
  end: string
}

/**
 * Fetches school holidays for Oxfordshire from the official website
 * This function would need to be implemented to scrape or fetch from the official API
 */
export const fetchOxfordshireHolidays = async (year: number): Promise<Holiday[]> => {
  // For now, we'll return the static data we have
  // In a real implementation, this would fetch from the official website
  
  // This is a placeholder implementation that would need to be replaced with actual fetching
  console.log(`Fetching school holidays for ${year} from Oxfordshire County Council`)
  
  // Static fallback data for demonstration
  const fallbackHolidays: Record<number, Holiday[]> = {
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

  return fallbackHolidays[year] || []
}

/**
 * Attempts to fetch dynamic school holidays from the official Oxfordshire website
 * This is a future implementation that would use web scraping or API calls
 */
export const fetchDynamicOxfordshireHolidays = async (year: number): Promise<Holiday[]> => {
  try {
    // In a real implementation, this would fetch from:
    // https://www.oxfordshire.gov.uk/schools/term-dates-and-holidays
    
    // For now, we'll use the fallback data
    return await fetchOxfordshireHolidays(year)
  } catch (error) {
    console.error('Failed to fetch dynamic school holidays:', error)
    return await fetchOxfordshireHolidays(year)
  }
}

/**
 * Parses date string from various formats into [month, day] format
 */
const parseHolidayDate = (dateString: string): [number, number] => {
  const date = new Date(dateString)
  return [date.getMonth() + 1, date.getDate()]
}

/**
 * Converts external holiday format to internal Holiday format
 */
const convertToHoliday = (period: OxfordshireHolidayPeriod): Holiday => {
  return {
    name: period.name,
    start: parseHolidayDate(period.start),
    end: parseHolidayDate(period.end),
  }
}

export default {
  fetchOxfordshireHolidays,
  fetchDynamicOxfordshireHolidays,
}