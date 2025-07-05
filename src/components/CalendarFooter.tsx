import { useState, useEffect } from 'react'
import {
  getStoredThemePreference,
  setStoredThemePreference,
} from '../utils/storageUtils'
import type { ThemePreference } from '../utils/storageUtils'
import type { ReactNode } from 'react'

interface CalendarFooterProps {
  currentYear: number
  totalDays: number
  onJumpToToday: () => void
  children?: ReactNode
}

export function CalendarFooter({
  currentYear,
  totalDays,
  onJumpToToday,
  children,
}: CalendarFooterProps) {
  return (
    <footer className="calendar-footer mt-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-center text-sm select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span className="font-semibold">{currentYear}</span> — {totalDays}{' '}
          days
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onJumpToToday}
            className="px-3 py-2 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors font-semibold"
          >
            Jump to Today
          </button>
          {children}
        </div>
      </div>
    </footer>
  )
}

export function ThemeToggle({
  value,
  onChange,
}: {
  value: ThemePreference
  onChange: (v: ThemePreference) => void
}) {
  return (
    <div className="mt-4 flex justify-center items-center gap-3 text-base">
      <span className="font-semibold text-gray-700 dark:text-gray-200">
        Theme:
      </span>
      <button
        className={`rounded-lg px-4 py-2 font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${value === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        onClick={() => onChange('light')}
        aria-pressed={value === 'light'}
      >
        Light
      </button>
      <button
        className={`rounded-lg px-4 py-2 font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${value === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        onClick={() => onChange('dark')}
        aria-pressed={value === 'dark'}
      >
        Dark
      </button>
      <button
        className={`rounded-lg px-4 py-2 font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${value === 'system' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        onClick={() => onChange('system')}
        aria-pressed={value === 'system'}
      >
        System
      </button>
    </div>
  )
}
