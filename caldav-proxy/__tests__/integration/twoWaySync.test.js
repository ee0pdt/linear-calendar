import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import nock from 'nock'
import { app } from '../../server.js'

describe('Two-Way Sync API', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('POST /api/calendar/events', () => {
    it('should create a new event successfully', async () => {
      const eventData = {
        title: 'New Meeting',
        start: '2025-01-15T10:00:00Z',
        end: '2025-01-15T11:00:00Z',
        allDay: false,
      }
      nock('https://caldav.icloud.com').post(/.*/).reply(201, 'Created')
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
      nock('https://caldav.icloud.com').post(/.*/).reply(401, 'Unauthorized')
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
      nock('https://caldav.icloud.com').put(/.*/).reply(200, 'OK')
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
      nock('https://caldav.icloud.com').put(/.*/).reply(404, 'Not Found')
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
      nock('https://caldav.icloud.com').delete(/.*/).reply(200, 'OK')
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
