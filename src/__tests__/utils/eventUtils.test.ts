import { describe, expect, it } from 'vitest'
import {
  getEventDisplayForDate,
  getEventsForDate,
} from '../../utils/eventUtils'
import type { CalendarEvent } from '../../types'

describe('eventUtils', () => {
  const createEvent = (
    overrides: Partial<CalendarEvent> = {},
  ): CalendarEvent => ({
    title: 'Test Event',
    start: new Date(2025, 0, 15, 10, 0), // January 15, 2025 at 10:00 AM
    end: new Date(2025, 0, 15, 11, 0), // January 15, 2025 at 11:00 AM
    allDay: false,
    isRecurring: false,
    ...overrides,
  })

  describe('getEventsForDate', () => {
    it('should return events that occur on the specified date', () => {
      const events = [
        createEvent({ title: 'Event 1', start: new Date(2025, 0, 15) }),
        createEvent({ title: 'Event 2', start: new Date(2025, 0, 16) }),
        createEvent({ title: 'Event 3', start: new Date(2025, 0, 15) }),
      ]

      const eventsForDate = getEventsForDate(events, new Date(2025, 0, 15))

      expect(eventsForDate).toHaveLength(2)
      expect(eventsForDate[0].title).toBe('Event 1')
      expect(eventsForDate[1].title).toBe('Event 3')
    })

    it('should handle recurring events', () => {
      const events = [
        createEvent({
          title: 'Daily Standup',
          start: new Date(2025, 0, 15, 9, 0),
          end: new Date(2025, 0, 15, 9, 30),
          isRecurring: true,
        }),
        createEvent({
          title: 'Another Daily Standup',
          start: new Date(2025, 0, 15, 10, 0),
          end: new Date(2025, 0, 15, 10, 30),
          isRecurring: true,
        }),
      ]

      const eventsForDate = getEventsForDate(events, new Date(2025, 0, 15))

      expect(eventsForDate).toHaveLength(2)
      expect(eventsForDate[0].isRecurring).toBe(true)
      expect(eventsForDate[1].isRecurring).toBe(true)
    })

    it('should handle single-day all-day events', () => {
      const events = [
        createEvent({
          title: 'All Day Event',
          start: new Date(2025, 0, 15),
          end: undefined,
          allDay: true,
        }),
      ]

      const eventsForDate = getEventsForDate(events, new Date(2025, 0, 15))

      expect(eventsForDate).toHaveLength(1)
      expect(eventsForDate[0].allDay).toBe(true)
    })

    it('should handle multi-day all-day events', () => {
      const events = [
        createEvent({
          title: 'Multi-day Event',
          start: new Date(2025, 0, 15),
          end: new Date(2025, 0, 18), // Exclusive end date
          allDay: true,
        }),
      ]

      // Should appear on Jan 15, 16, 17 but not 18
      expect(getEventsForDate(events, new Date(2025, 0, 15))).toHaveLength(1)
      expect(getEventsForDate(events, new Date(2025, 0, 16))).toHaveLength(1)
      expect(getEventsForDate(events, new Date(2025, 0, 17))).toHaveLength(1)
      expect(getEventsForDate(events, new Date(2025, 0, 18))).toHaveLength(0)
    })

    it('should only show timed events on their exact start date', () => {
      const events = [
        createEvent({
          title: 'Timed Event',
          start: new Date(2025, 0, 15, 14, 0),
          end: new Date(2025, 0, 15, 16, 0),
          allDay: false,
        }),
      ]

      expect(getEventsForDate(events, new Date(2025, 0, 15))).toHaveLength(1)
      expect(getEventsForDate(events, new Date(2025, 0, 16))).toHaveLength(0)
    })

    it('should normalize dates when comparing', () => {
      const events = [
        createEvent({
          title: 'Event with Time',
          start: new Date(2025, 0, 15, 14, 30, 45), // With specific time
          allDay: false,
        }),
      ]

      // Should match even if query date has different time
      const eventsForDate = getEventsForDate(
        events,
        new Date(2025, 0, 15, 8, 0, 0),
      )
      expect(eventsForDate).toHaveLength(1)
    })
  })

  describe('getEventDisplayForDate', () => {
    it('should return time for timed events', () => {
      const event = createEvent({
        start: new Date(2025, 0, 15, 14, 30),
        allDay: false,
      })

      const display = getEventDisplayForDate(event, new Date(2025, 0, 15))
      expect(display).toBe('02:30 PM')
    })

    it('should return "All day" for single-day all-day events', () => {
      const event = createEvent({
        start: new Date(2025, 0, 15),
        end: undefined,
        allDay: true,
      })

      const display = getEventDisplayForDate(event, new Date(2025, 0, 15))
      expect(display).toBe('All day')
    })

    it('should return empty string for single-day all-day events with exclusive end date', () => {
      const event = createEvent({
        start: new Date(2025, 0, 15),
        end: new Date(2025, 0, 16), // Next day (exclusive)
        allDay: true,
      })

      const display = getEventDisplayForDate(event, new Date(2025, 0, 15))
      expect(display).toBe('')
    })

    it('should return day progress for multi-day all-day events', () => {
      const event = createEvent({
        start: new Date(2025, 0, 15),
        end: new Date(2025, 0, 18), // 3-day event (15, 16, 17)
        allDay: true,
      })

      expect(getEventDisplayForDate(event, new Date(2025, 0, 15))).toBe(
        'Day 1 of 3',
      )
      expect(getEventDisplayForDate(event, new Date(2025, 0, 16))).toBe(
        'Day 2 of 3',
      )
      expect(getEventDisplayForDate(event, new Date(2025, 0, 17))).toBe(
        'Day 3 of 3',
      )
    })

    it('should handle recurring events correctly', () => {
      const event = createEvent({
        title: 'Recurring Meeting',
        start: new Date(2025, 0, 15, 9, 0),
        end: new Date(2025, 0, 15, 10, 0),
        allDay: false,
        isRecurring: true,
      })

      const display = getEventDisplayForDate(event, new Date(2025, 0, 15))
      expect(display).toBe('09:00 AM')
    })

    it('should handle recurring all-day events', () => {
      const event = createEvent({
        title: 'Recurring Holiday',
        start: new Date(2025, 0, 15),
        end: undefined,
        allDay: true,
        isRecurring: true,
      })

      const display = getEventDisplayForDate(event, new Date(2025, 0, 15))
      expect(display).toBe('All day')
    })
  })
})
