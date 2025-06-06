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
        // Desktop: Find the scrollable content panel and scroll within it
        const contentPanel = document.querySelector('.desktop-content-panel')
        if (contentPanel) {
          // For desktop, we need to calculate the position relative to the scrollable content
          // The element's offsetTop is relative to its offset parent, but we need position relative to the scroll container
          const contentRect = contentPanel.getBoundingClientRect()
          const elementRect = element.getBoundingClientRect()

          // Calculate current scroll position plus the relative position of the element
          const currentScrollTop = contentPanel.scrollTop
          const elementRelativeTop =
            elementRect.top - contentRect.top + currentScrollTop

          // Offset to position the element nicely in view (account for some comfortable viewing space)
          const offsetPosition = elementRelativeTop - 100

          contentPanel.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }
      }
    }
  }

  return {
    todayRef,
    jumpToToday,
  }
}
