import { useEffect, useState } from 'react'

/**
 * Hook that triggers a re-render when the page becomes visible or focused
 * This ensures "today" is recalculated when returning to a PWA after time has passed
 * 
 * In test mode (?testDate=YYYY-MM-DD), when the page regains focus, it will:
 * 1. Clear the test date from the URL 
 * 2. Force a refresh to show the real current date
 * This simulates the real-world scenario of returning to the app the next day
 */
export function usePageRefresh() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastActiveDate, setLastActiveDate] = useState(() => new Date().toDateString())

  useEffect(() => {
    const checkDateChange = () => {
      const currentDateString = new Date().toDateString()
      if (currentDateString !== lastActiveDate) {
        console.log('[usePageRefresh] Date changed from', lastActiveDate, 'to', currentDateString)
        setLastActiveDate(currentDateString)
        setRefreshKey(prev => prev + 1)
      }
    }

    const clearTestModeAndRefresh = () => {
      const params = new URLSearchParams(window.location.search)
      if (params.has('testDate')) {
        console.log('[usePageRefresh] Clearing test date and returning to real date')
        params.delete('testDate')
        const newUrl = params.toString() 
          ? `${window.location.pathname}?${params.toString()}` 
          : window.location.pathname
        window.history.replaceState({}, '', newUrl)
        setRefreshKey(prev => prev + 1)
        setLastActiveDate(new Date().toDateString())
      } else {
        checkDateChange()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[usePageRefresh] Page became visible')
        clearTestModeAndRefresh()
      }
    }

    const handleFocus = () => {
      console.log('[usePageRefresh] Window focused')
      clearTestModeAndRefresh()
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      // Handle page being shown from bfcache (back-forward cache)
      if (event.persisted) {
        console.log('[usePageRefresh] Page restored from cache')
        clearTestModeAndRefresh()
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handlePageShow as EventListener)

    // Check periodically (every minute) while the page is visible
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkDateChange()
      }
    }, 60000) // Check every minute

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handlePageShow as EventListener)
      clearInterval(intervalId)
    }
  }, [lastActiveDate])

  return refreshKey
}