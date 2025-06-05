import { createFileRoute } from '@tanstack/react-router'
import { CalendarFooter } from '../components/CalendarFooter'
import { CalendarGrid } from '../components/CalendarGrid'
import { CalendarHeader } from '../components/CalendarHeader'
import { ImportControls } from '../components/ImportControls'
import { useEvents } from '../hooks/useEvents'
import { useScrollToToday } from '../hooks/useScrollToToday'
import { generateYearDays } from '../utils/dateUtils'

export const Route = createFileRoute('/')({
  component: LinearCalendar,
})

export function LinearCalendar() {
  const currentYear = new Date().getFullYear()
  const today = new Date()

  // Custom hooks for state management
  const { events, setEvents, lastImportInfo, setLastImportInfo } = useEvents()
  const { todayRef, jumpToToday } = useScrollToToday()

  const yearDays = generateYearDays(currentYear)

  return (
    <div className="max-w-4xl mx-auto p-4 linear-calendar-container">
      <CalendarHeader
        currentYear={currentYear}
        today={today}
        events={events}
        onJumpToToday={jumpToToday}
      />

      <ImportControls
        events={events}
        setEvents={setEvents}
        lastImportInfo={lastImportInfo}
        setLastImportInfo={setLastImportInfo}
      />

      <CalendarGrid
        currentYear={currentYear}
        events={events}
        todayRef={todayRef}
      />

      <CalendarFooter
        currentYear={currentYear}
        totalDays={yearDays.length}
        onJumpToToday={jumpToToday}
      />
    </div>
  )
}
