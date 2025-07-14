import { useRef, useEffect } from 'react'

interface UseScrollToTodayProps {
  dateRange: { startYear: number; endYear: number }
  setDateRange: (range: { startYear: number; endYear: number }) => void
}

export function useScrollToToday({
  dateRange,
  setDateRange,
}: UseScrollToTodayProps) {
  const todayRef = useRef<HTMLDivElement>(null)

  const jumpToToday = (smooth = true) => {
    const currentYear = new Date().getFullYear()

    // Check if current year is in the loaded range
    const isCurrentYearInRange =
      currentYear >= dateRange.startYear && currentYear <= dateRange.endYear

    if (!isCurrentYearInRange) {
      // Expand the date range to include the current year
      const newStartYear = Math.min(dateRange.startYear, currentYear)
      const newEndYear = Math.max(dateRange.endYear, currentYear)

      setDateRange({
        startYear: newStartYear,
        endYear: newEndYear,
      })

      // Wait for the component to re-render with the new range, then scroll
      setTimeout(() => {
        scrollToTodayElement(smooth)
      }, 100)
    } else {
      // Current year is already in range, just scroll
      scrollToTodayElement(smooth)
    }
  }

  const scrollToTodayElement = (smooth = true) => {
    if (todayRef.current) {
      const element = todayRef.current

      // Find the scrollable events panel (works for both mobile and desktop)
      const eventsPanel = document.querySelector('.events-panel')
      if (eventsPanel) {
        const elementPosition = element.offsetTop
        const offsetPosition = elementPosition - 216
        // Reset to original header height

        eventsPanel.scrollTo({
          top: offsetPosition,
          behavior: smooth ? 'smooth' : 'instant',
        })
      }
    }
  }

  // Auto-scroll to today on page load
  useEffect(() => {
    // Use a small delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      scrollToTodayElement(false) // Use instant scroll for initial load (don't expand range on initial load)
    }, 100)

    return () => clearTimeout(timer)
  }, [dateRange]) // Re-run when date range changes

  return {
    todayRef,
    jumpToToday,
  }
}
