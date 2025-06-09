import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createDAVClient } from 'tsdav'
import ICAL from 'ical'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Helper function to consistently interpret calendar dates as London time
function formatDateForLondonTime(dateInput) {
  if (!dateInput) return dateInput
  
  // If it's already a Date object with proper timezone, return ISO string
  if (dateInput instanceof Date) {
    return dateInput.toISOString()
  }
  
  // If it's a string, check if it has timezone info
  if (typeof dateInput === 'string') {
    // If it already has timezone info (Z, +, -), return as-is
    if (dateInput.includes('Z') || dateInput.includes('+') || dateInput.includes('-', 10)) {
      return dateInput
    }
    
    // If it's a datetime string without timezone, assume it's London time and convert to UTC
    if (dateInput.includes('T')) {
      // Create a date as if it's UTC, then adjust for London offset
      const tempDate = new Date(dateInput + 'Z') // Treat as UTC first
      
      // Get current London offset (handles BST/GMT automatically)
      const londonOffset = new Date().toLocaleString('en', {timeZone: 'Europe/London', timeZoneName: 'longOffset'}).includes('+01:00') ? 1 : 0
      
      // Subtract London offset to get the correct UTC time
      const correctedDate = new Date(tempDate.getTime() - (londonOffset * 60 * 60 * 1000))
      return correctedDate.toISOString()
    }
  }
  
  return dateInput
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
            const parsed = ICAL.parseICS(calendarObject.data)

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
                      startStr.includes('T00:00:00') || startStr.includes(' 00:00:00')
                    const isMidnightEnd = 
                      endStr.includes('T00:00:00') || endStr.includes(' 00:00:00')

                    if (isMidnightStart && isMidnightEnd) {
                      isAllDay = true
                      console.log(
                        `Detected multi-day all-day event: ${event.summary}`,
                      )
                    }
                  }

                  // Create calendar event with proper format
                  // Force consistent timezone interpretation by treating all times as London time
                  const calendarEvent = {
                    title: event.summary || 'Untitled Event',
                    start: formatDateForLondonTime(event.start),
                    end: formatDateForLondonTime(event.end || event.start),
                    allDay: isAllDay,
                    rrule: event.rrule ? event.rrule.toString() : undefined,
                    isRecurring: !!event.rrule,
                    calendarName: calendar.displayName,
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.originalUrl} not found`,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 CalDAV Proxy Server running on port ${PORT}`)
  console.log(`📅 Ready to proxy Apple Calendar requests`)
  console.log(`🔗 API Documentation: http://localhost:${PORT}`)
  console.log(`💡 Generate app passwords at: https://appleid.apple.com`)
})
