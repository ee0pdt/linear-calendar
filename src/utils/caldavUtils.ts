import { PROXY_URL } from '../constants'
import type { CalDAVCredentials, CalendarEvent } from '../types'

/**
 * Imports events from CalDAV server via proxy
 */
export const importFromCalDAV = async (
  credentials: CalDAVCredentials,
): Promise<Array<CalendarEvent>> => {
  const url = new URL(`${PROXY_URL}/api/calendar`)
  url.searchParams.append('username', credentials.username)
  url.searchParams.append('password', credentials.password)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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
