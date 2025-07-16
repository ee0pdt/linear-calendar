// Test script to verify future year support for events
const { parseICSFile } = require('./dist/utils/icsParser')
const { expandRecurringEvent } = require('./dist/utils/recurrenceUtils')

// Create a simple ICS file with a 2026 event
const testICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20260315T100000Z
DTEND:20260315T110000Z
SUMMARY:Test Event 2026
RRULE:FREQ=MONTHLY;COUNT=12
END:VEVENT
END:VCALENDAR`

// Test parsing with year range including 2026
console.log('Testing ICS parsing with year range 2024-2027...')
try {
  const events = parseICSFile(testICS, 2024, 2027)
  console.log(`Found ${events.length} events:`)
  events.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title} - ${event.start.toISOString().split('T')[0]}`)
  })
} catch (error) {
  console.error('Test failed:', error.message)
}