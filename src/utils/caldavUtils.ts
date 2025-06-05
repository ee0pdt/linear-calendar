// No import of PROXY_URL; use inline logic
import type { CalDAVCredentials, CalendarEvent } from '../types'

/**
 * Imports events from CalDAV server via proxy
 */
export const importFromCalDAV = async (
  credentials: CalDAVCredentials,
): Promise<Array<CalendarEvent>> => {
  // Use localhost for development, env variable or fallback for production
  const proxyUrl =
    import.meta.env.MODE === 'development'
      ? 'http://localhost:3001'
      : import.meta.env.VITE_CALDAV_PROXY_URL ||
        'https://caldav-proxy-production.up.railway.app'

  const url = `${proxyUrl}/api/calendar?username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}`
  const response = await fetch(url)
  const data = await response.json()

  if (data.success) {
    // Convert date strings back to Date objects
    return data.events.map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay || false,
      isRecurring: event.isRecurring || false,
    }))
  } else {
    throw new Error(data.error || 'Unknown error occurred')
  }
}

/**
 * Gets CalDAV metadata from successful import
 */
export const getCalDAVImportInfo = (data: any, eventCount: number): string => {
  return `${eventCount} events from ${data.calendars?.length || 0} calendars`
}
