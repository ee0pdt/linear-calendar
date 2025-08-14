import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { VirtualizedCalendarGrid, type VirtualizedCalendarGridHandle } from './VirtualizedCalendarGrid'
import { DayRing, WeekRing, MonthRing, YearRing } from './TimeRings'
import { PerformanceDashboard } from './PerformanceDashboard'
import { LoadingIndicator } from './LoadingIndicator'
import { AutoRefreshIndicator } from './AutoRefreshIndicator'
import { SettingsPanel } from './SettingsPanel'
import { NavigationModal } from './NavigationModal'
import { EventSearch } from './EventSearch'
import { EventDetailsModal } from './EventDetailsModal'
import { useEvents } from '../hooks/useEvents'
import { useCalDAVImport } from '../hooks/useCalDAVImport'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { useScrollToToday } from '../hooks/useScrollToToday'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { loadEventsFromStorage } from '../utils/storageUtils'
import type { CalendarEvent } from '../types'

const isTestMode = () => false // Simplified for now

export function LinearCalendarView() {
  const currentYear = new Date().getFullYear()
  const [dateRange, setDateRange] = useState(() => {
    const startYear = currentYear - 1
    const endYear = currentYear + 1
    return { startYear, endYear }
  })
  const [showPerformanceDashboard, setShowPerformanceDashboard] =
    useState(false)
  
  // Always render UI immediately - never block on localStorage
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)

  // Modal states
  const [showSettings, setShowSettings] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)

  // Main data hooks
  const { events, addEvents, clearEvents } = useEvents()
  const { importFromCalDAV, isLoading: isCalDAVLoading } = useCalDAVImport(
    (newEvents) => {
      clearEvents()
      addEvents(newEvents)
    },
    dateRange.startYear,
    dateRange.endYear,
  )

  // When events load or after short delay, turn off loading
  useEffect(() => {
    if (events.length > 0) {
      // Events loaded from localStorage, hide loading immediately
      setIsLoadingEvents(false)
    } else {
      // No events yet, show loading for max 200ms then show empty calendar so user can see today
      const timer = setTimeout(() => {
        setIsLoadingEvents(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [events.length])

  // Scroll and navigation hooks
  const calendarRef = React.useRef<HTMLDivElement>(null)
  const virtualizedGridRef = React.useRef<VirtualizedCalendarGridHandle>(null)
  const { todayRef } = useScrollToToday({
    dateRange,
    setDateRange,
  })
  
  // Override jumpToToday to use virtualized grid
  const jumpToToday = useCallback(() => {
    virtualizedGridRef.current?.scrollToToday()
  }, [])
  useInfiniteScroll({
    onScrollNearTop: () => {
      setDateRange(prev => ({
        ...prev,
        startYear: prev.startYear - 1
      }))
    },
    onScrollNearBottom: () => {
      setDateRange(prev => ({
        ...prev,
        endYear: prev.endYear + 1
      }))
    }
  })

  // Auto-refresh functionality
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(10)
  const { lastRefreshTime } = useAutoRefresh(
    autoRefreshEnabled,
    autoRefreshInterval,
    async () => {
      // Auto-refresh logic would go here
      console.log('Auto-refresh triggered')
    },
  )

  // Track initial mount timing
  useEffect(() => {
    console.log('Component mounted')
  }, [])

  // Event handlers for modals
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }, [])

  const handleCloseEventDetails = useCallback(() => {
    setShowEventDetails(false)
    setSelectedEvent(null)
  }, [])

  const scrollToEvent = useCallback(
    (event: CalendarEvent) => {
      const eventDate = new Date(event.start)
      const eventYear = eventDate.getFullYear()

      // Expand date range if needed
      if (eventYear < dateRange.startYear || eventYear > dateRange.endYear) {
        setDateRange(prev => ({
          startYear: Math.min(prev.startYear, eventYear),
          endYear: Math.max(prev.endYear, eventYear)
        }))
        // Wait for re-render before scrolling
        setTimeout(() => {
          virtualizedGridRef.current?.scrollToDate(eventDate)
        }, 100)
      } else {
        // Year is already in range, scroll immediately
        virtualizedGridRef.current?.scrollToDate(eventDate)
      }
    },
    [dateRange, setDateRange],
  )

  const memoizedEvents = useMemo(() => events, [events])

  // No need for auto-scroll here - VirtualizedCalendarGrid handles it on mount


  // Remove this blocking return - let the UI render with loading state in calendar area instead

  return (
    <>
      {/* Performance Dashboard (floating overlay) */}
      {showPerformanceDashboard && (
        <PerformanceDashboard
          onClose={() => setShowPerformanceDashboard(false)}
        />
      )}

      {/* Unified layout: Mobile-first with responsive styling */}
      <div
        className={`h-screen flex flex-col bg-white dark:bg-gray-900 transition-filter duration-300 ${showSettings || showNavigation || showSearch || showEventDetails ? 'filter blur-sm brightness-75' : ''} ${isTestMode() ? 'mt-10' : ''}`}
        aria-hidden={
          showSettings || showNavigation || showSearch || showEventDetails
            ? 'true'
            : undefined
        }
      >
        {/* Panel 1a: Fixed rings header */}
        <div className="fixed top-0 left-0 right-0 z-60 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
          {/* Time rings - centered and larger */}
          <div className="flex justify-center gap-6 p-3 pb-4">
            <DayRing size={56} />
            <WeekRing size={56} />
            <MonthRing size={56} />
            <YearRing size={56} />
          </div>
        </div>

        {/* Panel 1b: Fixed nav controls header */}
        <div className="fixed top-28 left-0 right-0 z-60">
          <div className="px-6 py-3">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                {/* Auto-refresh indicator */}
                <AutoRefreshIndicator
                  isRefreshing={isCalDAVLoading}
                  refreshStatus={isCalDAVLoading ? 'refreshing' : lastRefreshTime ? 'success' : 'idle'}
                  lastRefreshTime={lastRefreshTime}
                  error={null}
                />

                {/* Today button */}
                <button
                  onClick={() => jumpToToday()}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  aria-label="Jump to Today"
                  title="Jump to Today"
                >
                  Today
                </button>

                {/* Performance Dashboard button */}
                {/* <button
                  onClick={() =>
                    setShowPerformanceDashboard(!showPerformanceDashboard)
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    showPerformanceDashboard
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } cursor-pointer`}
                  aria-label="Toggle performance dashboard"
                  title="Performance Dashboard"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </button> */}

                {/* Search button */}
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  aria-label="Search events"
                  title="Search events"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>

                {/* Navigation button */}
                <button
                  onClick={() => setShowNavigation(true)}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  aria-label="Open navigation"
                  title="Navigation"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                {/* Settings button */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  aria-label="Open settings"
                  title="Settings"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Calendar grid - Scrollable container */}
        <div
          ref={calendarRef}
          className="flex-1 overflow-y-auto events-panel pt-32"
        >
          <div className="px-2 sm:px-6 sm:max-w-4xl sm:mx-auto">
            {isLoadingEvents ? (
              <div className="flex items-center justify-center py-20">
                <LoadingIndicator
                  isLoading={true}
                  loadingText="Loading calendar..."
                  showSpinner={true}
                />
              </div>
            ) : (
              <VirtualizedCalendarGrid
                ref={virtualizedGridRef}
                events={memoizedEvents}
                dateRange={dateRange}
                todayRef={todayRef}
                onEventClick={handleEventClick}
                scrollContainerRef={calendarRef}
              />
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-30 dark:bg-black dark:opacity-50"
            onClick={() => setShowSettings(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-100 z-10">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-2 right-2 p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <SettingsPanel />
          </div>
        </div>
      )}

      {/* Navigation Modal */}
      {showNavigation && (
        <NavigationModal
          currentYear={currentYear}
          dateRange={dateRange}
          onYearChange={(year: number) => {
            // Expand date range to include the target year if needed
            if (year < dateRange.startYear || year > dateRange.endYear) {
              setDateRange((prev) => ({
                startYear: Math.min(prev.startYear, year),
                endYear: Math.max(prev.endYear, year),
              }))
            }
          }}
          onNavigateToMonth={(year: number, monthIndex: number) => {
            // Expand date range if needed
            if (year < dateRange.startYear || year > dateRange.endYear) {
              setDateRange((prev) => ({
                startYear: Math.min(prev.startYear, year),
                endYear: Math.max(prev.endYear, year),
              }))
              // Wait for re-render
              setTimeout(() => {
                const targetDate = new Date(year, monthIndex, 1)
                virtualizedGridRef.current?.scrollToDate(targetDate)
              }, 100)
            } else {
              // Year is in range, scroll immediately
              const targetDate = new Date(year, monthIndex, 1)
              virtualizedGridRef.current?.scrollToDate(targetDate)
            }
          }}
          onClose={() => setShowNavigation(false)}
        />
      )}

      {/* Event Search Modal */}
      <EventSearch
        events={memoizedEvents}
        onEventClick={handleEventClick}
        onScrollToEvent={(event) => {
          setShowSearch(false)
          scrollToEvent(event)
        }}
        isVisible={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={handleCloseEventDetails}
      />
    </>
  )
}
