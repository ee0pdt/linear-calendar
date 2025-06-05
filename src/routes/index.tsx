import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ImportControls } from '../components/ImportControls'
import { CalendarHeader } from '../components/CalendarHeader'
import { CalendarGrid } from '../components/CalendarGrid'
import { CalendarFooter } from '../components/CalendarFooter'
import { generateYearDays } from '../utils/dateUtils'
import {
  loadEventsFromStorage,
  loadImportInfoFromStorage,
} from '../utils/storageUtils'
import type { CalendarEvent } from '../types'

export const Route = createFileRoute('/')({
  component: LinearCalendar,
})

export function LinearCalendar() {
  const currentYear = new Date().getFullYear()
  const today = new Date()
  const [events, setEvents] = useState<Array<CalendarEvent>>([])
  const [lastImportInfo, setLastImportInfo] = useState<{
    fileName: string
    importDate: string
  } | null>(null)
  const [isCalDAVLoading, setIsCalDAVLoading] = useState(false)
  const [calDAVCredentials, setCalDAVCredentials] = useState({
    username: '',
    password: '',
  })
  const [showCalDAVForm, setShowCalDAVForm] = useState(false)
  const todayRef = useRef<HTMLDivElement>(null)

  // Jump to today function
  const jumpToToday = () => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  // Load stored data on component mount
  useEffect(() => {
    const storedEvents = loadEventsFromStorage()
    if (storedEvents) {
      setEvents(storedEvents)
    }

    const importInfo = loadImportInfoFromStorage()
    if (importInfo) {
      setLastImportInfo(importInfo)
    }
  }, [])

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
        isCalDAVLoading={isCalDAVLoading}
        setIsCalDAVLoading={setIsCalDAVLoading}
        calDAVCredentials={calDAVCredentials}
        setCalDAVCredentials={setCalDAVCredentials}
        showCalDAVForm={showCalDAVForm}
        setShowCalDAVForm={setShowCalDAVForm}
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
