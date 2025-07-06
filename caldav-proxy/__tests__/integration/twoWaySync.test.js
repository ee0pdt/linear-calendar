import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

// Mock cross-fetch before importing the app
vi.mock('cross-fetch', () => {
  return {
    fetch: async (url, options = {}) => {
      // Log incoming request
      // eslint-disable-next-line no-console
      console.log('[MOCK FETCH] URL:', url)
      // eslint-disable-next-line no-console
      console.log('[MOCK FETCH] Method:', options.method)
      // eslint-disable-next-line no-console
      console.log('[MOCK FETCH] Headers:', options.headers)
      // eslint-disable-next-line no-console
      console.log('[MOCK FETCH] Body:', options.body)

      let response
      // Simulate CalDAV discovery (PROPFIND for principal-URL and home-URL)
      if (
        url.toString().includes('caldav.icloud.com') &&
        options.method === 'PROPFIND'
      ) {
        // Minimal valid XML for principal discovery
        if (options.body && options.body.includes('principal-collection-set')) {
          response = {
            ok: true,
            status: 207,
            url,
            statusText: 'Multi-Status',
            headers: {
              get: (h) => (h === 'content-type' ? 'application/xml' : null),
            },
            text: async () =>
              `<?xml version="1.0"?><d:multistatus xmlns:d="DAV:"><d:response><d:href>/users/test@icloud.com/</d:href><d:propstat><d:prop><d:current-user-principal><d:href>/users/test@icloud.com/</d:href></d:current-user-principal></d:prop></d:propstat></d:response></d:multistatus>`,
          }
        } else if (options.body && options.body.includes('calendar-home-set')) {
          response = {
            ok: true,
            status: 207,
            url,
            statusText: 'Multi-Status',
            headers: {
              get: (h) => (h === 'content-type' ? 'application/xml' : null),
            },
            text: async () =>
              `<?xml version="1.0"?><d:multistatus xmlns:d="DAV:"><d:response><d:href>/users/test@icloud.com/calendars/</d:href><d:propstat><d:prop><d:calendar-home-set><d:href>/users/test@icloud.com/calendars/</d:href></d:calendar-home-set></d:prop></d:propstat></d:response></d:multistatus>`,
          }
        } else {
          response = {
            ok: true,
            status: 207,
            url,
            statusText: 'Multi-Status',
            headers: {
              get: (h) => (h === 'content-type' ? 'application/xml' : null),
            },
            text: async () =>
              `<?xml version="1.0"?><d:multistatus xmlns:d="DAV:"></d:multistatus>`,
          }
        }
      } else if (
        url.toString().includes('caldav.icloud.com') &&
        options.method === 'OPTIONS'
      ) {
        response = {
          ok: true,
          status: 200,
          url,
          statusText: 'OK',
          headers: { get: (h) => (h === 'content-type' ? 'text/plain' : null) },
          text: async () => '',
        }
      } else if (
        url.toString().includes('caldav.icloud.com') &&
        options.method === 'GET'
      ) {
        response = {
          ok: true,
          status: 200,
          url,
          statusText: 'OK',
          headers: {
            get: (h) => (h === 'content-type' ? 'application/json' : null),
          },
          json: async () => [{ displayName: 'Test Calendar', url: 'test-url' }],
          text: async () =>
            JSON.stringify([{ displayName: 'Test Calendar', url: 'test-url' }]),
        }
      } else if (
        url.toString().includes('caldav.icloud.com') &&
        options.method === 'POST'
      ) {
        if (options.body && options.body.includes('wrong@icloud.com')) {
          response = {
            ok: false,
            status: 401,
            url,
            statusText: 'Unauthorized',
            headers: { get: () => null },
            text: async () => 'Unauthorized',
          }
        } else {
          response = {
            ok: true,
            status: 201,
            url,
            statusText: 'Created',
            headers: { get: () => null },
            text: async () => 'Created',
          }
        }
      } else if (
        url.toString().includes('caldav.icloud.com') &&
        options.method === 'PUT'
      ) {
        if (url.toString().includes('non-existent-event')) {
          response = {
            ok: false,
            status: 404,
            url,
            statusText: 'Not Found',
            headers: { get: () => null },
            text: async () => 'Not Found',
          }
        } else {
          response = {
            ok: true,
            status: 200,
            url,
            statusText: 'OK',
            headers: { get: () => null },
            text: async () => 'OK',
          }
        }
      } else if (
        url.toString().includes('caldav.icloud.com') &&
        options.method === 'DELETE'
      ) {
        response = {
          ok: true,
          status: 200,
          url,
          statusText: 'OK',
          headers: { get: () => null },
          text: async () => 'OK',
        }
      } else {
        response = {
          ok: false,
          status: 500,
          url,
          statusText: 'Unknown',
          headers: { get: () => null },
          text: async () => 'Unknown',
        }
      }

      // Log outgoing response
      // eslint-disable-next-line no-console
      console.log('[MOCK FETCH] Response status:', response.status)
      // eslint-disable-next-line no-console
      if (response.text) {
        const body = await response.text()
        // eslint-disable-next-line no-console
        console.log('[MOCK FETCH] Response body:', body)
      }
      return response
    },
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
