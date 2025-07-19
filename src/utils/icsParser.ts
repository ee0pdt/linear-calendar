import { parseICSDate } from './dateUtils'
import { expandRecurringEvent } from './recurrenceUtils'
import type { CalendarEvent } from '../types'

/**
 * Parses an ICS file content and returns an array of calendar events
 * Note: Recurrence handling is simplified for this version
 */
export const parseICSFile = (
  icsContent: string,
  startYear: number,
  endYear: number,
): Array<CalendarEvent> => {
  const events: Array<CalendarEvent> = []
  const lines = icsContent.split('\n')
  let currentEvent: Partial<CalendarEvent> = {}
  let inEvent = false
  let dtStartLine = ''

  for (let line of lines) {
    line = line.trim()

    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
      dtStartLine = ''
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.title && currentEvent.start) {
        // Detect all-day events by checking if DTSTART has no time component
        // or if it's midnight-to-midnight with end date being next day
        const isAllDay =
          !dtStartLine.includes('T') ||
          (currentEvent.start.getHours() === 0 &&
            currentEvent.start.getMinutes() === 0 &&
            currentEvent.start.getSeconds() === 0 &&
            currentEvent.end &&
            currentEvent.end.getHours() === 0 &&
            currentEvent.end.getMinutes() === 0)

        currentEvent.allDay = isAllDay

        // Handle recurring events by expanding them
        if (currentEvent.rrule) {
          currentEvent.isRecurring = true
          const expandedEvents = expandRecurringEvent(
            currentEvent as CalendarEvent,
            startYear,
            endYear,
          )
          events.push(...expandedEvents)
        } else {
          currentEvent.isRecurring = false
          events.push(currentEvent as CalendarEvent)
        }
      }
      inEvent = false
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8)
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12)
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9)
      } else if (line.startsWith('URL:')) {
        currentEvent.url = line.substring(4)
      } else if (line.startsWith('ORGANIZER')) {
        // Extract organizer info, handle both name and email formats
        const organizer = line.substring(line.indexOf(':') + 1)
        if (organizer.includes('CN=')) {
          // Format: ORGANIZER;CN=Name:MAILTO:email@example.com
          const cnMatch = organizer.match(/CN=([^:;]+)/)
          if (cnMatch) {
            currentEvent.organizer = cnMatch[1]
          }
        } else {
          // Simple format: ORGANIZER:email@example.com
          currentEvent.organizer = organizer.replace('MAILTO:', '')
        }
      } else if (line.startsWith('ATTENDEE')) {
        // Extract attendee info
        if (!currentEvent.attendees) currentEvent.attendees = []
        const attendee = line.substring(line.indexOf(':') + 1)
        if (attendee.includes('CN=')) {
          const cnMatch = attendee.match(/CN=([^:;]+)/)
          if (cnMatch) {
            currentEvent.attendees.push(cnMatch[1])
          }
        } else {
          currentEvent.attendees.push(attendee.replace('MAILTO:', ''))
        }
      } else if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4)
      } else if (line.startsWith('DTSTART')) {
        dtStartLine = line
        const dateStr = line.split(':')[1]
        currentEvent.start = parseICSDate(dateStr)
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.split(':')[1]
        currentEvent.end = parseICSDate(dateStr)
      } else if (line.startsWith('RRULE:')) {
        currentEvent.rrule = line.substring(6)
      }
    }
  }

  // Filter events for the specified year range
  return events.filter((event) => {
    const eventYear = event.start.getFullYear()
    return eventYear >= startYear && eventYear <= endYear
  })
}
