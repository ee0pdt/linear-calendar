import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createDAVClient } from 'tsdav'
import ICAL from 'ical'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Helper function to preprocess ICAL data and fix floating time issues
function preprocessICALData(icalData) {
  // Add London timezone definition to the calendar if not present
  let processedData = icalData

  if (!processedData.includes('BEGIN:VTIMEZONE')) {
    // Add Europe/London timezone definition
    const londonTz = `BEGIN:VTIMEZONE
TZID:Europe/London
BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
`
    // Insert timezone after BEGIN:VCALENDAR
    processedData = processedData.replace(
      /(BEGIN:VCALENDAR[\s\S]*?\n)/,
      `$1${londonTz}`,
    )
  }

  // Fix floating time datetime values by adding TZID parameter
  // Match DTSTART and DTEND without TZID that have time components
  processedData = processedData.replace(
    /^(DTSTART|DTEND):(\d{8}T\d{6})$/gm,
    '$1;TZID=Europe/London:$2',
  )

  return processedData
}

// Parse FRONTEND_URL to handle comma-separated values
const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : []

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      ...frontendUrls,
    ].filter(Boolean),
    credentials: true,
  }),
)
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CalDAV Proxy Server Running' })
})

// Main calendar endpoint
app.get('/api/calendar', async (req, res) => {
  try {
    const { username, password } = req.query

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message:
          'Please provide username and password (app-specific password for iCloud)',
      })
    }

    console.log(`Attempting to connect to CalDAV for user: ${username}`)

    // Create CalDAV client for iCloud
    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: {
        username: username,
        password: password,
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    })

    console.log('CalDAV client created, fetching calendars...')

    // Get calendars directly - tsdav handles the principal URL internally
    const calendars = await client.fetchCalendars()
    console.log(`Found ${calendars.length} calendars`)

    // Get current year for filtering plus wider range for recurring events
    const currentYear = new Date().getFullYear()
    // Fetch events from a wider range to ensure we get all relevant events
    // This is especially important for recurring events that might start in previous years
    const fetchStart = new Date(currentYear - 5, 0, 1) // 5 years back
    const fetchEnd = new Date(currentYear + 1, 11, 31) // 1 year forward

    console.log(
      `Fetching events from ${fetchStart.toISOString()} to ${fetchEnd.toISOString()}`,
    )

    let allEvents = []
    let fetchedCount = 0
    let filteredCount = 0

    // Fetch events from each calendar
    for (const calendar of calendars) {
      try {
        console.log(`Fetching events from calendar: ${calendar.displayName}`)

        // Get all objects without time filtering first to ensure we get all events
        // We'll filter them client-side later to the current year
        let calendarObjects
        try {
          calendarObjects = await client.fetchCalendarObjects({
            calendar: calendar,
            timeRange: {
              start: fetchStart.toISOString(),
              end: fetchEnd.toISOString(),
            },
          })
        } catch (timeRangeError) {
          console.warn(
            `Time range filtering failed, fetching all events for ${calendar.displayName}`,
          )
          // If time range filtering fails, try without timeRange
          calendarObjects = await client.fetchCalendarObjects({
            calendar: calendar,
          })
        }
        fetchedCount += calendarObjects.length

        console.log(
          `Found ${calendarObjects.length} events in ${calendar.displayName}`,
        )

        // Parse each calendar object
        for (const calendarObject of calendarObjects) {
          try {
            // Preprocess ICAL data to fix floating time issues
            const processedData = preprocessICALData(calendarObject.data)
            const parsed = ICAL.parseICS(processedData)

            for (const key in parsed) {
              const event = parsed[key]
              if (event.type === 'VEVENT') {
                try {
                  console.log(
                    `Processing event: "${event.summary}" from ${calendar.displayName}`,
                  )

                  // Debug log for event properties
                  console.log(`Event details:`, {
                    summary: event.summary,
                    start: event.start,
                    end: event.end,
                    startType: typeof event.start,
                    hasDateTime: event.start.hasOwnProperty('dateTime'),
                    rrule: event.rrule,
                  })

                  // Correctly detect all-day events by examining the event data
                  // Apple Calendar marks all-day events with date-only values (no time component)
                  // or with multi-day events where times are set to 00:00:00
                  let isAllDay = false

                  if (typeof event.start === 'string') {
                    // If the start time is a simple string, check if it has time component
                    isAllDay = !event.start.includes('T')
                  } else if (event.start) {
                    // Otherwise use the dateTime property presence as indicator
                    isAllDay =
                      !event.start.dateTime &&
                      event.start.hasOwnProperty('date')
                  }

                  // Also check for multi-day events where both start and end have 00:00:00 time component
                  if (!isAllDay && event.end && event.start) {
                    // Check if both times look like midnight (without creating Date objects)
                    const startStr = event.start.toString()
                    const endStr = event.end.toString()

                    // Look for patterns that indicate midnight times (00:00:00 or T00:00:00)
                    const isMidnightStart =
                      startStr.includes('T00:00:00') ||
                      startStr.includes(' 00:00:00')
                    const isMidnightEnd =
                      endStr.includes('T00:00:00') ||
                      endStr.includes(' 00:00:00')

                    if (isMidnightStart && isMidnightEnd) {
                      isAllDay = true
                      console.log(
                        `Detected multi-day all-day event: ${event.summary}`,
                      )
                    }
                  }

                  // Create calendar event with proper format
                  // Now that floating times are preprocessed, Date objects should be consistent
                  const calendarEvent = {
                    id: event.uid, // Use the original CalDAV UID as the ID
                    title: event.summary || 'Untitled Event',
                    start:
                      event.start instanceof Date
                        ? event.start.toISOString()
                        : event.start,
                    end: event.end
                      ? event.end instanceof Date
                        ? event.end.toISOString()
                        : event.end
                      : event.start instanceof Date
                        ? event.start.toISOString()
                        : event.start,
                    allDay: isAllDay,
                    rrule: event.rrule ? event.rrule.toString() : undefined,
                    isRecurring: !!event.rrule,
                    calendarName: calendar.displayName,
                    calendarUrl: calendar.url, // Save the calendar URL for later syncing
                  }

                  console.log(
                    `Processed event "${calendarEvent.title}": allDay=${calendarEvent.allDay}, start=${calendarEvent.start}`,
                  )

                  // Include all events - let client handle recurring event expansion and year filtering
                  allEvents.push(calendarEvent)
                } catch (eventError) {
                  console.error(
                    `Error processing event "${event.summary || 'Unknown'}":`,
                    eventError,
                  )
                }
              }
            }
          } catch (parseError) {
            console.warn(
              `Error parsing event in ${calendar.displayName}:`,
              parseError.message,
            )
          }
        }
      } catch (calendarError) {
        console.warn(
          `Error fetching calendar ${calendar.displayName}:`,
          calendarError.message,
        )
      }
    }

    console.log(`Total events retrieved: ${allEvents.length}`)

    // Sort events by start date
    allEvents.sort((a, b) => a.start - b.start)

    // Add calendar stats for debugging
    const calendarStats = calendars.map((cal) => {
      const eventsInCal = allEvents.filter(
        (e) => e.calendarName === cal.displayName,
      ).length
      return {
        name: cal.displayName,
        eventCount: eventsInCal,
      }
    })

    res.json({
      success: true,
      events: allEvents,
      calendars: calendars.map((cal) => ({
        name: cal.displayName,
        color: cal.color,
        url: cal.url,
      })),
      count: allEvents.length,
      totalFetched: fetchedCount,
      stats: {
        currentYear,
        calendarsFound: calendars.length,
        totalEventsFetched: fetchedCount,
        eventsReturned: allEvents.length,
        calendarBreakdown: calendarStats,
        allDayEvents: allEvents.filter((e) => e.allDay).length,
        timedEvents: allEvents.filter((e) => !e.allDay).length,
        recurringEvents: allEvents.filter((e) => e.isRecurring).length,
      },
      message: `Successfully retrieved ${allEvents.length} events from ${calendars.length} calendars`,
    })
  } catch (error) {
    console.error('CalDAV Error:', error)

    // Provide helpful error messages
    let errorMessage = 'Failed to connect to Apple Calendar'
    let suggestions = []

    if (
      error.message.includes('401') ||
      error.message.includes('authentication')
    ) {
      errorMessage = 'Authentication failed'
      suggestions = [
        "Make sure you're using your Apple ID email as username",
        'Use an app-specific password, not your regular Apple ID password',
        'Generate app passwords at: appleid.apple.com → Sign-In and Security → App-Specific Passwords',
      ]
    } else if (
      error.message.includes('network') ||
      error.message.includes('ENOTFOUND')
    ) {
      errorMessage = 'Network connection failed'
      suggestions = [
        'Check your internet connection',
        'Apple CalDAV servers might be temporarily unavailable',
      ]
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message,
      suggestions: suggestions,
    })
  }
})

