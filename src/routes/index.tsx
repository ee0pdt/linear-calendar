import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { Calendar, Search, Settings2, X } from 'lucide-react'
import { AutoRefreshIndicator } from '../components/AutoRefreshIndicator'
import { CalendarFooter, ThemeToggle } from '../components/CalendarFooter'
import { CalendarGrid } from '../components/CalendarGrid'
import { ImportControls } from '../components/ImportControls'
import { DayRing, MonthRing, WeekRing, YearRing } from '../components/TimeRings'
import { TimezoneSelect } from '../components/TimezoneSelect'
import { NavigationModal } from '../components/NavigationModal'
import { PerformanceDashboard } from '../components/PerformanceDashboard'
import { CalendarLoadingIndicator } from '../components/LoadingIndicator'
import { EventDetailsModal } from '../components/EventDetailsModal'
import { EventSearch } from '../components/EventSearch'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { useEvents } from '../hooks/useEvents'
import { useScrollToToday } from '../hooks/useScrollToToday'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import {
  useModalPerformance,
  usePageLoadTracking,
  usePerformanceTracking,
} from '../hooks/usePerformanceTracking'
import { getTotalDaysInRange } from '../utils/dateUtils'
import {
  getStoredThemePreference,
  setStoredThemePreference,
} from '../utils/storageUtils'
import type { ThemePreference } from '../utils/storageUtils'
import type { CalendarEvent } from '../types'

export const Route = createFileRoute('/')({
  component: LinearCalendar,
})

