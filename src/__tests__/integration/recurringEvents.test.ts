import { describe, expect, it } from 'vitest'
import { parseICSFile } from '../../utils/icsParser'
import { getEventsForDate } from '../../utils/eventUtils'

describe('Recurring Events Integration', () => {
  it('should fix the recurring events bug - events should appear multiple times', () => {
    // This test reproduces the original bug where recurring events only showed up once
    const icsContentWithRecurring = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250101T090000Z
DTEND:20250101T093000Z
SUMMARY:Daily Standup Meeting
RRULE:FREQ=DAILY;COUNT=5
END:VEVENT
BEGIN:VEVENT
DTSTART:20250106T140000Z
DTEND:20250106T150000Z
SUMMARY:Weekly Team Review
RRULE:FREQ=WEEKLY;COUNT=3
END:VEVENT
BEGIN:VEVENT
DTSTART:20250115T100000Z
DTEND:20250115T110000Z
SUMMARY:One-time Meeting
END:VEVENT
END:VCALENDAR`

    // Parse the ICS file
    const events = parseICSFile(icsContentWithRecurring, 2025)

    // Before the fix, this would only return 1 event (the one-time meeting)
    // After the fix, it should return 8 events total (5 daily + 3 weekly + 1 one-time)
    expect(events.length).toBe(9) // 5 + 3 + 1 = 9 total events

    // Verify recurring events are properly marked
    const recurringEvents = events.filter((e) => e.isRecurring)
    const nonRecurringEvents = events.filter((e) => !e.isRecurring)

    expect(recurringEvents.length).toBe(8) // 5 daily + 3 weekly
    expect(nonRecurringEvents.length).toBe(1) // 1 one-time

    // Verify daily standup appears on consecutive days
    const jan1Events = getEventsForDate(events, new Date(2025, 0, 1))
    const jan2Events = getEventsForDate(events, new Date(2025, 0, 2))
    const jan3Events = getEventsForDate(events, new Date(2025, 0, 3))
    const jan4Events = getEventsForDate(events, new Date(2025, 0, 4))
    const jan5Events = getEventsForDate(events, new Date(2025, 0, 5))

    expect(jan1Events.some((e) => e.title === 'Daily Standup Meeting')).toBe(
      true,
    )
    expect(jan2Events.some((e) => e.title === 'Daily Standup Meeting')).toBe(
      true,
    )
    expect(jan3Events.some((e) => e.title === 'Daily Standup Meeting')).toBe(
      true,
    )
    expect(jan4Events.some((e) => e.title === 'Daily Standup Meeting')).toBe(
      true,
    )
    expect(jan5Events.some((e) => e.title === 'Daily Standup Meeting')).toBe(
      true,
    )

    // Verify weekly review appears on weekly intervals
    const jan6Events = getEventsForDate(events, new Date(2025, 0, 6)) // First occurrence
    const jan13Events = getEventsForDate(events, new Date(2025, 0, 13)) // Second occurrence
    const jan20Events = getEventsForDate(events, new Date(2025, 0, 20)) // Third occurrence
    const jan27Events = getEventsForDate(events, new Date(2025, 0, 27)) // Should not exist

    expect(jan6Events.some((e) => e.title === 'Weekly Team Review')).toBe(true)
    expect(jan13Events.some((e) => e.title === 'Weekly Team Review')).toBe(true)
    expect(jan20Events.some((e) => e.title === 'Weekly Team Review')).toBe(true)
    expect(jan27Events.some((e) => e.title === 'Weekly Team Review')).toBe(
      false,
    )

    // Verify one-time meeting appears only once
    const jan15Events = getEventsForDate(events, new Date(2025, 0, 15))
    const jan16Events = getEventsForDate(events, new Date(2025, 0, 16))

    expect(jan15Events.some((e) => e.title === 'One-time Meeting')).toBe(true)
    expect(jan16Events.some((e) => e.title === 'One-time Meeting')).toBe(false)

    // Verify that expanded recurring events don't have rrule property
    const expandedRecurringEvents = events.filter((e) => e.isRecurring)
    expandedRecurringEvents.forEach((event) => {
      expect(event.rrule).toBeUndefined()
    })
  })

  it('should handle edge case: recurring event with UNTIL date', () => {
    const icsContentWithUntil = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250101T090000Z
DTEND:20250101T093000Z
SUMMARY:Limited Daily Standup
RRULE:FREQ=DAILY;UNTIL=20250103T235959Z
END:VEVENT
END:VCALENDAR`

    const events = parseICSFile(icsContentWithUntil, 2025)

    // Should only have 3 events (Jan 1, 2, 3)
    expect(events.length).toBe(3)

    // Verify all are marked as recurring
    events.forEach((event) => {
      expect(event.isRecurring).toBe(true)
      expect(event.title).toBe('Limited Daily Standup')
    })

    // Check specific dates
    expect(getEventsForDate(events, new Date(2025, 0, 1)).length).toBe(1)
    expect(getEventsForDate(events, new Date(2025, 0, 2)).length).toBe(1)
    expect(getEventsForDate(events, new Date(2025, 0, 3)).length).toBe(1)
    expect(getEventsForDate(events, new Date(2025, 0, 4)).length).toBe(0) // After UNTIL date
  })

  it('should handle mixed recurring and non-recurring events correctly', () => {
    const mixedICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20250101T090000Z
DTEND:20250101T093000Z
SUMMARY:New Year Meeting
END:VEVENT
BEGIN:VEVENT
DTSTART:20250102T090000Z
DTEND:20250102T093000Z
SUMMARY:Daily Check-in
RRULE:FREQ=DAILY;COUNT=2
END:VEVENT
BEGIN:VEVENT
DTSTART:20250105T090000Z
DTEND:20250105T093000Z
SUMMARY:Weekend Planning
END:VEVENT
END:VCALENDAR`

    const events = parseICSFile(mixedICS, 2025)

    // Should have 4 events total: 1 non-recurring + 2 recurring + 1 non-recurring
    expect(events.length).toBe(4)

    const recurringEvents = events.filter((e) => e.isRecurring)
    const nonRecurringEvents = events.filter((e) => !e.isRecurring)

    expect(recurringEvents.length).toBe(2)
    expect(nonRecurringEvents.length).toBe(2)

    // Check that the right events are marked correctly
    expect(nonRecurringEvents.map((e) => e.title)).toContain('New Year Meeting')
    expect(nonRecurringEvents.map((e) => e.title)).toContain('Weekend Planning')
    expect(recurringEvents.every((e) => e.title === 'Daily Check-in')).toBe(
      true,
    )
  })
})
