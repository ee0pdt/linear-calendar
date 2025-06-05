import type { CalendarEvent } from '../types'

/**
 * Gets all events that occur on a specific date
 */
export const getEventsForDate = (
  events: Array<CalendarEvent>,
  date: Date,
): Array<CalendarEvent> => {
  return events.filter((event) => {
    const eventStartDate = new Date(
      event.start.getFullYear(),
      event.start.getMonth(),
      event.start.getDate(),
    )
    const checkDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )

    if (!event.allDay) {
      // Timed events - only show on exact start date
      return checkDate.getTime() === eventStartDate.getTime()
    }

    if (!event.end) {
      // Single day all-day event
      return checkDate.getTime() === eventStartDate.getTime()
    }

    // Multi-day all-day event - end date in ICS is exclusive (day after last day)
    const eventEndDate = new Date(
      event.end.getFullYear(),
      event.end.getMonth(),
      event.end.getDate(),
    )
    const lastIncludedDay = new Date(
      eventEndDate.getTime() - 24 * 60 * 60 * 1000,
    ) // Subtract one day

    return checkDate >= eventStartDate && checkDate <= lastIncludedDay
  })
}

/**
 * Gets display text for an event on a specific date
 */
export const getEventDisplayForDate = (
  event: CalendarEvent,
  date: Date,
): string => {
  if (!event.allDay) {
    // Timed events show the time
    return event.start.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!event.end) {
    // Single day all-day event
    return 'All day'
  }

  // Multi-day all-day event - show which day of the event this is
  const eventStartDate = new Date(
    event.start.getFullYear(),
    event.start.getMonth(),
    event.start.getDate(),
  )
  const eventEndDate = new Date(
    event.end.getFullYear(),
    event.end.getMonth(),
    event.end.getDate(),
  )
  const lastIncludedDay = new Date(eventEndDate.getTime() - 24 * 60 * 60 * 1000)

  const currentDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )

  const daysDiff = Math.floor(
    (currentDate.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  const totalDays =
    Math.floor(
      (lastIncludedDay.getTime() - eventStartDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1

  if (totalDays === 1) {
    return ''
  }

  return `Day ${daysDiff + 1} of ${totalDays}`
}
