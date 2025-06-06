import { useRef } from 'react'

export function useScrollToToday() {
  const todayRef = useRef<HTMLDivElement>(null)

  const jumpToToday = () => {
    if (todayRef.current) {
      const element = todayRef.current

      // Find the scrollable events panel (works for both mobile and desktop)
      const eventsPanel = document.querySelector('.events-panel')
      if (eventsPanel) {
        const elementPosition = element.offsetTop
        const offsetPosition = elementPosition - 220 // Account for fixed header and comfortable viewing

        eventsPanel.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    }
  }

  return {
    todayRef,
    jumpToToday,
  }
}
