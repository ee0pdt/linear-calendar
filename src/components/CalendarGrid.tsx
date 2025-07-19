import { useMemo } from 'react'
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
  // Memoize expensive calculations to prevent re-computation on every render
  const allDays = useMemo(() => 
    generateDateRangeDays(dateRange.startYear, dateRange.endYear),
    [dateRange.startYear, dateRange.endYear]
  )

  // Memoize month grouping to prevent re-calculation
  const monthGroups = useMemo(() => 
    allDays.reduce<Record<string, Array<Date>>>(
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
    ),
    [allDays]
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
