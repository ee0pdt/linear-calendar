// Quick test script to verify recurring events are working
import { parseICSFile } from './src/utils/icsParser.ts'

const testICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-recurring@example.com
DTSTART:20250101T100000Z
DTEND:20250101T110000Z
SUMMARY:Daily Meeting
RRULE:FREQ=DAILY;COUNT=5
END:VEVENT
END:VCALENDAR`

console.log('Testing recurring event parsing...')
const events = parseICSFile(testICS, 2025)
console.log(`Found ${events.length} events:`)

events.forEach((event, index) => {
  console.log(
    `${index + 1}. ${event.title} - ${event.start.toISOString()} (recurring: ${event.isRecurring})`,
  )
})

console.log('\nRecurring events test completed!')
