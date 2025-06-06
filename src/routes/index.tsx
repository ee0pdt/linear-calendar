import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CalendarFooter } from '../components/CalendarFooter'
import { CalendarGrid } from '../components/CalendarGrid'
import { ImportControls } from '../components/ImportControls'
import { useEvents } from '../hooks/useEvents'

import { useScrollToToday } from '../hooks/useScrollToToday'
import { generateYearDays } from '../utils/dateUtils'
import { DayRing, MonthRing, WeekRing, YearRing } from '../components/TimeRings'

export const Route = createFileRoute('/')({
  component: LinearCalendar,
})

export function LinearCalendar() {
  const currentYear = new Date().getFullYear()
  const [showImportControls, setShowImportControls] = useState(false)

  // Custom hooks for state management
  const { events, setEvents, lastImportInfo, setLastImportInfo } = useEvents()
  const { todayRef, jumpToToday } = useScrollToToday()

  const yearDays = generateYearDays(currentYear)

  return (
    <>
      {/* Desktop: Mirror mobile layout */}
      <div className="hidden sm:block h-screen flex flex-col">
        {/* Panel 1: Fixed header with rings and controls */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          {/* Time rings */}
          <div className="flex justify-center gap-6 p-4 border-b border-gray-100">
            <DayRing size={56} />
            <WeekRing size={56} />
            <MonthRing size={56} />
            <YearRing size={56} />
          </div>

          {/* Calendar header and import toggle */}
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">
                {currentYear} Calendar
              </h1>
              <div className="flex items-center gap-2">
                {/* Jump to Today button */}
                <button
                  onClick={jumpToToday}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Jump to today"
                  title="Jump to Today"
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                {/* Import controls toggle */}
                <button
                  onClick={() => setShowImportControls(!showImportControls)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Toggle import controls"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible import controls */}
          {showImportControls && (
            <div className="border-t border-gray-100 bg-gray-50">
              <div className="p-4">
                <ImportControls
                  events={events}
                  setEvents={setEvents}
                  lastImportInfo={lastImportInfo}
                  setLastImportInfo={setLastImportInfo}
                />
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Scrollable calendar content */}
        <div
          className={`flex-1 overflow-auto desktop-content-panel pt-32 ${showImportControls ? 'pt-64' : 'pt-32'}`}
        >
          <div className="max-w-4xl mx-auto p-6">
            <CalendarGrid
              currentYear={currentYear}
              events={events}
              todayRef={todayRef}
            />

            <CalendarFooter
              currentYear={currentYear}
              totalDays={yearDays.length}
              onJumpToToday={jumpToToday}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Two-panel fixed layout */}
      <div className="sm:hidden h-screen flex flex-col">
        {/* Panel 1: Fixed header with rings and controls */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          {/* Time rings */}
          <div className="flex justify-center gap-6 p-3 border-b border-gray-100">
            <DayRing size={50} />
            <WeekRing size={50} />
            <MonthRing size={50} />
            <YearRing size={50} />
          </div>

          {/* Calendar header and import toggle */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-gray-900">
                {currentYear} Calendar
              </h1>
              <div className="flex items-center gap-2">
                {/* Jump to Today button for mobile */}
                <button
                  onClick={jumpToToday}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Jump to today"
                  title="Jump to Today"
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                {/* Import controls toggle */}
                <button
                  onClick={() => setShowImportControls(!showImportControls)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Toggle import controls"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Collapsible import controls */}
            {showImportControls && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <ImportControls
                  events={events}
                  setEvents={setEvents}
                  lastImportInfo={lastImportInfo}
                  setLastImportInfo={setLastImportInfo}
                />
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Fixed scrollable events list */}
        <div className="flex-1 pt-40 overflow-y-auto mobile-events-panel">
          <div className="px-2">
            <CalendarGrid
              currentYear={currentYear}
              events={events}
              todayRef={todayRef}
            />

            <CalendarFooter
              currentYear={currentYear}
              totalDays={yearDays.length}
              onJumpToToday={jumpToToday}
            />
          </div>
        </div>
      </div>
    </>
  )
}