// Get specific calendar
app.get('/api/calendar/:calendarId', async (req, res) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Specific calendar fetching not yet implemented',
  })
})

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Linear Calendar CalDAV Proxy Server',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Health check',
      'GET /api/calendar':
        'Fetch all calendar events (requires username & password query params)',
      'GET /api/calendar/:id': 'Fetch specific calendar (not implemented)',
    },
    usage: {
      example:
        '/api/calendar?username=your@icloud.com&password=your-app-specific-password',
      note: 'Use app-specific passwords for iCloud, not your regular Apple ID password',
    },
    setup: {
      'App Passwords':
        'Generate at appleid.apple.com → Sign-In and Security → App-Specific Passwords',
      CORS: 'Configure FRONTEND_URL environment variable for production',
    },
  })
})

app.post('/api/calendar/events', async (req, res) => {
  const { username, password, event } = req.body
  if (!username || !password || !event) {
    return res
      .status(400)
      .json({ success: false, error: 'Missing credentials or event data' })
  }
  if (!event.title || !event.start) {
    return res
      .status(400)
      .json({ success: false, error: 'Event must have a title and start date' })
  }
  try {
    console.log('Creating CalDAV client for user:', username)
    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { username, password },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    })
    console.log('CalDAV client created successfully')
    const calendars = await client.fetchCalendars()
    // Filter out non-calendar objects like Reminders
    const actualCalendars = calendars.filter(cal => 
      cal.url && 
      cal.displayName && 
      !cal.displayName.toLowerCase().includes('reminder') &&
      cal.url.includes('/calendars/')
    )
    
    if (actualCalendars.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'No actual calendars found (only found Reminders or other non-calendar objects)' })
    }
    
    const calendar = actualCalendars[0] // Use first actual calendar
    // Generate a UID and filename
    const uid = event.uid || `event-${Date.now()}`
    const filename = `${uid}.ics`
    // Create a simple iCal VEVENT string with proper formatting
    const formatDateTime = (dateStr, allDay = false) => {
      if (allDay) {
        // For all-day events, use DATE format (YYYYMMDD)
        return dateStr.replace(/-/g, '').substring(0, 8)
      } else {
        // For timed events, use DATETIME format (YYYYMMDDTHHMMSSZ)
        return dateStr.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      }
    }

    const dtStart = event.allDay
      ? `DTSTART;VALUE=DATE:${formatDateTime(event.start, true)}`
      : `DTSTART:${formatDateTime(event.start)}`
    const dtEnd = event.end
      ? event.allDay
        ? `DTEND;VALUE=DATE:${formatDateTime(event.end, true)}`
        : `DTEND:${formatDateTime(event.end)}`
      : ''

    const vevent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Linear Calendar//Calendar 1.0//EN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `SUMMARY:${event.title}`,
      dtStart,
      dtEnd,
      `DTSTAMP:${formatDateTime(new Date().toISOString())}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n')
    await client.createCalendarObject({ calendar, filename, data: vevent })
    res.json({ success: true, eventId: uid })
  } catch (error) {
    console.error(
      'POST /api/calendar/events error:',
      error,
      error && error.stack,
    )
    if (
      error.message &&
      (error.message.includes('Invalid credentials') ||
        error.message.includes('401'))
    ) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication failed' })
    }
    if (error.message && error.message.includes('cannot find homeUrl')) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication failed' })
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create event',
    })
  }
})

// New endpoint that uses the calendar URL from the event data
app.post('/api/calendar/events/update', async (req, res) => {
  const { username, password, eventId, event } = req.body
  if (!username || !password || !eventId || !event) {
    return res
      .status(400)
      .json({ success: false, error: 'Missing credentials, eventId, or event data' })
  }
  
  if (!event.calendarUrl) {
    return res
      .status(400)
      .json({ success: false, error: 'Event missing calendarUrl - cannot determine which calendar to update' })
  }
  
  try {
    console.log('Creating CalDAV client for user:', username)
    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { username, password },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    })
    console.log('CalDAV client created successfully')
    
    // We need to fetch calendars to get the full calendar object that matches our URL
    const calendars = await client.fetchCalendars()
    const calendar = calendars.find(cal => cal.url === event.calendarUrl)
    
    if (!calendar) {
      return res
        .status(404)
        .json({ success: false, error: `Calendar not found with URL: ${event.calendarUrl}` })
    }
    
    console.log('Found matching calendar:', calendar.displayName, 'with URL:', calendar.url)
    console.log('Calendar object properties:', Object.keys(calendar))
    console.log('Full calendar object:', JSON.stringify(calendar, null, 2))
    
    const filename = `${eventId}.ics`
    console.log('Looking for event with filename:', filename)

    // Create updated VEVENT string with proper formatting
    const formatDateTime = (dateStr, allDay = false) => {
      if (allDay) {
        return dateStr.replace(/-/g, '').substring(0, 8)
      } else {
        return dateStr.replace(/[-:]/g, '').replace(/\\.\\d{3}/, '')
      }
    }

    const dtStart = event.allDay
      ? `DTSTART;VALUE=DATE:${formatDateTime(event.start, true)}`
      : `DTSTART:${formatDateTime(event.start)}`
    const dtEnd = event.end
      ? event.allDay
        ? `DTEND;VALUE=DATE:${formatDateTime(event.end, true)}`
        : `DTEND:${formatDateTime(event.end)}`
      : ''

    const vevent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Linear Calendar//Calendar 1.0//EN',
      'BEGIN:VEVENT',
      `UID:${eventId}`,
      `SUMMARY:${event.title}`,
      dtStart,
      dtEnd,
      `DTSTAMP:${formatDateTime(new Date().toISOString())}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n')
    
    console.log('About to call updateCalendarObject with:')
    console.log('- calendar:', calendar)
    console.log('- filename:', filename)
    console.log('- data length:', vevent.length)
    
    // Fix: updateCalendarObject expects a calendarObject with url, data, and etag
    // First, get the existing calendar object to get its etag
    const calendarObjectUrl = `${calendar.url}${filename}`
    console.log('Getting existing calendar object from:', calendarObjectUrl)
    
    const existingObjects = await client.fetchCalendarObjects({
      calendar,
      objectUrls: [calendarObjectUrl]
    })
    
    if (existingObjects.length === 0) {
      throw new Error(`Calendar object not found at ${calendarObjectUrl}`)
    }
    
    const existingObject = existingObjects[0]
    console.log('Found existing object with etag:', existingObject.etag)
    
    // Now update using the correct tsdav signature
    await client.updateCalendarObject({
      calendarObject: {
        url: calendarObjectUrl,
        data: vevent,
        etag: existingObject.etag
      }
    })
    console.log('updateCalendarObject completed successfully')
    
    res.json({ success: true })
  } catch (error) {
    console.error(
      'POST /api/calendar/events/update error:',
      error,
      error && error.stack,
    )
    if (
      error.message &&
      (error.message.includes('Invalid credentials') ||
        error.message.includes('401'))
    ) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication failed' })
    }
    if (error.message && error.message.includes('cannot find homeUrl')) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication failed' })
    }
    if (error.message && error.message.includes('404')) {
      return res.status(404).json({ success: false, error: 'Event not found' })
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update event',
    })
  }
})

