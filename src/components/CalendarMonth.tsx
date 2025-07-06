import { isToday } from '../utils/dateUtils'
import { CalendarDay } from './CalendarDay'
import type { CalendarEvent } from '../types'

interface CalendarMonthProps {
  daysInMonth: Array<Date>
  events: Array<CalendarEvent>
  todayRef?: React.RefObject<HTMLDivElement | null>
}

export function CalendarMonth({
  daysInMonth,
  events,
  todayRef,
}: CalendarMonthProps) {
  const firstDay = daysInMonth[0]
  const monthName = firstDay.toLocaleString('default', { month: 'long' })

  return (
    <div className="month-group">
      <div className="sticky top-[10px] bg-white dark:bg-gray-900 border-b-2 border-gray-300 dark:border-gray-700 py-2 mb-4 z-10 px-4 sm:px-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {monthName}
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
          />
        ))}
      </div>
    </div>
  )
}
