import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from '../../routeTree.gen'

// Mock the current date to be consistent in tests
const MOCK_TODAY = new Date(2025, 5, 5) // June 5, 2025

beforeEach(() => {
  vi.setSystemTime(MOCK_TODAY)
})

describe('LinearCalendar Component', () => {
  const router = createRouter({ routeTree })

  it.skip('renders the calendar title with current year', () => {
    render(<RouterProvider router={router} />)

    expect(screen.getByText('2024-2026 Calendar')).toBeInTheDocument()
  })

  it('renders import sections after opening settings', () => {
    render(<RouterProvider router={router} />)

    // Click on settings button to open settings modal
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    expect(screen.getByText('🔗 Live Calendar Import')).toBeInTheDocument()
    expect(screen.getByText('📁 File Import')).toBeInTheDocument()
  })

  it('renders Connect to Apple Calendar button after opening settings', () => {
    render(<RouterProvider router={router} />)

    // Click on settings button to open settings modal
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    expect(screen.getByText('Connect to Apple Calendar')).toBeInTheDocument()
  })

  it('renders file input for ICS upload after opening settings', () => {
    render(<RouterProvider router={router} />)

    // Click on settings button to open settings modal
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    const fileInput =
      screen.getByRole('button', { name: /choose file/i }) ||
      screen.getByLabelText(/choose file/i) ||
      document.querySelector('input[type="file"]')

    expect(fileInput).toBeInTheDocument()
  })

  it('renders the current year days', () => {
    render(<RouterProvider router={router} />)

    // Should render June 2025 header
    expect(screen.getByText('June 2025')).toBeInTheDocument()

    // Should highlight today (June 5, 2025)
    expect(screen.getByText('TODAY')).toBeInTheDocument()
  })

  it('renders jump to today button', () => {
    render(<RouterProvider router={router} />)

    const jumpButton = screen.getByTitle('Jump to Today')
    expect(jumpButton).toBeInTheDocument()
  })

  it('displays correct day count', () => {
    render(<RouterProvider router={router} />)

    // 2025 has 365 days (not a leap year)
    expect(
      screen.getByText('Linear Calendar for 2025 • 365 days total'),
    ).toBeInTheDocument()
  })
})
