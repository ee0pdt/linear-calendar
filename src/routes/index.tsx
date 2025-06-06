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
    <div className="max-w-4xl mx-auto p-4 linear-calendar-container">
      {/* Time Progress Rings */}
      {/* HUD-style floating time rings */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
          padding: 12,
          alignItems: 'center',
          border: '1px solid #e0e0e0',
        }}
      >
        <DayRing size={64} />
        <WeekRing size={64} />
        <MonthRing size={64} />
        <YearRing size={64} />
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
