import { memo, useMemo } from 'react'
import { isToday } from '../utils/dateUtils'
import { CalendarDay } from './CalendarDay'
import type { CalendarEvent } from '../types'

interface CalendarMonthProps {
  daysInMonth: Array<Date>
  events: Array<CalendarEvent>
  todayRef?: React.RefObject<HTMLDivElement | null>
  onEventClick?: (event: CalendarEvent) => void
}

export const CalendarMonth = memo(function CalendarMonth({
  daysInMonth,
  events,
  todayRef,
  onEventClick,
}: CalendarMonthProps) {
  const firstDay = daysInMonth[0]

  // Memoize month metadata to prevent recalculation
  const monthData = useMemo(() => {
    const monthName = firstDay.toLocaleString('default', { month: 'long' })
    const year = firstDay.getFullYear()
    const month = firstDay.getMonth() + 1
    return { monthName, year, month }
  }, [firstDay])

  // Pass all events to CalendarDay to maintain existing filtering logic

  return (
    <div className="month-group">
      <div
        className="sticky top-3 sm:top-16 bg-white dark:bg-gray-900 border-b-2 border-gray-300 dark:border-gray-700 py-2 mb-4 z-40 px-4 sm:px-6"
        data-month={`${monthData.year}-${monthData.month}`}
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {monthData.monthName} {monthData.year}
        </h2>
      </div>
      <div className="days-grid">
        {daysInMonth.map((date) => (
          <CalendarDay
            key={date.toISOString()}
            date={date}
            events={events}
            isToday={isToday(date)}
            todayRef={isToday(date) ? todayRef : undefined}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
})