app.put('/api/calendar/events/:eventId', async (req, res) => {
  const { username, password, event } = req.body
  const { eventId } = req.params
  if (!username || !password || !event) {
    return res
      .status(400)
      .json({ success: false, error: 'Missing credentials or event data' })
  }
  try {
    console.log('Creating CalDAV client for user:', username)
    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { username, password },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    })
    console.log('CalDAV client created successfully')
    const calendars = await client.fetchCalendars()
    console.log('Fetched calendars:', calendars?.length || 0, 'calendars')
    
    // Filter out non-calendar objects like Reminders
    const actualCalendars = calendars.filter(cal => 
      cal.url && 
      cal.displayName && 
      !cal.displayName.toLowerCase().includes('reminder') &&
      cal.url.includes('/calendars/')
    )
    console.log('Actual calendars after filtering:', actualCalendars?.length || 0)
    
    if (actualCalendars.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'No actual calendars found (only found Reminders or other non-calendar objects)' })
    }
    
    const calendar = actualCalendars[0]
    console.log('Using calendar:', calendar?.displayName || 'Unknown')
    const filename = `${eventId}.ics`

    // Create updated VEVENT string with proper formatting
    const formatDateTime = (dateStr, allDay = false) => {
      if (allDay) {
        return dateStr.replace(/-/g, '').substring(0, 8)
      } else {
        return dateStr.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      }
    }

    const dtStart = event.allDay
      ? `DTSTART;VALUE=DATE:${formatDateTime(event.start, true)}`
      : `DTSTART:${formatDateTime(event.start)}`
    const dtEnd = event.end
      ? event.allDay
        ? `DTEND;VALUE=DATE:${formatDateTime(event.end, true)}`
        : `DTEND:${formatDateTime(event.end)}`
      : ''

    const vevent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Linear Calendar//Calendar 1.0//EN',
      'BEGIN:VEVENT',
      `UID:${eventId}`,
      `SUMMARY:${event.title}`,
      dtStart,
      dtEnd,
      `DTSTAMP:${formatDateTime(new Date().toISOString())}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n')
    await client.updateCalendarObject({ calendar, filename, data: vevent })
    res.json({ success: true })
  } catch (error) {
    console.error(
      'PUT /api/calendar/events/:eventId error:',
      error,
      error && error.stack,
    )
    if (
      error.message &&
      (error.message.includes('Invalid credentials') ||
        error.message.includes('401'))
    ) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication failed' })
    }
    if (error.message && error.message.includes('cannot find homeUrl')) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication failed' })
    }
    if (error.message && error.message.includes('404')) {
      return res.status(404).json({ success: false, error: 'Event not found' })
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update event',
    })
  }
})

app.delete('/api/calendar/events/:eventId', async (req, res) => {
  const { username, password } = req.query
  const { eventId } = req.params
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, error: 'Missing credentials' })
  }
  try {
    console.log('Creating CalDAV client for user:', username)
    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { username, password },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    })
    console.log('CalDAV client created successfully')
    const calendars = await client.fetchCalendars()
    console.log('Fetched calendars:', calendars?.length || 0, 'calendars')
    
    // Filter out non-calendar objects like Reminders
    const actualCalendars = calendars.filter(cal => 
      cal.url && 
      cal.displayName && 
      !cal.displayName.toLowerCase().includes('reminder') &&
      cal.url.includes('/calendars/')
    )
    console.log('Actual calendars after filtering:', actualCalendars?.length || 0)
    
    if (actualCalendars.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'No actual calendars found (only found Reminders or other non-calendar objects)' })
    }
    
    const calendar = actualCalendars[0]
    console.log('Using calendar:', calendar?.displayName || 'Unknown')
    const filename = `${eventId}.ics`
    await client.deleteCalendarObject({ calendar, filename })
    res.json({ success: true })
  } catch (error) {
    console.error(
      'DELETE /api/calendar/events/:eventId error:',
      error,
      error && error.stack,
    )
    if (error.message && error.message.includes('404')) {
      return res.status(404).json({ success: false, error: 'Event not found' })
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete event',
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
  })
})

// Move 404 handler to the very end
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.originalUrl} not found`,
  })
})

// Export app for testing
export { app }

app.listen(PORT, () => {
  console.log(`🚀 CalDAV Proxy Server running on port ${PORT}`)
  console.log(`📅 Ready to proxy Apple Calendar requests`)
  console.log(`🔗 API Documentation: http://localhost:${PORT}`)
  console.log(`💡 Generate app passwords at: https://appleid.apple.com`)
})
