import { PROXY_URL } from '../constants'
import { expandRecurringEvent } from './recurrenceUtils'
import {
  getCurrentDateInTimezone,
  parseEventDateWithTimezone,
} from './timezoneUtils'
import type { CalDAVCredentials, CalendarEvent } from '../types'

/**
 * Imports events from CalDAV server via proxy
 */
export const importFromCalDAV = async (
  credentials: CalDAVCredentials,
  startYear: number,
  endYear: number,
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
    const expandedEvents: Array<CalendarEvent> = []

    // Process each event and expand recurring events
    for (const event of data.events) {
      try {
        console.log('Processing CalDAV event:', {
          title: event.title,
          start: event.start,
          startType: typeof event.start,
          end: event.end,
          endType: typeof event.end,
        })

        const calDAVEvent: CalendarEvent = {
          ...event,
          start: parseEventDateWithTimezone(event.start),
          end: parseEventDateWithTimezone(event.end),
          allDay: event.allDay || false,
          isRecurring: event.isRecurring || false,
          description: event.description,
          location: event.location,
          url: event.url,
          organizer: event.organizer,
          attendees: event.attendees,
          calendar: event.calendar,
          uid: event.uid,
        }

        // Handle recurring events by expanding them
        if (calDAVEvent.rrule && calDAVEvent.isRecurring) {
          const expanded = expandRecurringEvent(calDAVEvent, startYear, endYear)
          expandedEvents.push(...expanded)
        } else {
          // Include non-recurring events that fall within the specified year range
          const eventYear = calDAVEvent.start.getFullYear()
          if (eventYear >= startYear && eventYear <= endYear) {
            expandedEvents.push(calDAVEvent)
          }
        }
      } catch (eventError) {
        console.error('Error processing CalDAV event:', eventError, event)
        // Skip this event and continue processing others
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
