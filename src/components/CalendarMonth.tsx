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
    <div className="mb-0">
      <div
        className="sticky top-[-8px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-2 mb-0 z-50 px-4"
        data-month={`${monthData.year}-${monthData.month}`}
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {monthData.monthName} {monthData.year}
        </h2>
      </div>
      <div className="space-y-0">
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
