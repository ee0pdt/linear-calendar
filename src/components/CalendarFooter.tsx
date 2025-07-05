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
    <>
      {/* Footer info */}
      <div className="mt-8 text-center text-gray-500 calendar-footer no-print">
        <p>
          Linear Calendar for {currentYear} • {totalDays} days total
        </p>
        <p className="text-sm">
          Print this page (Ctrl+P / Cmd+P) to create your physical calendar
        </p>
        <p className="text-xs mt-2">
          💡 Tip: Use "Print to PDF" to save a digital copy
        </p>
        {children}
      </div>
    </>
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
      <span className="font-semibold text-gray-700">Theme:</span>
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
