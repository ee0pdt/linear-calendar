/**
 * Test fixtures for Playwright tests
 * Contains sample calendar events and test data
 */

export const sampleICSContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH

BEGIN:VEVENT
UID:test-meeting-1@example.com
DTSTART:20250815T090000Z
DTEND:20250815T100000Z
SUMMARY:Team Meeting
DESCRIPTION:Weekly team standup meeting
LOCATION:Conference Room A
STATUS:CONFIRMED
END:VEVENT

BEGIN:VEVENT
UID:test-birthday-1@example.com
DTSTART;VALUE=DATE:20250820
SUMMARY:Birthday Party 🎂
DESCRIPTION:Annual birthday celebration
LOCATION:Home
STATUS:CONFIRMED
END:VEVENT

BEGIN:VEVENT
UID:test-recurring-1@example.com
DTSTART:20250812T140000Z
DTEND:20250812T150000Z
SUMMARY:Gym Session 💪
DESCRIPTION:Weekly workout
LOCATION:Local Gym
RRULE:FREQ=WEEKLY;BYDAY=MO
STATUS:CONFIRMED
END:VEVENT

BEGIN:VEVENT
UID:test-vacation-1@example.com
DTSTART;VALUE=DATE:20250825
DTEND;VALUE=DATE:20250830
SUMMARY:Summer Vacation 🏖️
DESCRIPTION:Family holiday
LOCATION:Beach Resort
STATUS:CONFIRMED
END:VEVENT

END:VCALENDAR`;

export const testEvents = [
  {
    id: 'test-1',
    title: 'Team Meeting',
    startDate: '2025-08-15',
    startTime: '09:00',
    endDate: '2025-08-15',
    endTime: '10:00',
    location: 'Conference Room A',
    description: 'Weekly team standup meeting',
    isAllDay: false,
    isRecurring: false
  },
  {
    id: 'test-2', 
    title: 'Birthday Party 🎂',
    startDate: '2025-08-20',
    endDate: '2025-08-20',
    location: 'Home',
    description: 'Annual birthday celebration',
    isAllDay: true,
    isRecurring: false
  },
  {
    id: 'test-3',
    title: 'Gym Session 💪', 
    startDate: '2025-08-12',
    startTime: '14:00',
    endDate: '2025-08-12',
    endTime: '15:00',
    location: 'Local Gym',
    description: 'Weekly workout',
    isAllDay: false,
    isRecurring: true
  }
];

export const testDates = {
  today: new Date().toISOString().split('T')[0],
  pastDate: '2025-01-15',
  futureDate: '2025-12-25',
  testEventDate: '2025-08-15'
};

export const testSelectors = {
  // Based on actual DOM structure from debug output
  app: '#app',
  todayButton: 'button[aria-label="Jump to Today"]',
  searchButton: 'button[aria-label="Search events"]',
  navigationButton: 'button[aria-label="Open navigation"]',
  settingsButton: 'button[aria-label="Open settings"]',
  performanceDashboard: 'button[title="Toggle Performance Dashboard"]',
  monthHeader: 'h2:has-text("August 2025")', // Example - will need to be dynamic
  dayEntry: '.day-entry',
  todayHighlight: '.today-highlight',
  pastDay: '.past-day',
  weekendHighlight: '.holiday-weekend-highlight',
  holidayBadge: '.bg-blue-100.dark\\:bg-blue-900',
  timeRings: {
    day: 'svg:has-text("Day")',
    week: 'svg:has-text("Week")', 
    month: 'svg:has-text("Month")',
    year: 'svg:has-text("Year")'
  },
  dayById: (date: string) => `#day-${date}`,
  dayByDate: (date: string) => `[data-date="${date}"]`
};