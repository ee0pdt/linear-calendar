import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { CalendarFooter } from '../components/CalendarFooter'
import { CalendarGrid } from '../components/CalendarGrid'
import { ImportControls } from '../components/ImportControls'
import { useEvents } from '../hooks/useEvents'

import { useScrollToToday } from '../hooks/useScrollToToday'
import { generateYearDays } from '../utils/dateUtils'
import { DayRing, MonthRing, WeekRing, YearRing } from '../components/TimeRings'
import {
  getStoredThemePreference,
  setStoredThemePreference,
} from '../utils/storageUtils'
import type { ThemePreference } from '../utils/storageUtils'
import { ThemeToggle } from '../components/CalendarFooter'
import { Settings2, X } from 'lucide-react'
import { TimezoneSelect } from '../components/TimezoneSelect'

export const Route = createFileRoute('/')({
  component: LinearCalendar,
})

export function LinearCalendar() {
  const currentYear = new Date().getFullYear()
  const [showSettings, setShowSettings] = useState(false)

  // Custom hooks for state management
  const { events, setEvents, lastImportInfo, setLastImportInfo } = useEvents()
  const { todayRef, jumpToToday } = useScrollToToday()

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

  const yearDays = generateYearDays(currentYear)

  return (
    <>
      {/* Unified layout: Mobile-first with responsive styling */}
      <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
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
                  {currentYear} Calendar
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {/* Jump to Today button (text) */}
                <button
                  onClick={() => jumpToToday()}
                  className="px-3 py-2 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors font-semibold"
                  aria-label="Jump to today"
                  title="Jump to Today"
                >
                  Today
                </button>
                {/* Settings panel toggle (cog icon) */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Open settings"
                  title="Settings"
                >
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-60">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md relative text-gray-900 dark:text-gray-100">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-2 right-2 p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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

        {/* Panel 2: Scrollable calendar content */}
        <div className={`flex-1 overflow-y-auto events-panel pt-40 sm:pt-32`}>
          <div className="px-2 sm:px-6 sm:max-w-4xl sm:mx-auto">
            <CalendarGrid
              currentYear={currentYear}
              events={events}
              todayRef={todayRef}
            />

            <CalendarFooter
              currentYear={currentYear}
              totalDays={yearDays.length}
              onJumpToToday={() => jumpToToday()}
            >
              {/* No ThemeToggle here, now in settings panel */}
            </CalendarFooter>
          </div>
        </div>
      </div>
    </>
  )
}
