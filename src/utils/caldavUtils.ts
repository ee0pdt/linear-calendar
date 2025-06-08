import { PROXY_URL } from '../constants'
import { expandRecurringEvent } from './recurrenceUtils'
import { getCurrentDateInTimezone } from './timezoneUtils'
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
    const currentDateInTz = getCurrentDateInTimezone()
    const currentYear = currentDateInTz.getFullYear()
    const expandedEvents: Array<CalendarEvent> = []

    // Process each event and expand recurring events
    for (const event of data.events) {
      const calDAVEvent: CalendarEvent = {
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: event.allDay || false,
        isRecurring: event.isRecurring || false,
      }

      // Handle recurring events by expanding them
      if (calDAVEvent.rrule && calDAVEvent.isRecurring) {
        const expanded = expandRecurringEvent(calDAVEvent, currentYear)
        expandedEvents.push(...expanded)
      } else {
        // Only include non-recurring events from current year
        if (calDAVEvent.start.getFullYear() === currentYear) {
          expandedEvents.push(calDAVEvent)
        }
      }
    }

    return expandedEvents
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
