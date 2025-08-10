import { useState, useEffect } from 'react'
import { Settings2 } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { ImportControls } from './ImportControls'
import { ThemeToggle } from './CalendarFooter'
import { TimezoneSelect } from './TimezoneSelect'
import type { ThemePreference } from '../types'

export function SettingsPanel() {
  const { events, setEvents, lastImportInfo, setLastImportInfo } = useEvents()
  const [theme, setTheme] = useState<ThemePreference>('system')
  
  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemePreference
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])
  
  // Apply theme changes
  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Apply theme to document
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // Get current date range from somewhere - for now use defaults
  const currentYear = new Date().getFullYear()
  const dateRange = {
    startYear: currentYear - 1,
    endYear: currentYear + 1,
  }

  return (
    <>
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
            Appearance
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
            <TimezoneSelect
              onTimezoneChange={(tz) => {
                console.log('Timezone changed to:', tz)
              }}
            />
          </div>
        </section>
        
        {/* Auto-refresh Section */}
        <section>
          <h3 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Auto-refresh
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Auto-refresh settings are available in the main calendar view
            </p>
          </div>
        </section>
        
        {/* Clear Data Section */}
        <section>
          <h3 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Data Management
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all calendar data?')) {
                  setEvents([], '')
                  setLastImportInfo(null)
                  localStorage.removeItem('calendarEvents')
                  localStorage.removeItem('importSource')
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </section>
      </div>
    </>
  )
}