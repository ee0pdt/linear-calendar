import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
// Import the component directly instead of using router
import { LinearCalendar } from '../../routes/index'

// Mock the current date to be consistent in tests
const MOCK_TODAY = new Date(2025, 5, 5) // June 5, 2025

beforeEach(() => {
  vi.setSystemTime(MOCK_TODAY)
})

describe('LinearCalendar Component', () => {
  it('renders the calendar header with correct information', () => {
    render(<LinearCalendar />)

    // Check for calendar header elements (year is split across elements)
    expect(screen.getByText(/Linear Calendar\s+2025/)).toBeInTheDocument()
    // Note: events count is not displayed when no events are loaded
  })

  it('renders import sections', () => {
    render(<LinearCalendar />)

    expect(screen.getByText('🔗 Live Calendar Import')).toBeInTheDocument()
    expect(screen.getByText('📁 File Import')).toBeInTheDocument()
  })

  it('renders Connect to Apple Calendar button', () => {
    render(<LinearCalendar />)

    expect(screen.getByText('Connect to Apple Calendar')).toBeInTheDocument()
  })

  it('renders file input for ICS upload', () => {
    render(<LinearCalendar />)

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })

  it('renders the calendar with months', () => {
    render(<LinearCalendar />)

    // Should render January (first month) header - use getAllBy since there are multiple instances
    const januaryElements = screen.getAllByText('January')
    expect(januaryElements.length).toBeGreaterThan(0)

    // Should render the header with today's month
    expect(screen.getByText('Today (Jun 5)')).toBeInTheDocument()
  })

  it('renders jump to today buttons', () => {
    render(<LinearCalendar />)

    // There should be jump to today buttons (we use getAllBy since there are multiple)
    const jumpButtons = screen.getAllByTitle('Jump to Today')
    expect(jumpButtons.length).toBeGreaterThan(0)
  })

  it('displays correct day count', () => {
    render(<LinearCalendar />)

    // Check for the header version (there are multiple instances)
    const dayCountElements = screen.getAllByText(
      'Linear Calendar for 2025 • 365 days total',
    )
    expect(dayCountElements.length).toBeGreaterThan(0)
  })
})
