import { describe, expect, it } from 'vitest'
import { parseICSFile } from '../../utils/icsParser'

describe('icsParser', () => {
  describe('parseICSFile', () => {
    it('should parse simple non-recurring events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250115T100000Z
DTEND:20250115T110000Z
SUMMARY:Test Meeting
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Test Meeting')
      expect(events[0].isRecurring).toBe(false)
      expect(events[0].rrule).toBeUndefined()
    })

    it('should parse and expand daily recurring events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250101T090000Z
DTEND:20250101T093000Z
SUMMARY:Daily Standup
RRULE:FREQ=DAILY;COUNT=5
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(5)

      // All events should be marked as recurring
      events.forEach((event) => {
        expect(event.isRecurring).toBe(true)
        expect(event.title).toBe('Daily Standup')
        expect(event.rrule).toBeUndefined() // Should be removed from expanded events
      })

      // Check dates are consecutive
      expect(events[0].start.getDate()).toBe(1)
      expect(events[1].start.getDate()).toBe(2)
      expect(events[2].start.getDate()).toBe(3)
      expect(events[3].start.getDate()).toBe(4)
      expect(events[4].start.getDate()).toBe(5)
    })

    it('should parse and expand weekly recurring events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250106T140000Z
DTEND:20250106T150000Z
SUMMARY:Weekly Team Meeting
RRULE:FREQ=WEEKLY;COUNT=3
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(3)

      // Check weekly intervals
      expect(events[0].start.getDate()).toBe(6) // Jan 6
      expect(events[1].start.getDate()).toBe(13) // Jan 13
      expect(events[2].start.getDate()).toBe(20) // Jan 20

      events.forEach((event) => {
        expect(event.isRecurring).toBe(true)
        expect(event.title).toBe('Weekly Team Meeting')
      })
    })

    it('should detect all-day events correctly', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250115
DTEND:20250116
SUMMARY:All Day Event
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(1)
      expect(events[0].allDay).toBe(true)
      expect(events[0].title).toBe('All Day Event')
    })

    it('should detect midnight-to-midnight events as all-day', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250115T000000Z
DTEND:20250116T000000Z
SUMMARY:Midnight Event
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(1)
      expect(events[0].allDay).toBe(true)
    })

    it('should handle recurring all-day events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250101
DTEND:20250102
SUMMARY:Daily All-Day Event
RRULE:FREQ=DAILY;COUNT=3
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(3)

      events.forEach((event) => {
        expect(event.allDay).toBe(true)
        expect(event.isRecurring).toBe(true)
        expect(event.title).toBe('Daily All-Day Event')
      })
    })

    it('should filter events by year', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20240115T100000Z
DTEND:20240115T110000Z
SUMMARY:2024 Event
END:VEVENT
BEGIN:VEVENT
DTSTART:20250115T100000Z
DTEND:20250115T110000Z
SUMMARY:2025 Event
END:VEVENT
BEGIN:VEVENT
DTSTART:20260115T100000Z
DTEND:20260115T110000Z
SUMMARY:2026 Event
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('2025 Event')
      expect(events[0].start.getFullYear()).toBe(2025)
    })

    it('should handle multiple different events in one file', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250115T100000Z
DTEND:20250115T110000Z
SUMMARY:One-time Meeting
END:VEVENT
BEGIN:VEVENT
DTSTART:20250101T090000Z
DTEND:20250101T093000Z
SUMMARY:Daily Standup
RRULE:FREQ=DAILY;COUNT=2
END:VEVENT
BEGIN:VEVENT
DTSTART:20250120
DTEND:20250121
SUMMARY:All Day Event
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      // Should have: 1 one-time + 2 recurring + 1 all-day = 4 events
      expect(events).toHaveLength(4)

      const oneTimeEvents = events.filter((e) => e.title === 'One-time Meeting')
      const recurringEvents = events.filter((e) => e.title === 'Daily Standup')
      const allDayEvents = events.filter((e) => e.title === 'All Day Event')

      expect(oneTimeEvents).toHaveLength(1)
      expect(oneTimeEvents[0].isRecurring).toBe(false)

      expect(recurringEvents).toHaveLength(2)
      expect(recurringEvents[0].isRecurring).toBe(true)
      expect(recurringEvents[1].isRecurring).toBe(true)

      expect(allDayEvents).toHaveLength(1)
      expect(allDayEvents[0].allDay).toBe(true)
    })

    it('should handle events with no end date', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250115T100000Z
SUMMARY:No End Date Event
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('No End Date Event')
      expect(events[0].end).toBeUndefined()
    })

    it('should preserve event duration in recurring events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250101T140000Z
DTEND:20250101T160000Z
SUMMARY:2 Hour Meeting
RRULE:FREQ=DAILY;COUNT=2
END:VEVENT
END:VCALENDAR`

      const events = parseICSFile(icsContent, 2025, 2025)

      expect(events).toHaveLength(2)

      // Both events should maintain 2-hour duration
      events.forEach((event) => {
        const duration = event.end!.getTime() - event.start.getTime()
        const twoHours = 2 * 60 * 60 * 1000
        expect(duration).toBe(twoHours)
      })
    })
  })
})
