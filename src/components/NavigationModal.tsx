import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { MONTH_ABBREVIATIONS } from '../constants'

interface NavigationModalProps {
  currentYear: number
  onYearChange: (year: number) => void
  onClose: () => void
  dateRange: { startYear: number; endYear: number }
}

export function NavigationModal({
  currentYear,
  onYearChange,
  onClose,
  dateRange,
}: NavigationModalProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const scrollToMonth = useCallback(
    (monthIndex: number) => {
      const monthElement = document.querySelector(
        `[data-month="${selectedYear}-${monthIndex + 1}"]`,
      )
      if (monthElement) {
        const eventsPanel = document.querySelector('.events-panel')
        if (eventsPanel) {
          const elementPosition =
            monthElement.getBoundingClientRect().top + eventsPanel.scrollTop
          const offsetPosition = elementPosition - 166

          eventsPanel.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }
      }
    },
    [selectedYear],
  )

  const handleMonthClick = useCallback(
    (monthIndex: number) => {
      // Check if the selected year is in the current date range
      const isYearInRange =
        selectedYear >= dateRange.startYear && selectedYear <= dateRange.endYear

      if (!isYearInRange) {
        // If the year is not in range, expand the range to include it
        onYearChange(selectedYear)

        // Wait for the component to re-render, then scroll
        setTimeout(() => {
          scrollToMonth(monthIndex)
        }, 100)
      } else {
        // Year is already in range, just scroll
        scrollToMonth(monthIndex)
      }
      onClose()
    },
    [
      selectedYear,
      dateRange.startYear,
      dateRange.endYear,
      onYearChange,
      onClose,
      scrollToMonth,
    ],
  )

  const handleYearChange = useCallback(
    (year: number) => {
      setSelectedYear(year)
      onYearChange(year)
    },
    [onYearChange],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black opacity-30 dark:bg-black dark:opacity-50" 
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg text-gray-900 dark:text-gray-100 z-10">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Navigate to Date
        </h2>

        {/* Year selector */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => handleYearChange(selectedYear - 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Previous year"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-2xl font-bold min-w-[100px] text-center">
              {selectedYear}
            </span>

            <button
              onClick={() => handleYearChange(selectedYear + 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Next year"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleYearChange(new Date().getFullYear())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Current Year
            </button>
          </div>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-3">
          {MONTH_ABBREVIATIONS.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthClick(index)}
              className="p-4 text-center rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {month}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Click a month to jump to that date
        </div>
      </div>
    </div>
  )
}
