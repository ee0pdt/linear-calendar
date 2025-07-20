import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from '../../routeTree.gen'

// Mock the current date to be consistent in tests
const MOCK_TODAY = new Date(2025, 5, 5) // June 5, 2025

beforeEach(() => {
  vi.setSystemTime(MOCK_TODAY)
  // Mock scrollTo function for jsdom
  Element.prototype.scrollTo = vi.fn()
})

describe('LinearCalendar Component', () => {
  const router = createRouter({ routeTree })

  // Helper function to wait for the loading sequence to complete
  const waitForCalendarLoad = async () => {
    // Wait for settings button to appear (indicates loading is complete)
    await waitFor(
      () => {
        expect(screen.getByLabelText('Open settings')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  }

  it('renders import sections after opening settings', async () => {
    render(<RouterProvider router={router} />)
    await waitForCalendarLoad()

    // Click on settings button to open settings modal
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    expect(screen.getByText('Import Calendar')).toBeInTheDocument()
  })

  it('renders Connect to Apple Calendar button after opening settings', async () => {
    render(<RouterProvider router={router} />)
    await waitForCalendarLoad()

    // Click on settings button to open settings modal
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    expect(screen.getByText('Connect to Apple Calendar')).toBeInTheDocument()
  })

  it('renders file input for ICS upload after opening settings', async () => {
    render(<RouterProvider router={router} />)
    await waitForCalendarLoad()

    // Click on settings button to open settings modal
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })

  it('renders the current year days', async () => {
    render(<RouterProvider router={router} />)
    await waitForCalendarLoad()

    // Should render June 2025 header
    expect(screen.getByText('June 2025')).toBeInTheDocument()

    // Should highlight today (June 5, 2025)
    expect(screen.getByText('TODAY')).toBeInTheDocument()
  })

  it('renders jump to today button', async () => {
    render(<RouterProvider router={router} />)
    await waitForCalendarLoad()

    const jumpButton = screen.getByTitle('Jump to Today')
    expect(jumpButton).toBeInTheDocument()
  })

  it('displays correct day count', async () => {
    render(<RouterProvider router={router} />)
    await waitForCalendarLoad()

    // Should show the current date range (2024-2026 by default)
    // We need to look for the footer text that shows total days
    expect(screen.getByText(/days total/)).toBeInTheDocument()
  })

  it('scrolls to today when jump to today button is clicked', async () => {
    render(<RouterProvider router={router} />)
    await waitForCalendarLoad()

    // Find the jump to today button
    const jumpButton = screen.getByTitle('Jump to Today')
    expect(jumpButton).toBeInTheDocument()

    // Click the button - this should trigger scroll behavior without error
    expect(() => fireEvent.click(jumpButton)).not.toThrow()

    // Verify scrollTo was called (we mocked it in beforeEach)
    expect(Element.prototype.scrollTo).toHaveBeenCalled()
  })
})
