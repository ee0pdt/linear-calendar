import { createFileRoute } from '@tanstack/react-router'
import { CalendarFooter } from '../components/CalendarFooter'
import { CalendarGrid } from '../components/CalendarGrid'
import { CalendarHeader } from '../components/CalendarHeader'
import { ImportControls } from '../components/ImportControls'
import { useEvents } from '../hooks/useEvents'

import { useScrollToToday } from '../hooks/useScrollToToday'
import { generateYearDays } from '../utils/dateUtils'
import { DayRing, MonthRing, WeekRing, YearRing } from '../components/TimeRings'

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
    <div className="max-w-4xl mx-auto p-2 sm:p-4 linear-calendar-container">
      {/* Time Progress Rings - Responsive Layout */}
      <div className="hidden sm:block fixed top-6 right-6 z-50">
        {/* Desktop: Vertical stack */}
        <div className="flex flex-col gap-4 bg-white/85 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-gray-200">
          <DayRing size={56} />
          <WeekRing size={56} />
          <MonthRing size={56} />
          <YearRing size={56} />
        </div>
      </div>

      {/* Mobile: Horizontal layout at top */}
      <div className="sm:hidden mb-4">
        <div className="flex justify-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2 border border-gray-200">
          <DayRing size={40} />
          <WeekRing size={40} />
          <MonthRing size={40} />
          <YearRing size={40} />
        </div>
      </div>
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
