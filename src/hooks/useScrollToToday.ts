import { useRef, useEffect } from 'react'

export function useScrollToToday() {
  const todayRef = useRef<HTMLDivElement>(null)

  const jumpToToday = (smooth = true) => {
    if (todayRef.current) {
      const element = todayRef.current

      // Find the scrollable events panel (works for both mobile and desktop)
      const eventsPanel = document.querySelector('.events-panel')
      if (eventsPanel) {
        const elementPosition = element.offsetTop
        const offsetPosition = elementPosition - 220 // Account for fixed header and comfortable viewing

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
      jumpToToday(false) // Use instant scroll for initial load
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return {
    todayRef,
    jumpToToday,
  }
}
