import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollToToday } from '../../hooks/useScrollToToday'

// Mock DOM methods
const mockScrollTo = vi.fn()
const mockQuerySelector = vi.fn()

describe('useScrollToToday', () => {
  let mockDateRange: { startYear: number; endYear: number }
  let mockSetDateRange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock current year to 2025
    vi.setSystemTime(new Date(2025, 5, 5)) // June 5, 2025

    mockDateRange = { startYear: 2024, endYear: 2026 }
    mockSetDateRange = vi.fn()

    // Mock DOM methods
    mockQuerySelector.mockReturnValue({
      scrollTo: mockScrollTo,
    })
    global.document.querySelector = mockQuerySelector

    // Clear mocks
    mockScrollTo.mockClear()
    mockQuerySelector.mockClear()
    mockSetDateRange.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with todayRef and jumpToToday function', () => {
    const { result } = renderHook(() =>
      useScrollToToday({
        dateRange: mockDateRange,
        setDateRange: mockSetDateRange,
      }),
    )

    expect(result.current.todayRef).toBeDefined()
    expect(typeof result.current.jumpToToday).toBe('function')
  })

  it('should scroll to today when current year is in range', () => {
    const { result } = renderHook(() =>
      useScrollToToday({
        dateRange: mockDateRange, // 2024-2026 includes current year 2025
        setDateRange: mockSetDateRange,
      }),
    )

    // Mock todayRef.current
    const mockTodayElement = { offsetTop: 1000 }
    result.current.todayRef.current = mockTodayElement as HTMLDivElement

    act(() => {
      result.current.jumpToToday()
    })

    expect(mockQuerySelector).toHaveBeenCalledWith('.events-panel')
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 1000 - 228, // offsetTop - TODAY_OFFSET
      behavior: 'smooth',
    })
    expect(mockSetDateRange).not.toHaveBeenCalled()
  })

  it('should expand date range when current year is not in range', () => {
    const { result } = renderHook(() =>
      useScrollToToday({
        dateRange: { startYear: 2020, endYear: 2022 }, // 2025 not in range
        setDateRange: mockSetDateRange,
      }),
    )

    act(() => {
      result.current.jumpToToday()
    })

    expect(mockSetDateRange).toHaveBeenCalledWith({
      startYear: 2020, // min(2020, 2025)
      endYear: 2025, // max(2022, 2025)
    })
  })

  it('should use instant scroll when smooth=false', () => {
    const { result } = renderHook(() =>
      useScrollToToday({
        dateRange: mockDateRange,
        setDateRange: mockSetDateRange,
      }),
    )

    // Mock todayRef.current
    const mockTodayElement = { offsetTop: 1000 }
    result.current.todayRef.current = mockTodayElement as HTMLDivElement

    act(() => {
      result.current.jumpToToday(false)
    })

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 1000 - 228,
      behavior: 'instant',
    })
  })

  it('should not scroll if todayRef is not set', () => {
    const { result } = renderHook(() =>
      useScrollToToday({
        dateRange: mockDateRange,
        setDateRange: mockSetDateRange,
      }),
    )

    // Don't set todayRef.current

    act(() => {
      result.current.jumpToToday()
    })

    expect(mockScrollTo).not.toHaveBeenCalled()
  })

  it('should not scroll if events panel is not found', () => {
    const { result } = renderHook(() =>
      useScrollToToday({
        dateRange: mockDateRange,
        setDateRange: mockSetDateRange,
      }),
    )

    // Mock todayRef.current but return null for querySelector
    const mockTodayElement = { offsetTop: 1000 }
    result.current.todayRef.current = mockTodayElement as HTMLDivElement
    mockQuerySelector.mockReturnValue(null)

    act(() => {
      result.current.jumpToToday()
    })

    expect(mockScrollTo).not.toHaveBeenCalled()
  })
})
