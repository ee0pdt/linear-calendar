import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventDetailsModal } from '../../components/EventDetailsModal'
import type { CalendarEvent } from '../../types'

// Mock navigator.userAgent for map link tests
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
})

const mockEvent: CalendarEvent = {
  title: 'Test Event',
  start: new Date(2025, 5, 10, 9, 0),
  end: new Date(2025, 5, 10, 10, 0),
  allDay: false,
  location: 'Conference Room A, Building 2',
  description: 'Test description',
  organizer: 'test@example.com',
  url: 'https://example.com',
  uid: 'test-uid-123',
  isRecurring: false,
}

describe('EventDetailsModal Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders event details when open', () => {
    render(
      <EventDetailsModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
      />,
    )

    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(
      screen.getByText('Conference Room A, Building 2'),
    ).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <EventDetailsModal
        event={mockEvent}
        isOpen={false}
        onClose={mockOnClose}
      />,
    )

    expect(screen.queryByText('Test Event')).not.toBeInTheDocument()
  })

  it('renders map links for location', () => {
    render(
      <EventDetailsModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
      />,
    )

    const appleMapLink = screen.getByText('Apple Maps')
    const googleMapLink = screen.getByText('Google Maps')

    expect(appleMapLink).toBeInTheDocument()
    expect(googleMapLink).toBeInTheDocument()

    // Check href attributes contain encoded location
    expect(appleMapLink.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining(
        'http://maps.apple.com/?q=Conference%20Room%20A%2C%20Building%202',
      ),
    )
    expect(googleMapLink.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining(
        'https://www.google.com/maps/search/?api=1&query=Conference%20Room%20A%2C%20Building%202',
      ),
    )
  })

  it('does not render location section when no location', () => {
    const eventWithoutLocation = { ...mockEvent, location: undefined }

    render(
      <EventDetailsModal
        event={eventWithoutLocation}
        isOpen={true}
        onClose={mockOnClose}
      />,
    )

    expect(screen.queryByText('Location')).not.toBeInTheDocument()
    expect(screen.queryByText('Apple Maps')).not.toBeInTheDocument()
  })

  it('renders URL link when provided', () => {
    render(
      <EventDetailsModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
      />,
    )

    const urlLink = screen.getByText('https://example.com')
    expect(urlLink).toBeInTheDocument()
    expect(urlLink.closest('a')).toHaveAttribute('href', 'https://example.com')
  })

  it('renders organizer information', () => {
    render(
      <EventDetailsModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
      />,
    )

    expect(screen.getByText('Organizer')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('handles location with newlines', () => {
    const eventWithMultilineLocation = {
      ...mockEvent,
      location:
        'Steamhouse Depot, Banbury\n1a Walker Road, Banbury, OX16 1HE, England',
    }

    render(
      <EventDetailsModal
        event={eventWithMultilineLocation}
        isOpen={true}
        onClose={mockOnClose}
      />,
    )

    const appleMapLink = screen.getByText('Apple Maps')
    expect(appleMapLink.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining(
        'Steamhouse%20Depot%2C%20Banbury%201a%20Walker%20Road',
      ),
    )
  })
})
