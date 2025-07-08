import { generateYearDays } from '../utils/dateUtils'
import { CalendarMonth } from './CalendarMonth'
import type { CalendarEvent } from '../types'

interface CalendarGridProps {
  currentYear: number
  events: Array<CalendarEvent>
  todayRef?: React.RefObject<HTMLDivElement | null>
  onUpdateEvent: (originalEvent: CalendarEvent, updatedEvent: CalendarEvent) => Promise<void>
  onDeleteEvent: (eventToDelete: CalendarEvent) => Promise<void>
}

export function CalendarGrid({
  currentYear,
  events,
  todayRef,
  onUpdateEvent,
  onDeleteEvent,
}: CalendarGridProps) {
  const yearDays = generateYearDays(currentYear)

  // Group days by month
  const monthGroups = yearDays.reduce<Record<number, Array<Date>>>(
    (acc, date) => {
      const month = date.getMonth() + 1
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(date)
      return acc
    },
    {},
  )

  return (
    <div className="day-list">
      {Object.entries(monthGroups).map(([_, daysInMonth]) => (
        <CalendarMonth
          key={daysInMonth[0].getMonth()}
          daysInMonth={daysInMonth}
          events={events}
          todayRef={todayRef}
          onUpdateEvent={onUpdateEvent}
          onDeleteEvent={onDeleteEvent}
        />
      ))}
    </div>
  )
}
