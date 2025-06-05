import { PROXY_URL } from '../constants'
import type { CalDAVCredentials, CalendarEvent } from '../types'

/**
 * Imports events from CalDAV server via proxy
 */
export const importFromCalDAV = async (
  credentials: CalDAVCredentials,
): Promise<Array<CalendarEvent>> => {
  const response = await fetch(`${PROXY_URL}/caldav`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
      serverUrl: credentials.serverUrl || 'https://caldav.icloud.com',
    }),
  })

  const data = await response.json()

  if (data.success) {
    // Convert date strings back to Date objects
    const calDAVEvents = data.events.map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay || false,
      isRecurring: event.isRecurring || false,
    }))

    return calDAVEvents
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
