import type { CalendarEvent, CalDAVCredentials } from '../types'

const CALDAV_PROXY_URL = 'http://localhost:3001/api/calendar/events'
const CALDAV_UPDATE_URL = 'http://localhost:3001/api/calendar/events/update'

// Function to get stored CalDAV credentials from localStorage
function getStoredCredentials(): CalDAVCredentials | null {
  const saved = localStorage.getItem('linear-calendar-caldav-credentials')
  if (saved) {
    try {
      const creds = JSON.parse(saved)
      if (creds.username && creds.password) {
        return creds
      }
    } catch {
      return null
    }
  }
  return null
}

export class CalDAVService {
  hasCredentials(): boolean {
    const creds = getStoredCredentials()
    return creds !== null && !!creds.username && !!creds.password
  }

  private getCredentials(): CalDAVCredentials | null {
    return getStoredCredentials()
  }

  async createEvent(event: CalendarEvent): Promise<{ success: boolean; eventId?: string; error?: string }> {
    const credentials = this.getCredentials()
    if (!credentials) {
      throw new Error('CalDAV credentials not set')
    }

    try {
      const response = await fetch(CALDAV_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          event: {
            title: event.title,
            start: event.start.toISOString(),
            end: event.end?.toISOString(),
            allDay: event.allDay,
          },
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('CalDAV create event error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateEvent(eventId: string, event: CalendarEvent): Promise<{ success: boolean; error?: string }> {
    const credentials = this.getCredentials()
    if (!credentials) {
      throw new Error('CalDAV credentials not set')
    }

    try {
      const response = await fetch(CALDAV_UPDATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          eventId,
          event: {
            title: event.title,
            start: event.start.toISOString(),
            end: event.end?.toISOString(),
            allDay: event.allDay,
            calendarUrl: event.calendarUrl, // Use the saved calendar URL
          },
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('CalDAV update event error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    const credentials = this.getCredentials()
    if (!credentials) {
      throw new Error('CalDAV credentials not set')
    }

    try {
      const params = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
      })
      
      const response = await fetch(`${CALDAV_PROXY_URL}/${encodeURIComponent(eventId)}?${params}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('CalDAV delete event error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Generate a unique event ID based on title and timestamp
export function generateEventId(event: CalendarEvent): string {
  if (event.id) return event.id
  
  // Create a deterministic ID based on title and start time
  const titleSlug = event.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  const timestamp = event.start.getTime()
  return `${titleSlug}-${timestamp}`
}

export const caldavService = new CalDAVService()