interface CalendarFooterProps {
  currentYear: number
  totalDays: number
  onJumpToToday: () => void
}

export function CalendarFooter({
  currentYear,
  totalDays,
  onJumpToToday,
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
      </div>

      {/* Floating Jump to Today Button - Desktop only */}
      <button
        onClick={onJumpToToday}
        className="hidden sm:block fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors no-print z-50"
        title="Jump to Today"
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
          />
        </svg>
      </button>
    </>
  )
}