export function LinearCalendar() {
  const currentYear = new Date().getFullYear()
  const [dateRange, setDateRange] = useState(() => {
    // Start with current year ± 1 year for initial load
    const startYear = currentYear - 1
    const endYear = currentYear + 1
    return { startYear, endYear }
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showPerformanceDashboard, setShowPerformanceDashboard] =
    useState(false)
  const [loadingStage, setLoadingStage] = useState(1)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)

  // Performance tracking hooks
  const performanceTracking = usePerformanceTracking()
  const settingsModalPerf = useModalPerformance('Settings')
  const navigationModalPerf = useModalPerformance('Navigation')
  usePageLoadTracking() // Track page load metrics in console

  // Custom hooks for state management
  const { events, setEvents, lastImportInfo, setLastImportInfo } = useEvents()
  const { todayRef, jumpToToday } = useScrollToToday({
    dateRange,
    setDateRange,
  })

  // Auto-refresh hook
  const autoRefresh = useAutoRefresh(
    setEvents,
    dateRange.startYear,
    dateRange.endYear,
  )

  // Infinite scroll hook
  const handleScrollNearTop = useCallback(() => {
    setDateRange((prev) => ({
      startYear: prev.startYear - 1,
      endYear: prev.endYear,
    }))
  }, [])

  const handleScrollNearBottom = useCallback(() => {
    setDateRange((prev) => ({
      startYear: prev.startYear,
      endYear: prev.endYear + 1,
    }))
  }, [])

  useInfiniteScroll({
    onScrollNearTop: handleScrollNearTop,
    onScrollNearBottom: handleScrollNearBottom,
    threshold: 1000,
  })

  // THEME STATE
  const [theme, setTheme] = useState<ThemePreference>(() =>
    getStoredThemePreference(),
  )

  useEffect(() => {
    // Apply theme class to <body> and <html>
    const body = document.body
    const html = document.documentElement
    body.classList.remove('theme-light', 'theme-dark')
    html.classList.remove('dark')
    if (theme === 'light') body.classList.add('theme-light')
    else if (theme === 'dark') {
      body.classList.add('theme-dark')
      html.classList.add('dark')
    }
    // Update theme-color meta
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      if (theme === 'dark') meta.setAttribute('content', '#181c20')
      else if (theme === 'light') meta.setAttribute('content', '#4f8cff')
      else {
        // system: match media
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
        meta.setAttribute('content', dark ? '#181c20' : '#4f8cff')
        html.classList.toggle('dark', dark)
        body.classList.toggle('theme-dark', dark)
        body.classList.toggle('theme-light', !dark)
      }
    }
    // Listen for system changes if "system" is selected
    let mql: MediaQueryList | null = null
    const handleSystem = () => {
      if (theme === 'system' && meta) {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
        meta.setAttribute('content', dark ? '#181c20' : '#4f8cff')
        html.classList.toggle('dark', dark)
        body.classList.toggle('theme-dark', dark)
        body.classList.toggle('theme-light', !dark)
      }
    }
    if (theme === 'system') {
      mql = window.matchMedia('(prefers-color-scheme: dark)')
      mql.addEventListener('change', handleSystem)
      handleSystem()
    }
    return () => {
      if (mql) mql.removeEventListener('change', handleSystem)
    }
  }, [theme])

  const handleThemeChange = (pref: ThemePreference) => {
    setStoredThemePreference(pref)
    setTheme(pref)
  }

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }, [])

  const handleCloseEventDetails = useCallback(() => {
    setShowEventDetails(false)
    setSelectedEvent(null)
  }, [])

  const scrollToMonth = useCallback((year: number, month: number) => {
    const monthElement = document.querySelector(`[data-month="${year}-${month}"]`)
    if (monthElement) {
      const eventsPanel = document.querySelector('.events-panel')
      if (eventsPanel) {
        const elementPosition =
          monthElement.getBoundingClientRect().top + eventsPanel.scrollTop
        const offsetPosition = elementPosition - 216

        eventsPanel.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    }
  }, [])

  const scrollToDay = useCallback((date: Date) => {
    // Format date as YYYY-MM-DD to match data-date attribute
    const dateStr = date.toISOString().split('T')[0]
    const dayElement = document.querySelector(`[data-date="${dateStr}"]`)
    
    if (dayElement) {
      const eventsPanel = document.querySelector('.events-panel')
      if (eventsPanel) {
        const elementPosition =
          dayElement.getBoundingClientRect().top + eventsPanel.scrollTop
        const offsetPosition = elementPosition - 228 // Slightly higher offset to center the day better

        eventsPanel.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    } else {
      // Fallback to month if specific day not found (might not be loaded yet)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      scrollToMonth(year, month)
    }
  }, [scrollToMonth])

  const scrollToEvent = useCallback((event: CalendarEvent) => {
    const eventDate = event.start
    const year = eventDate.getFullYear()

    // Check if the event's year is in the current date range
    const isYearInRange = year >= dateRange.startYear && year <= dateRange.endYear

    if (!isYearInRange) {
      // Expand the date range to include the event's year
      setDateRange({
        startYear: Math.min(dateRange.startYear, year),
        endYear: Math.max(dateRange.endYear, year),
      })

      // Wait for the component to re-render, then scroll to specific day
      setTimeout(() => {
        scrollToDay(eventDate)
      }, 100)
    } else {
      // Year is already in range, just scroll to specific day
      scrollToDay(eventDate)
    }
  }, [dateRange, scrollToDay])

  // Track modal open completion
  useEffect(() => {
    if (showSettings) {
      // Track when settings modal is fully rendered
      const timer = setTimeout(() => {
        settingsModalPerf.trackOpenComplete()
      }, 100) // Small delay to ensure DOM is updated
      return () => clearTimeout(timer)
    }
  }, [showSettings, settingsModalPerf])

  useEffect(() => {
    if (showNavigation) {
      // Track when navigation modal is fully rendered
      const timer = setTimeout(() => {
        navigationModalPerf.trackOpenComplete()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showNavigation, navigationModalPerf])

  // Optimized progressive loading
  useEffect(() => {
    performanceTracking.startLoading('Initial Calendar Load')

    const loadingSequence = async () => {
      // Stage 1: Initializing (already set)
      await new Promise((resolve) => setTimeout(resolve, 100))

      setLoadingStage(2) // Loading time rings
      await new Promise((resolve) => setTimeout(resolve, 50))

      setLoadingStage(3) // Preparing calendar grid
      await new Promise((resolve) => setTimeout(resolve, 100))

      setLoadingStage(4) // Loading events
      await new Promise((resolve) => setTimeout(resolve, 50))

      setLoadingStage(5) // Rendering calendar
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Complete loading
      setIsInitialLoading(false)
      performanceTracking.stopLoading()

      // Ensure scroll-to-today happens after calendar is fully rendered
      setTimeout(() => {
        jumpToToday()
      }, 200)
    }

    loadingSequence()
  }, [jumpToToday]) // Include memoized jumpToToday

  const totalDays = getTotalDaysInRange(dateRange.startYear, dateRange.endYear)

  // Show loading screen during initial load
  if (isInitialLoading) {
    return <CalendarLoadingIndicator stage={loadingStage} totalStages={5} />
  }

  return (
    <>
      {/* Unified layout: Mobile-first with responsive styling */}
      <div
        className={`h-screen flex flex-col bg-white dark:bg-gray-900 transition-filter duration-300 ${showSettings ? 'filter blur-sm brightness-75' : ''}`}
        aria-hidden={showSettings ? 'true' : undefined}
      >
        {/* Panel 1: Fixed header with rings and controls */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Time rings */}
          <div className="flex justify-center gap-6 p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700">
            <DayRing size={56} />
            <WeekRing size={56} />
            <MonthRing size={56} />
            <YearRing size={56} />
          </div>

          {/* Calendar header and settings toggle */}
          <div className="px-4 py-2 sm:px-6 sm:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {dateRange.startYear === dateRange.endYear
                    ? `${dateRange.startYear} Calendar`
                    : `${dateRange.startYear}-${dateRange.endYear} Calendar`}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {/* Auto-refresh indicator */}
                <AutoRefreshIndicator
                  isRefreshing={autoRefresh.isRefreshing}
                  refreshStatus={autoRefresh.refreshStatus}
                  lastRefreshTime={autoRefresh.lastRefreshTime}
                  error={autoRefresh.error}
                />
                {/* Jump to Today button (text) */}
                <button
                  onClick={() => jumpToToday()}
                  className="px-3 py-2 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors font-semibold cursor-pointer"
                  aria-label="Jump to today"
                  title="Jump to Today"
                >
                  Today
                </button>
                {/* Search button */}
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  aria-label="Search events"
                  title="Search events"
                >
                  <Search className="w-5 h-5" />
                </button>
                {/* Navigation button */}
                <button
                  onClick={() => {
                    navigationModalPerf.trackOpen()
                    setShowNavigation(true)
                  }}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  aria-label="Open navigation"
                  title="Navigate to different month/year"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                {/* Settings panel toggle (cog icon) */}
                <button
                  onClick={() => {
                    settingsModalPerf.trackOpen()
                    setShowSettings(true)
                  }}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  aria-label="Open settings"
                  title="Settings"
                >
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Scrollable calendar content */}
        <div className={`flex-1 overflow-y-auto events-panel pt-40 sm:pt-32`}>
          <div className="px-2 sm:px-6 sm:max-w-4xl sm:mx-auto">
            <CalendarGrid
              dateRange={dateRange}
              events={events}
              todayRef={todayRef}
              onEventClick={handleEventClick}
            />

            <CalendarFooter
              currentYear={currentYear}
              totalDays={totalDays}
              onJumpToToday={() => jumpToToday()}
            >
              {/* No ThemeToggle here, now in settings panel */}
            </CalendarFooter>
          </div>
        </div>
      </div>
      {/* Settings Panel Modal (always rendered as sibling, never inside calendar) */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-30 dark:bg-black dark:opacity-50" />
          {/* Modal content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-100 z-10">
            <button
              onClick={() => {
                settingsModalPerf.trackClose()
                setShowSettings(false)
              }}
              className="absolute top-2 right-2 p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Settings2 className="w-5 h-5" /> Settings
            </h2>
            <div className="flex flex-col gap-6">
              {/* ImportControls Section */}
              <section>
                <h3 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Import Calendar
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <ImportControls
                    events={events}
                    setEvents={setEvents}
                    lastImportInfo={lastImportInfo}
                    setLastImportInfo={setLastImportInfo}
                    startYear={dateRange.startYear}
                    endYear={dateRange.endYear}
                  />
                </div>
              </section>
              {/* Theme Section */}
              <section>
                <h3 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Theme
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <ThemeToggle value={theme} onChange={handleThemeChange} />
                </div>
              </section>
              {/* Timezone Section */}
              <section>
                <h3 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Timezone
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <TimezoneSelect />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
      {/* Navigation Modal */}
      {showNavigation && (
        <NavigationModal
          currentYear={currentYear}
          dateRange={dateRange}
          onYearChange={(year) => {
            // Expand range to include the selected year
            setDateRange({
              startYear: Math.min(dateRange.startYear, year),
              endYear: Math.max(dateRange.endYear, year),
            })
          }}
          onClose={() => {
            navigationModalPerf.trackClose()
            setShowNavigation(false)
          }}
        />
      )}

      {/* Performance Dashboard */}
      <PerformanceDashboard
        isVisible={showPerformanceDashboard}
        onToggle={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={handleCloseEventDetails}
      />

      {/* Event Search Modal */}
      <EventSearch
        events={events}
        onEventClick={handleEventClick}
        onScrollToEvent={scrollToEvent}
        isVisible={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </>
  )
}
