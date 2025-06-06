import { useRef } from 'react'

export function useScrollToToday() {
  const todayRef = useRef<HTMLDivElement>(null)

  const jumpToToday = () => {
    if (todayRef.current) {
      const element = todayRef.current

      // Check if we're on mobile (screen width < 640px)
      const isMobile = window.innerWidth < 640

      if (isMobile) {
        // Mobile: Find the scrollable events panel and scroll within it
        const eventsPanel = document.querySelector('.mobile-events-panel')
        if (eventsPanel) {
          const elementPosition = element.offsetTop
          const offsetPosition = elementPosition - 220 // Account for fixed header and comfortable viewing

          eventsPanel.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }
      } else {
        // Desktop: Use window scroll as before
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 64

        window.scrollTo({
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
