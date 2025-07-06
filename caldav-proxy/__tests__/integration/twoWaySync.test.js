import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

// Mock tsdav instead of cross-fetch
vi.mock('tsdav', () => {
  return {
    createDAVClient: vi.fn(async ({ credentials }) => {
      if (credentials.username === 'wrong@icloud.com') {
        throw new Error('Invalid credentials')
      }
      if (credentials.username === 'nohome@icloud.com') {
        throw new Error('cannot find homeUrl')
      }

      return {
        fetchCalendars: vi.fn(async () => [
          {
            displayName: 'Test Calendar',
            url: 'https://caldav.icloud.com/users/test/calendars/test-calendar/',
            ctag: 'test-ctag',
            description: 'Test calendar description',
            timezone: 'America/New_York',
            supportedCalendarComponentSet: ['VEVENT'],
          },
        ]),
        createCalendarObject: vi.fn(async ({ calendar, filename, data }) => {
          if (data.includes('wrong@icloud.com')) {
            throw new Error('Authentication failed')
          }
          return { etag: 'test-etag', url: `${calendar.url}${filename}` }
        }),
        updateCalendarObject: vi.fn(async ({ calendar, filename, data }) => {
          if (filename.includes('non-existent-event')) {
            const error = new Error('Event not found')
            error.message = '404'
            throw error
          }
          return { etag: 'updated-etag' }
        }),
        deleteCalendarObject: vi.fn(async () => {
          return { status: 200 }
        }),
      }
    }),
  }
})

import { app } from '../../server.js'

describe('Two-Way Sync API', () => {
  describe('POST /api/calendar/events', () => {
    it('should create a new event successfully', async () => {
      const eventData = {
        title: 'New Meeting',
        start: '2025-01-15T10:00:00Z',
        end: '2025-01-15T11:00:00Z',
        allDay: false,
      }
      const response = await request(app).post('/api/calendar/events').send({
        username: 'test@icloud.com',
        password: 'test-password',
        event: eventData,
      })
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.eventId).toBeDefined()
    })
    it('should reject invalid event data', async () => {
      const invalidEvent = {
        title: '',
        start: 'invalid-date',
      }
      const response = await request(app).post('/api/calendar/events').send({
        username: 'test@icloud.com',
        password: 'test-password',
        event: invalidEvent,
      })
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })
    it('should handle CalDAV authentication errors', async () => {
      const response = await request(app)
        .post('/api/calendar/events')
        .send({
          username: 'wrong@icloud.com',
          password: 'wrong-password',
          event: {
            title: 'Test',
            start: '2025-01-15T10:00:00Z',
            end: '2025-01-15T11:00:00Z',
          },
        })
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Authentication failed')
    })
  })

  describe('PUT /api/calendar/events/:eventId', () => {
    it('should update an existing event', async () => {
      const eventId = 'test-event-123'
      const updatedEvent = {
        title: 'Updated Meeting',
        start: '2025-01-15T11:00:00Z',
        end: '2025-01-15T12:00:00Z',
        allDay: false,
      }
      const response = await request(app)
        .put(`/api/calendar/events/${eventId}`)
        .send({
          username: 'test@icloud.com',
          password: 'test-password',
          event: updatedEvent,
        })
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
    it('should handle event not found', async () => {
      const eventId = 'non-existent-event'
      const response = await request(app)
        .put(`/api/calendar/events/${eventId}`)
        .send({
          username: 'test@icloud.com',
          password: 'test-password',
          event: { title: 'Test', start: '2025-01-15T10:00:00Z' },
        })
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Event not found')
    })
  })

  describe('DELETE /api/calendar/events/:eventId', () => {
    it('should delete an event successfully', async () => {
      const eventId = 'test-event-123'
      const response = await request(app)
        .delete(`/api/calendar/events/${eventId}`)
        .query({
          username: 'test@icloud.com',
          password: 'test-password',
        })
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })
})
