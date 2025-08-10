import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { CalendarGrid } from './CalendarGrid'
import { DayRing, WeekRing, MonthRing, YearRing } from './TimeRings'
import { PerformanceDashboard } from './PerformanceDashboard'
import { LoadingIndicator } from './LoadingIndicator'
import { AutoRefreshIndicator } from './AutoRefreshIndicator'
import { useEvents } from '../hooks/useEvents'
import { useCalDAVImport } from '../hooks/useCalDAVImport'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { useScrollToToday } from '../hooks/useScrollToToday'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { CalendarEvent } from '../types'

const isTestMode = () => false // Simplified for now

export function LinearCalendarView() {
  const currentYear = new Date().getFullYear()
  const [dateRange, setDateRange] = useState(() => {
    const startYear = currentYear - 1
    const endYear = currentYear + 1
    return { startYear, endYear }
  })
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false)
  const [loadingStage, setLoadingStage] = useState(1)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

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

  // Scroll and navigation hooks
  const calendarRef = React.useRef<HTMLDivElement>(null)
  const { todayRef, jumpToToday } = useScrollToToday({
    dateRange,
    setDateRange,
  })
  const { expandDateRange } = useInfiniteScroll(
    calendarRef,
    dateRange,
    setDateRange,
  )

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


  const scrollToEvent = useCallback(
    (event: CalendarEvent) => {
      if (!calendarRef.current) return

      const eventDate = new Date(event.start)
      const eventYear = eventDate.getFullYear()

      // Expand date range if needed
      if (eventYear < dateRange.startYear || eventYear > dateRange.endYear) {
        expandDateRange(eventYear)
        // Wait for re-render before scrolling
        setTimeout(() => {
          const eventId = `day-${eventDate.toISOString().split('T')[0]}`
          const element = document.getElementById(eventId)
          if (element) {
            const container = calendarRef.current
            if (container) {
              const containerRect = container.getBoundingClientRect()
              const elementRect = element.getBoundingClientRect()
              const offset = elementRect.top - containerRect.top + container.scrollTop
              container.scrollTo({
                top: offset - 100,
                behavior: 'smooth',
              })
            }
          }
        }, 100)
      } else {
        // Year is already in range, scroll immediately
        const eventId = `day-${eventDate.toISOString().split('T')[0]}`
        const element = document.getElementById(eventId)
        if (element) {
          const container = calendarRef.current
          const containerRect = container.getBoundingClientRect()
          const elementRect = element.getBoundingClientRect()
          const offset = elementRect.top - containerRect.top + container.scrollTop
          container.scrollTo({
            top: offset - 100,
            behavior: 'smooth',
          })
        }
      }
    },
    [calendarRef, dateRange, expandDateRange],
  )

  const memoizedEvents = useMemo(() => events, [events])

  // Optimized progressive loading
  useEffect(() => {
    if (isInitialLoading) {
      const timers: NodeJS.Timeout[] = []
      const stages = [
        { stage: 2, delay: 300 },
        { stage: 3, delay: 600 },
        { stage: 4, delay: 900 },
        { stage: 5, delay: 1200 },
      ]

      stages.forEach(({ stage, delay }) => {
        const timer = setTimeout(() => {
          setLoadingStage(stage)
          if (stage === 5) {
            setTimeout(() => {
              setIsInitialLoading(false)
              // Ensure scroll-to-today happens after calendar is fully rendered
              setTimeout(() => {
                jumpToToday()
              }, 200)
            }, 300)
          }
        }, delay)
        timers.push(timer)
      })

      return () => timers.forEach(clearTimeout)
    }
  }, [isInitialLoading, jumpToToday])

  if (isInitialLoading) {
    return <LoadingIndicator stage={loadingStage} />
  }

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
        className={`h-screen flex flex-col bg-white dark:bg-gray-900 transition-filter duration-300 ${isTestMode() ? 'mt-10' : ''}`}
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
          <div className="px-4 py-2 sm:px-6 sm:py-3">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
              {/* Auto-refresh indicator */}
              <AutoRefreshIndicator
                enabled={autoRefreshEnabled}
                onToggle={setAutoRefreshEnabled}
                interval={autoRefreshInterval}
                onIntervalChange={setAutoRefreshInterval}
                lastRefreshTime={lastRefreshTime}
                isRefreshing={false}
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
              <button
                onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
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
              </button>
              
              {/* Search button */}
              <Link
                to="/search"
                search={{ from: window.location.pathname }}
                className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Search events"
                title="Search events"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              
              {/* Navigation button */}
              <Link
                to="/navigation"
                search={{ from: window.location.pathname }}
                className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Open navigation"
                title="Navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </Link>
              
              {/* Settings button */}
              <Link
                to="/settings"
                search={{ from: window.location.pathname }}
                className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Open settings"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              </div>
            </div>
          </div>
        </div>


        {/* Panel 2: Calendar grid - Scrollable container */}
        <div 
          ref={calendarRef}
          className="flex-1 overflow-y-auto events-panel pt-28"
        >
          <div className="px-2 sm:px-6 sm:max-w-4xl sm:mx-auto">
            <CalendarGrid
              events={memoizedEvents}
              dateRange={dateRange}
              todayRef={todayRef}
              onEventClick={(event) => {
                // Navigate to event details route with event data
                window.location.href = `/event/${encodeURIComponent(event.id)}?data=${encodeURIComponent(JSON.stringify(event))}`
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}