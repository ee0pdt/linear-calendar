import { beforeEach, describe, expect, it, vi } from 'vitest'
import { importFromCalDAV } from '../../utils/caldavUtils'
import { PROXY_URL } from '../../constants'

// Mock fetch
// @ts-ignore
globalThis.fetch = vi.fn()

describe('CalDAV Import with Recurring Events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should properly expand recurring events from CalDAV import', async () => {
    // Mock the CalDAV proxy response with recurring events
    const mockCalDAVResponse = {
      success: true,
      events: [
        {
          title: 'Daily Standup',
          start: '2025-01-01T09:00:00.000Z',
          end: '2025-01-01T09:30:00.000Z',
          allDay: false,
          rrule: 'FREQ=DAILY;COUNT=5',
          isRecurring: true,
          calendarName: 'Work',
        },
        {
          title: 'One-time Meeting',
          start: '2025-01-15T14:00:00.000Z',
          end: '2025-01-15T15:00:00.000Z',
          allDay: false,
          isRecurring: false,
          calendarName: 'Work',
        },
        {
          title: 'Weekly Review (from 2024)',
          start: '2024-12-30T10:00:00.000Z',
          end: '2024-12-30T11:00:00.000Z',
          allDay: false,
          rrule: 'FREQ=WEEKLY;COUNT=10',
          isRecurring: true,
          calendarName: 'Work',
        },
      ],
      calendars: [{ name: 'Work', color: '#ff0000' }],
      count: 3,
    }

    // Setup fetch mock
    ;(fetch as any).mockResolvedValueOnce({
      json: async () => mockCalDAVResponse,
    })

    // Import events
    const credentials = {
      username: 'test@example.com',
      password: 'test-password',
      serverUrl: '',
    }
    const importedEvents = await importFromCalDAV(credentials)

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${PROXY_URL}/api/calendar`),
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    // Should expand recurring events + filter to current year (2025)
    // Daily Standup: 5 occurrences (all in 2025)
    // One-time Meeting: 1 occurrence (in 2025)
    // Weekly Review: Should generate some occurrences in 2025 from the 2024 start
    expect(importedEvents.length).toBeGreaterThan(6) // At least 6+ events

    // Verify daily standup appears on multiple consecutive days
    const dailyEvents = importedEvents.filter(
      (e) => e.title === 'Daily Standup',
    )
    expect(dailyEvents.length).toBe(5)

    // Check that they're on consecutive days starting Jan 1, 2025
    const expectedDates = [
      new Date('2025-01-01T09:00:00.000Z'),
      new Date('2025-01-02T09:00:00.000Z'),
      new Date('2025-01-03T09:00:00.000Z'),
      new Date('2025-01-04T09:00:00.000Z'),
      new Date('2025-01-05T09:00:00.000Z'),
    ]

    expectedDates.forEach((expectedDate, index) => {
      expect(dailyEvents[index].start.getTime()).toBe(expectedDate.getTime())
    })

    // Verify one-time meeting exists and is in 2025
    const oneTimeEvents = importedEvents.filter(
      (e) => e.title === 'One-time Meeting',
    )
    expect(oneTimeEvents.length).toBe(1)
    expect(oneTimeEvents[0].start.getFullYear()).toBe(2025)

    // Verify weekly review events that occur in 2025 are included
    const weeklyEvents = importedEvents.filter(
      (e) => e.title === 'Weekly Review (from 2024)',
    )
    expect(weeklyEvents.length).toBeGreaterThan(0) // Should have some occurrences in 2025

    // All returned events should be in 2025
    importedEvents.forEach((event) => {
      expect(event.start.getFullYear()).toBe(2025)
    })

    // Verify expanded recurring events don't have rrule
    const expandedRecurringEvents = importedEvents.filter((e) => e.isRecurring)
    expandedRecurringEvents.forEach((event) => {
      expect(event.rrule).toBeUndefined()
    })
  })

  it('should handle CalDAV import errors gracefully', async () => {
    const mockErrorResponse = {
      success: false,
      error: 'Authentication failed',
      details: '401 Unauthorized',
    }

    ;(fetch as any).mockResolvedValueOnce({
      json: async () => mockErrorResponse,
    })

    const credentials = {
      username: 'wrong@example.com',
      password: 'wrong-password',
      serverUrl: '',
    }

    await expect(importFromCalDAV(credentials)).rejects.toThrow(
      'Authentication failed',
    )
  })

  it('should handle events without RRULE correctly', async () => {
    const mockCalDAVResponse = {
      success: true,
      events: [
        {
          title: 'Simple Event',
          start: '2025-06-01T10:00:00.000Z',
          end: '2025-06-01T11:00:00.000Z',
          allDay: false,
          isRecurring: false,
          calendarName: 'Personal',
        },
        {
          title: 'Event from Previous Year',
          start: '2024-12-25T10:00:00.000Z',
          end: '2024-12-25T11:00:00.000Z',
          allDay: false,
          isRecurring: false,
          calendarName: 'Personal',
        },
      ],
      calendars: [{ name: 'Personal', color: '#00ff00' }],
      count: 2,
    }

    ;(fetch as any).mockResolvedValueOnce({
      json: async () => mockCalDAVResponse,
    })

    const credentials = {
      username: 'test@example.com',
      password: 'test-password',
      serverUrl: '',
    }
    const importedEvents = await importFromCalDAV(credentials)

    // Should only include events from current year (2025)
    expect(importedEvents.length).toBe(1)
    expect(importedEvents[0].title).toBe('Simple Event')
    expect(importedEvents[0].start.getFullYear()).toBe(2025)
  })
})
