import { generateDateRangeDays } from '../utils/dateUtils'
import { CalendarMonth } from './CalendarMonth'
import type { CalendarEvent } from '../types'

interface CalendarGridProps {
  dateRange: { startYear: number; endYear: number }
  events: Array<CalendarEvent>
  todayRef?: React.RefObject<HTMLDivElement | null>
}

export function CalendarGrid({
  dateRange,
  events,
  todayRef,
}: CalendarGridProps) {
  const allDays = generateDateRangeDays(dateRange.startYear, dateRange.endYear)

  // Group days by year and month for proper organization
  const monthGroups = allDays.reduce<Record<string, Array<Date>>>(
    (acc, date) => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const key = `${year}-${month}`

      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(date)
      return acc
    },
    {},
  )

  return (
    <div className="day-list">
      {Object.entries(monthGroups).map(([monthKey, daysInMonth]) => (
        <CalendarMonth
          key={monthKey}
          daysInMonth={daysInMonth}
          events={events}
          todayRef={todayRef}
        />
      ))}
    </div>
  )
}
