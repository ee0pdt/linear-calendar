/**
 * Testing utilities for date override
 * Use URL parameter ?testDate=YYYY-MM-DD to override the current date
 * Example: http://localhost:3000?testDate=2025-12-25
 */

export function getTestDate(): Date | null {
  if (typeof window === 'undefined') return null
  
  const params = new URLSearchParams(window.location.search)
  const testDateParam = params.get('testDate')
  
  if (testDateParam) {
    const testDate = new Date(testDateParam + 'T12:00:00') // Use noon to avoid timezone issues
    if (!isNaN(testDate.getTime())) {
      console.log('[TEST MODE] Using test date:', testDateParam)
      return testDate
    }
  }
  
  return null
}

export function getCurrentDateForTesting(): Date {
  const testDate = getTestDate()
  return testDate || new Date()
}

export function isTestMode(): boolean {
  return getTestDate() !== null
}