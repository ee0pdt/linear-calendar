import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventSearch } from '../../components/EventSearch'
import type { CalendarEvent } from '../../types'

const mockEvents: CalendarEvent[] = [
  {
    title: 'Quarterly Planning Session',
    start: new Date(2025, 5, 10, 9, 0),
    end: new Date(2025, 5, 10, 10, 0),
    allDay: false,
    location: 'Boardroom Alpha',
    description: 'Strategic planning for Q3',
    isRecurring: false,
  },
  {
    title: 'Coffee with Sarah',
    start: new Date(2025, 6, 22, 12, 0),
    end: new Date(2025, 6, 22, 13, 0),
    allDay: false,
    location: 'Downtown Cafe',
    description: 'Catching up over espresso',
    isRecurring: false,
  },
  {
    title: 'DevOps Workshop',
    start: new Date(2025, 5, 20),
    end: new Date(2025, 5, 21),
    allDay: true,
    location: 'Tech Center Building',
    description: 'Hands-on container orchestration',
    isRecurring: false,
  },
]

describe('EventSearch Component', () => {
  const mockOnEventClick = vi.fn()
  const mockOnScrollToEvent = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input when visible', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByPlaceholderText(/search by event title/i)).toBeInTheDocument()
    expect(screen.getByText('Search Events')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={false}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText('Search Events')).not.toBeInTheDocument()
  })

  it('filters events by title', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by event title/i)
    fireEvent.change(searchInput, { target: { value: 'quarterly' } })

    expect(screen.getByText(/quarterly/i)).toBeInTheDocument()
    expect(screen.getByText(/planning session/i)).toBeInTheDocument()
    expect(screen.queryByText(/coffee/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/devops/i)).not.toBeInTheDocument()
  })

  it('filters events by location', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by event title/i)
    fireEvent.change(searchInput, { target: { value: 'downtown' } })

    expect(screen.getByText(/coffee/i)).toBeInTheDocument()
    expect(screen.getByText(/sarah/i)).toBeInTheDocument()
    expect(screen.queryByText(/quarterly/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/devops/i)).not.toBeInTheDocument()
  })

  it('calls onScrollToEvent when clicking on event result', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by event title/i)
    fireEvent.change(searchInput, { target: { value: 'quarterly' } })

    const eventResult = screen.getByText(/quarterly/i)
    fireEvent.click(eventResult)

    expect(mockOnScrollToEvent).toHaveBeenCalledWith(mockEvents[0])
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onEventClick when clicking info button', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by event title/i)
    fireEvent.change(searchInput, { target: { value: 'quarterly' } })

    const infoButton = screen.getByTitle('View event details')
    fireEvent.click(infoButton)

    expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0])
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows location with map pin emoji', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by event title/i)
    fireEvent.change(searchInput, { target: { value: 'devops' } })

    expect(screen.getByText(/📍.*tech center building/i)).toBeInTheDocument()
  })

  it('displays correct event count', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by event title/i)
    fireEvent.change(searchInput, { target: { value: 'a' } }) // Should match all events

    expect(screen.getByText(/3 events found/i)).toBeInTheDocument()
  })

  it('shows no results message when no events match', () => {
    render(
      <EventSearch
        events={mockEvents}
        onEventClick={mockOnEventClick}
        onScrollToEvent={mockOnScrollToEvent}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search by event title/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No events found')).toBeInTheDocument()
  })
})