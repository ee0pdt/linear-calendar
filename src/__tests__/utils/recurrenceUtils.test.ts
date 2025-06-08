import { describe, expect, it } from 'vitest'
import { expandRecurringEvent, parseRRule } from '../../utils/recurrenceUtils'
import type { CalendarEvent } from '../../types'

describe('recurrenceUtils', () => {
  describe('parseRRule', () => {
    it('should parse a simple daily recurrence rule', () => {
      const rrule = 'FREQ=DAILY;INTERVAL=1'
      const parsed = parseRRule(rrule)

      expect(parsed).toEqual({
        freq: 'DAILY',
        interval: 1,
      })
    })

    it('should parse a weekly recurrence rule with UNTIL', () => {
      const rrule = 'FREQ=WEEKLY;INTERVAL=2;UNTIL=20251231T235959Z'
      const parsed = parseRRule(rrule)

      expect(parsed.freq).toBe('WEEKLY')
      expect(parsed.interval).toBe(2)
      expect(parsed.until).toBeInstanceOf(Date)
    })

    it('should parse a monthly recurrence rule with COUNT', () => {
      const rrule = 'FREQ=MONTHLY;COUNT=12'
      const parsed = parseRRule(rrule)

      expect(parsed).toEqual({
        freq: 'MONTHLY',
        count: 12,
      })
    })

    it('should parse a rule with BYDAY', () => {
      const rrule = 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
      const parsed = parseRRule(rrule)

      expect(parsed.freq).toBe('WEEKLY')
      expect(parsed.byDay).toEqual(['MO', 'WE', 'FR'])
    })
  })

  describe('expandRecurringEvent', () => {
    const createBaseEvent = (
      overrides: Partial<CalendarEvent> = {},
    ): CalendarEvent => ({
      title: 'Daily Standup',
      start: new Date(2025, 0, 1, 9, 0), // January 1, 2025 at 9:00 AM
      end: new Date(2025, 0, 1, 9, 30), // January 1, 2025 at 9:30 AM
      allDay: false,
      isRecurring: false,
      rrule: 'FREQ=DAILY;INTERVAL=1',
      ...overrides,
    })

    it('should expand a daily recurring event', () => {
      const baseEvent = createBaseEvent({
        rrule: 'FREQ=DAILY;COUNT=3',
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      expect(expanded).toHaveLength(3)
      expect(expanded[0].start.getDate()).toBe(1)
      expect(expanded[1].start.getDate()).toBe(2)
      expect(expanded[2].start.getDate()).toBe(3)

      // All expanded events should be marked as recurring
      expanded.forEach((event) => {
        expect(event.isRecurring).toBe(true)
        expect(event.rrule).toBeUndefined()
      })
    })

    it('should expand a weekly recurring event', () => {
      const baseEvent = createBaseEvent({
        rrule: 'FREQ=WEEKLY;COUNT=3',
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      expect(expanded).toHaveLength(3)
      expect(expanded[0].start.getDate()).toBe(1) // Jan 1
      expect(expanded[1].start.getDate()).toBe(8) // Jan 8
      expect(expanded[2].start.getDate()).toBe(15) // Jan 15
    })

    it('should expand a monthly recurring event', () => {
      const baseEvent = createBaseEvent({
        rrule: 'FREQ=MONTHLY;COUNT=3',
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      expect(expanded).toHaveLength(3)
      expect(expanded[0].start.getMonth()).toBe(0) // January
      expect(expanded[1].start.getMonth()).toBe(1) // February
      expect(expanded[2].start.getMonth()).toBe(2) // March
    })

    it('should expand a yearly recurring event', () => {
      const baseEvent = createBaseEvent({
        start: new Date(2023, 0, 1), // Start from 2023
        end: new Date(2023, 0, 1),
        rrule: 'FREQ=YEARLY;COUNT=5',
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      // Should only include the 2025 occurrence
      expect(expanded).toHaveLength(1)
      expect(expanded[0].start.getFullYear()).toBe(2025)
      expect(expanded[0].start.getMonth()).toBe(0) // January
      expect(expanded[0].start.getDate()).toBe(1)
    })

    it('should respect UNTIL date', () => {
      const baseEvent = createBaseEvent({
        rrule: 'FREQ=DAILY;UNTIL=20250103T235959Z', // Until January 3, 2025
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      expect(expanded).toHaveLength(3) // Jan 1, 2, 3
      expect(expanded[0].start.getDate()).toBe(1)
      expect(expanded[1].start.getDate()).toBe(2)
      expect(expanded[2].start.getDate()).toBe(3)
    })

    it('should handle interval properly', () => {
      const baseEvent = createBaseEvent({
        rrule: 'FREQ=DAILY;INTERVAL=2;COUNT=3', // Every 2 days
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      expect(expanded).toHaveLength(3)
      expect(expanded[0].start.getDate()).toBe(1) // Jan 1
      expect(expanded[1].start.getDate()).toBe(3) // Jan 3
      expect(expanded[2].start.getDate()).toBe(5) // Jan 5
    })

    it('should preserve event duration', () => {
      const baseEvent = createBaseEvent({
        start: new Date(2025, 0, 1, 14, 0), // 2:00 PM
        end: new Date(2025, 0, 1, 16, 0), // 4:00 PM
        rrule: 'FREQ=DAILY;COUNT=2',
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      expect(expanded).toHaveLength(2)

      // Check first occurrence
      expect(expanded[0].start.getHours()).toBe(14)
      expect(expanded[0].end!.getHours()).toBe(16)

      // Check second occurrence - next day, same time
      expect(expanded[1].start.getDate()).toBe(2)
      expect(expanded[1].start.getHours()).toBe(14)
      expect(expanded[1].end!.getHours()).toBe(16)
    })

    it('should handle all-day events', () => {
      const baseEvent = createBaseEvent({
        start: new Date(2025, 0, 1), // January 1, 2025
        end: new Date(2025, 0, 2), // January 2, 2025 (exclusive end)
        allDay: true,
        rrule: 'FREQ=WEEKLY;COUNT=2',
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      expect(expanded).toHaveLength(2)
      expect(expanded[0].allDay).toBe(true)
      expect(expanded[1].allDay).toBe(true)

      // Check dates
      expect(expanded[0].start.getDate()).toBe(1) // Jan 1
      expect(expanded[1].start.getDate()).toBe(8) // Jan 8
    })

    it('should only return events for the specified year', () => {
      const baseEvent = createBaseEvent({
        start: new Date(2024, 11, 30), // December 30, 2024
        end: new Date(2024, 11, 30),
        rrule: 'FREQ=DAILY;COUNT=5', // Would go into 2025
      })

      const expanded = expandRecurringEvent(baseEvent, 2025)

      // Should only include events that start in 2025
      expect(expanded.length).toBeGreaterThan(0)
      expanded.forEach((event) => {
        expect(event.start.getFullYear()).toBe(2025)
      })
    })
  })
})
