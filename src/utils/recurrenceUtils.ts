import { parseICSDate } from './dateUtils'
import type { CalendarEvent } from '../types'

export interface RecurrenceRule {
  freq: string
  interval?: number
  until?: Date
  count?: number
  byDay?: Array<string>
}

/**
 * Parses an RRULE string into a RecurrenceRule object
 */
export const parseRRule = (rrule: string): RecurrenceRule => {
  const parts = rrule.split(';')
  const rule: RecurrenceRule = { freq: '' }

  for (const part of parts) {
    const [key, value] = part.split('=')
    switch (key) {
      case 'FREQ':
        rule.freq = value
        break
      case 'INTERVAL':
        rule.interval = parseInt(value)
        break
      case 'UNTIL':
        rule.until = parseICSDate(value)
        break
      case 'COUNT':
        rule.count = parseInt(value)
        break
      case 'BYDAY':
        rule.byDay = value.split(',')
        break
    }
  }

  return rule
}

/**
 * Expands a recurring event into individual event instances for a given year range
 */
export const expandRecurringEvent = (
  baseEvent: CalendarEvent,
  startYear: number,
  endYear: number,
): Array<CalendarEvent> => {
  const events: Array<CalendarEvent> = []
  const rule = parseRRule(baseEvent.rrule!)

  const rangeStart = new Date(startYear, 0, 1)
  const rangeEnd = new Date(endYear, 11, 31)

  let currentDate = new Date(baseEvent.start) // eslint-disable-line prefer-const
  let count = 0
  const maxOccurrences = rule.count || 1000 // Prevent infinite loops, increased for multi-year

  while (currentDate <= rangeEnd && count < maxOccurrences) {
    // Only include events that fall within the specified year range
    if (currentDate >= rangeStart) {
      const eventDuration = baseEvent.end
        ? baseEvent.end.getTime() - baseEvent.start.getTime()
        : 0

      const newEvent: CalendarEvent = {
        ...baseEvent,
        start: new Date(currentDate),
        end: baseEvent.end
          ? new Date(currentDate.getTime() + eventDuration)
          : undefined,
        rrule: undefined, // Remove rrule from individual instances
        isRecurring: true, // Mark as recurring event instance
      }

      events.push(newEvent)
    }

    // Calculate next occurrence based on frequency
    switch (rule.freq) {
      case 'DAILY':
        currentDate.setDate(currentDate.getDate() + (rule.interval || 1))
        break
      case 'WEEKLY':
        currentDate.setDate(currentDate.getDate() + 7 * (rule.interval || 1))
        break
      case 'MONTHLY':
        currentDate.setMonth(currentDate.getMonth() + (rule.interval || 1))
        break
      case 'YEARLY':
        currentDate.setFullYear(
          currentDate.getFullYear() + (rule.interval || 1),
        )
        break
      default:
        // Unknown frequency, break to prevent infinite loop
        break
    }

    count++

    // Check if we've reached the UNTIL date
    if (rule.until && currentDate > rule.until) {
      break
    }
  }

  return events
}
