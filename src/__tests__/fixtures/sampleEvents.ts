// Temporary types until we extract them in Phase 1
interface CalendarEvent {
  title: string
  start: Date
  end: Date
  allDay: boolean
  rrule?: string
  isRecurring?: boolean
}

export const SAMPLE_EVENTS: Array<CalendarEvent> = [
  {
    title: 'Team Meeting',
    start: new Date(2025, 5, 10, 9, 0), // June 10, 2025, 9:00 AM
    end: new Date(2025, 5, 10, 10, 0), // June 10, 2025, 10:00 AM
    allDay: false,
    isRecurring: false,
  },
  {
    title: 'Birthday Party',
    start: new Date(2025, 5, 15), // June 15, 2025 (all day)
    end: new Date(2025, 5, 16), // June 16, 2025 (exclusive end)
    allDay: true,
    isRecurring: false,
  },
  {
    title: 'Vacation',
    start: new Date(2025, 6, 1), // July 1, 2025
    end: new Date(2025, 6, 8), // July 8, 2025 (7 days)
    allDay: true,
    isRecurring: false,
  },
  {
    title: 'Weekly Standup',
    start: new Date(2025, 5, 9, 10, 0), // June 9, 2025, 10:00 AM
    end: new Date(2025, 5, 9, 10, 30), // June 9, 2025, 10:30 AM
    allDay: false,
    isRecurring: true,
    rrule: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO',
  },
  {
    title: 'Swimming 🏊',
    start: new Date(2025, 5, 12, 18, 0), // June 12, 2025, 6:00 PM
    end: new Date(2025, 5, 12, 19, 0), // June 12, 2025, 7:00 PM
    allDay: false,
    isRecurring: false,
  },
] as const

export const SAMPLE_ALL_DAY_EVENT: CalendarEvent = {
  title: 'Conference',
  start: new Date(2025, 5, 20), // June 20, 2025
  end: new Date(2025, 5, 21), // June 21, 2025
  allDay: true,
  isRecurring: false,
}

export const SAMPLE_MULTI_DAY_EVENT: CalendarEvent = {
  title: 'Business Trip',
  start: new Date(2025, 5, 25), // June 25, 2025
  end: new Date(2025, 5, 28), // June 28, 2025 (3 days)
  allDay: true,
  isRecurring: false,
}
