// Mock dates for testing
export const MOCK_DATES = {
  // Regular dates
  regularDay: new Date(2025, 5, 10), // June 10, 2025 (Tuesday)
  weekend: new Date(2025, 5, 14), // June 14, 2025 (Saturday)
  sunday: new Date(2025, 5, 15), // June 15, 2025 (Sunday)

  // Special dates
  today: new Date(2025, 5, 5), // June 5, 2025 (current date in context)
  yesterday: new Date(2025, 5, 4), // June 4, 2025
  tomorrow: new Date(2025, 5, 6), // June 6, 2025

  // First of month
  firstOfJune: new Date(2025, 5, 1), // June 1, 2025
  firstOfJanuary: new Date(2025, 0, 1), // January 1, 2025

  // Year boundaries
  startOfYear: new Date(2025, 0, 1), // January 1, 2025
  endOfYear: new Date(2025, 11, 31), // December 31, 2025

  // School holidays (based on the app's holiday definitions)
  christmasHoliday: new Date(2025, 11, 25), // December 25, 2025
  easterHoliday: new Date(2025, 3, 15), // April 15, 2025
  summerHoliday: new Date(2025, 7, 1), // August 1, 2025
} as const

export const MOCK_YEAR = 2025
