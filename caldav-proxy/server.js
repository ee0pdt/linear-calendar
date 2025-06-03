import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createDAVClient } from 'tsdav'
import ICAL from 'ical'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
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
        message: 'Please provide username and password (app-specific password for iCloud)' 
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

    console.log('CalDAV client created, fetching account info...')

    // Get account information
    const account = await client.fetchPrincipalUrl()
    console.log('Account info retrieved, fetching calendars...')

    // Get calendars
    const calendars = await client.fetchCalendars()
    console.log(`Found ${calendars.length} calendars`)

    // Get current year for filtering
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31)

    let allEvents = []

    // Fetch events from each calendar
    for (const calendar of calendars) {
      try {
        console.log(`Fetching events from calendar: ${calendar.displayName}`)
        
        const calendarObjects = await client.fetchCalendarObjects({
          calendar: calendar,
          timeRange: {
            start: yearStart.toISOString(),
            end: yearEnd.toISOString(),
          },
        })

        console.log(`Found ${calendarObjects.length} events in ${calendar.displayName}`)

        // Parse each calendar object
        for (const calendarObject of calendarObjects) {
          try {
            const parsed = ICAL.parseICS(calendarObject.data)
            
            for (const key in parsed) {
              const event = parsed[key]
              if (event.type === 'VEVENT') {
                // Convert to our CalendarEvent format
                const calendarEvent = {
                  title: event.summary || 'Untitled Event',
                  start: new Date(event.start),
                  end: event.end ? new Date(event.end) : new Date(event.start),
                  allDay: !event.start.dateTime, // If no dateTime, it's all-day
                  rrule: event.rrule ? event.rrule.toString() : undefined,
                  isRecurring: !!event.rrule,
                  calendarName: calendar.displayName
                }

                // Only include events from current year
                if (calendarEvent.start.getFullYear() === currentYear) {
                  allEvents.push(calendarEvent)
                }
              }
            }
          } catch (parseError) {
            console.warn(`Error parsing event in ${calendar.displayName}:`, parseError.message)
          }
        }
      } catch (calendarError) {
        console.warn(`Error fetching calendar ${calendar.displayName}:`, calendarError.message)
      }
    }

    console.log(`Total events retrieved: ${allEvents.length}`)

    // Sort events by start date
    allEvents.sort((a, b) => a.start - b.start)

    res.json({
      success: true,
      events: allEvents,
      calendars: calendars.map(cal => ({
        name: cal.displayName,
        color: cal.color,
        url: cal.url
      })),
      count: allEvents.length,
      message: `Successfully retrieved ${allEvents.length} events from ${calendars.length} calendars`
    })

  } catch (error) {
    console.error('CalDAV Error:', error)
    
    // Provide helpful error messages
    let errorMessage = 'Failed to connect to Apple Calendar'
    let suggestions = []

    if (error.message.includes('401') || error.message.includes('authentication')) {
      errorMessage = 'Authentication failed'
      suggestions = [
        'Make sure you\'re using your Apple ID email as username',
        'Use an app-specific password, not your regular Apple ID password',
        'Generate app passwords at: appleid.apple.com → Sign-In and Security → App-Specific Passwords'
      ]
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      errorMessage = 'Network connection failed'
      suggestions = ['Check your internet connection', 'Apple CalDAV servers might be temporarily unavailable']
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message,
      suggestions: suggestions
    })
  }
})

// Get specific calendar
app.get('/api/calendar/:calendarId', async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Specific calendar fetching not yet implemented' 
  })
})

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Linear Calendar CalDAV Proxy Server',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Health check',
      'GET /api/calendar': 'Fetch all calendar events (requires username & password query params)',
      'GET /api/calendar/:id': 'Fetch specific calendar (not implemented)'
    },
    usage: {
      example: '/api/calendar?username=your@icloud.com&password=your-app-specific-password',
      note: 'Use app-specific passwords for iCloud, not your regular Apple ID password'
    },
    setup: {
      'App Passwords': 'Generate at appleid.apple.com → Sign-In and Security → App-Specific Passwords',
      'CORS': 'Configure FRONTEND_URL environment variable for production'
    }
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.originalUrl} not found`
  })
})

app.listen(PORT, () => {
  console.log(`🚀 CalDAV Proxy Server running on port ${PORT}`)
  console.log(`📅 Ready to proxy Apple Calendar requests`)
  console.log(`🔗 API Documentation: http://localhost:${PORT}`)
  console.log(`💡 Generate app passwords at: https://appleid.apple.com`)
})