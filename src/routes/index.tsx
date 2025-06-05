import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LinearCalendar,
})

interface CalendarEvent {
  title: string
  start: Date
  end: Date
  allDay: boolean
  rrule?: string
  isRecurring?: boolean
}

interface RecurrenceRule {
  freq: string
  interval?: number
  until?: Date
  count?: number
  byDay?: string[]
}

function LinearCalendar() {
  const currentYear = new Date().getFullYear()
  const today = new Date()
  const [events, setEvents] = useState<CalendarEvent[]>([])
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

  const STORAGE_KEY = 'linear-calendar-events'
  const IMPORT_INFO_KEY = 'linear-calendar-import-info'
  const CREDENTIALS_KEY = 'linear-calendar-caldav-credentials'

  // Generate all days of the year
  const generateYearDays = (year: number) => {
    const days = []
    const startDate = new Date(year, 0, 1) // January 1st
    const endDate = new Date(year, 11, 31) // December 31st

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      days.push(new Date(d))
    }

    return days
  }

  const yearDays = generateYearDays(currentYear)

  const formatDate = (date: Date) => {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    return {
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      monthName: monthNames[date.getMonth()],
      fullDate: date,
    }
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isPastDay = (date: Date) => {
    const checkDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )
    return checkDate < todayDate
  }

  const isFirstOfMonth = (date: Date) => {
    return date.getDate() === 1
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday = 0, Saturday = 6
  }

  const schoolHolidays = [
    // Christmas holidays (late Dec 2024 into Jan 2025)
    { start: [1, 1], end: [1, 6], name: 'Christmas Holiday' },

    // February half term
    { start: [2, 17], end: [2, 21], name: 'February Half Term' },

    // Easter holidays
    { start: [4, 7], end: [4, 21], name: 'Easter Holiday' },

    // May half term
    { start: [5, 26], end: [5, 30], name: 'May Half Term' },

    // Summer holidays
    { start: [7, 21], end: [9, 1], name: 'Summer Holiday' },

    // October half term
    { start: [10, 27], end: [10, 31], name: 'October Half Term' },

    // Christmas holidays (end of year)
    { start: [12, 22], end: [12, 31], name: 'Christmas Holiday' },
  ]

  const isSchoolHoliday = (date: Date) => {
    const month = date.getMonth() + 1 // 1-12
    const day = date.getDate()

    return schoolHolidays.some((holiday) => {
      const [startMonth, startDay] = holiday.start
      const [endMonth, endDay] = holiday.end

      if (startMonth === endMonth) {
        return month === startMonth && day >= startDay && day <= endDay
      } else {
        return (
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)
        )
      }
    })
  }

  const getSchoolHolidayInfo = (date: Date) => {
    const month = date.getMonth() + 1 // 1-12
    const day = date.getDate()

    for (const holiday of schoolHolidays) {
      const [startMonth, startDay] = holiday.start
      const [endMonth, endDay] = holiday.end

      let isInHoliday = false
      if (startMonth === endMonth) {
        isInHoliday = month === startMonth && day >= startDay && day <= endDay
      } else {
        isInHoliday =
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)
      }

      if (isInHoliday) {
        // Calculate the day number and total days
        const startDate = new Date(currentYear, startMonth - 1, startDay)
        const endDate = new Date(currentYear, endMonth - 1, endDay)
        const currentDate = new Date(currentYear, month - 1, day)

        const dayNumber =
          Math.floor(
            (currentDate.getTime() - startDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1
        const totalDays =
          Math.floor(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          ) + 1

        return {
          name: holiday.name,
          dayNumber,
          totalDays,
        }
      }
    }

    return null
  }

  const getEventEmoji = (title: string): string => {
    const lowerTitle = title.toLowerCase()

    // People - specific names first (most specific matches)
    if (lowerTitle.includes('nadine')) return '👩'

    // Religious & Spiritual
    if (
      lowerTitle.includes('church') ||
      lowerTitle.includes('service') ||
      lowerTitle.includes('mass')
    )
      return '⛪'
    if (lowerTitle.includes('prayer') || lowerTitle.includes('worship'))
      return '🙏'

    // Travel & Vacation
    if (
      lowerTitle.includes('vacation') ||
      lowerTitle.includes('holiday') ||
      lowerTitle.includes('trip')
    )
      return '🏖️'
    if (lowerTitle.includes('flight') || lowerTitle.includes('plane'))
      return '✈️'
    if (lowerTitle.includes('hotel') || lowerTitle.includes('accommodation'))
      return '🏨'

    // Exercise & Sports
    if (lowerTitle.includes('swim') || lowerTitle.includes('pool')) return '🏊'
    if (
      lowerTitle.includes('gym') ||
      lowerTitle.includes('workout') ||
      lowerTitle.includes('fitness')
    )
      return '💪'
    if (lowerTitle.includes('pilates') || lowerTitle.includes('yoga'))
      return '🧘'
    if (lowerTitle.includes('run') || lowerTitle.includes('jog')) return '🏃'
    if (lowerTitle.includes('bike') || lowerTitle.includes('cycle')) return '🚴'
    if (lowerTitle.includes('tennis')) return '🎾'
    if (lowerTitle.includes('football') || lowerTitle.includes('soccer'))
      return '⚽'
    if (lowerTitle.includes('golf')) return '⛳'

    // Medical & Health
    if (
      lowerTitle.includes('doctor') ||
      lowerTitle.includes('appointment') ||
      lowerTitle.includes('medical')
    )
      return '👩‍⚕️'
    if (lowerTitle.includes('dentist') || lowerTitle.includes('dental'))
      return '🦷'
    if (lowerTitle.includes('hospital') || lowerTitle.includes('surgery'))
      return '🏥'
    if (lowerTitle.includes('therapy') || lowerTitle.includes('counseling'))
      return '💭'

    // Food & Social
    if (
      lowerTitle.includes('dinner') ||
      lowerTitle.includes('lunch') ||
      lowerTitle.includes('breakfast')
    )
      return '🍽️'
    if (lowerTitle.includes('party') || lowerTitle.includes('celebration'))
      return '🎉'
    if (lowerTitle.includes('birthday')) return '🎂'
    if (lowerTitle.includes('wedding')) return '💒'
    if (lowerTitle.includes('date') || lowerTitle.includes('romantic'))
      return '💕'

    // Work & Business
    if (lowerTitle.includes('conference') || lowerTitle.includes('summit'))
      return '🏢'
    if (lowerTitle.includes('meeting') || lowerTitle.includes('workshop'))
      return '💼'
    if (lowerTitle.includes('training') || lowerTitle.includes('course'))
      return '📚'
    if (lowerTitle.includes('presentation') || lowerTitle.includes('demo'))
      return '📊'

    // Entertainment & Culture
    if (
      lowerTitle.includes('movie') ||
      lowerTitle.includes('cinema') ||
      lowerTitle.includes('film')
    )
      return '🎬'
    if (lowerTitle.includes('concert') || lowerTitle.includes('music'))
      return '🎵'
    if (lowerTitle.includes('theater') || lowerTitle.includes('show'))
      return '🎭'
    if (lowerTitle.includes('museum') || lowerTitle.includes('gallery'))
      return '🏛️'
    if (lowerTitle.includes('festival')) return '🎪'

    // Family & Personal
    if (
      lowerTitle.includes('family') ||
      lowerTitle.includes('kids') ||
      lowerTitle.includes('children')
    )
      return '👨‍👩‍👧‍👦'
    if (lowerTitle.includes('school') || lowerTitle.includes('education'))
      return '🎓'
    if (lowerTitle.includes('shopping') || lowerTitle.includes('mall'))
      return '🛍️'
    if (lowerTitle.includes('cleaning') || lowerTitle.includes('chores'))
      return '🧹'
    if (lowerTitle.includes('garden') || lowerTitle.includes('plant'))
      return '🌱'

    // Default
    return '📅'
  }

  const parseICSFile = (icsContent: string): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    const lines = icsContent.split('\n')
    let currentEvent: Partial<CalendarEvent> = {}
    let inEvent = false
    let dtStartLine = ''

    for (let line of lines) {
      line = line.trim()

      if (line === 'BEGIN:VEVENT') {
        inEvent = true
        currentEvent = {}
        dtStartLine = ''
      } else if (line === 'END:VEVENT' && inEvent) {
        if (currentEvent.title && currentEvent.start) {
          // Detect all-day events by checking if DTSTART has no time component
          // or if it's midnight-to-midnight with end date being next day
          const isAllDay =
            !dtStartLine.includes('T') ||
            (currentEvent.start.getHours() === 0 &&
              currentEvent.start.getMinutes() === 0 &&
              currentEvent.start.getSeconds() === 0 &&
              currentEvent.end &&
              currentEvent.end.getHours() === 0 &&
              currentEvent.end.getMinutes() === 0)

          currentEvent.allDay = isAllDay

          // Handle recurring events
          if (currentEvent.rrule) {
            const recurringEvents = expandRecurringEvent(
              currentEvent as CalendarEvent,
              currentYear,
            )
            events.push(...recurringEvents)
          } else {
            // Mark as non-recurring event
            currentEvent.isRecurring = false
            events.push(currentEvent as CalendarEvent)
          }
        }
        inEvent = false
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8)
        } else if (line.startsWith('DTSTART')) {
          dtStartLine = line
          const dateStr = line.split(':')[1]
          currentEvent.start = parseICSDate(dateStr)
        } else if (line.startsWith('DTEND')) {
          const dateStr = line.split(':')[1]
          currentEvent.end = parseICSDate(dateStr)
        } else if (line.startsWith('RRULE:')) {
          currentEvent.rrule = line.substring(6)
        }
      }
    }

    // Filter events for current year
    return events.filter((event) => event.start.getFullYear() === currentYear)
  }

  const parseICSDate = (dateStr: string): Date => {
    // Handle both date-only (YYYYMMDD) and datetime (YYYYMMDDTHHMMSS) formats
    if (dateStr.includes('T')) {
      const [datePart, timePart] = dateStr.split('T')
      const year = parseInt(datePart.substring(0, 4))
      const month = parseInt(datePart.substring(4, 6)) - 1
      const day = parseInt(datePart.substring(6, 8))
      const hour = parseInt(timePart.substring(0, 2))
      const minute = parseInt(timePart.substring(2, 4))
      return new Date(year, month, day, hour, minute)
    } else {
      const year = parseInt(dateStr.substring(0, 4))
      const month = parseInt(dateStr.substring(4, 6)) - 1
      const day = parseInt(dateStr.substring(6, 8))
      return new Date(year, month, day)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.ics')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          console.log('ICS file loaded, parsing...', {
            fileSize: content.length,
            fileName: file.name,
          })
          const parsedEvents = parseICSFile(content)
          console.log('Parsed events:', parsedEvents.length, parsedEvents)
          setEvents(parsedEvents)
          saveEventsToStorage(parsedEvents, file.name)
        } catch (error) {
          console.error('Error parsing ICS file:', error)
          alert(
            'Error importing calendar file. Please check the browser console for details.',
          )
        }
      }
      reader.onerror = (error) => {
        console.error('Error reading file:', error)
        alert('Error reading the file. Please try again.')
      }
      reader.readAsText(file)
    } else {
      alert('Please select a valid .ics calendar file.')
    }
  }

  const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(IMPORT_INFO_KEY)
    setEvents([])
    setLastImportInfo(null)
  }

  const handleCalDAVImport = async () => {
    if (!calDAVCredentials.username || !calDAVCredentials.password) {
      alert('Please enter both username and app-specific password')
      return
    }

    setIsCalDAVLoading(true)

    try {
      // Use localhost for development, environment variable for production
      const proxyUrl =
        process.env.NODE_ENV === 'production'
          ? process.env.REACT_APP_CALDAV_PROXY_URL ||
            'https://your-railway-app.railway.app'
          : 'http://localhost:3001'

      const response = await fetch(
        `${proxyUrl}/api/calendar?username=${encodeURIComponent(calDAVCredentials.username)}&password=${encodeURIComponent(calDAVCredentials.password)}`,
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch calendar data')
      }

      if (data.success) {
        console.log('Calendar stats:', data.stats)

        // Convert the events to our format (they should already be in the right format)
        const calDAVEvents = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))

        setEvents(calDAVEvents)

        // Store additional metadata including stats
        const importInfo = `${data.events.length} events from ${data.calendars?.length || 0} calendars`
        saveEventsToStorage(calDAVEvents, `CalDAV: ${importInfo}`)

        // Hide the form after successful import
        setShowCalDAVForm(false)
        setCalDAVCredentials({ username: '', password: '' })

        console.log(
          `Successfully imported ${data.count} events from ${data.calendars?.length || 0} calendars`,
        )
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('CalDAV Import Error:', error)
      alert(`Failed to import calendar: ${error.message}`)
    } finally {
      setIsCalDAVLoading(false)
    }
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventStartDate = new Date(
        event.start.getFullYear(),
        event.start.getMonth(),
        event.start.getDate(),
      )
      const checkDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      )

      if (!event.allDay) {
        // Timed events - only show on exact start date
        return checkDate.getTime() === eventStartDate.getTime()
      }

      if (!event.end) {
        // Single day all-day event
        return checkDate.getTime() === eventStartDate.getTime()
      }

      // Multi-day all-day event - end date in ICS is exclusive (day after last day)
      const eventEndDate = new Date(
        event.end.getFullYear(),
        event.end.getMonth(),
        event.end.getDate(),
      )
      const lastIncludedDay = new Date(
        eventEndDate.getTime() - 24 * 60 * 60 * 1000,
      ) // Subtract one day

      return checkDate >= eventStartDate && checkDate <= lastIncludedDay
    })
  }

  const getEventDisplayForDate = (event: CalendarEvent, date: Date): string => {
    if (!event.allDay) {
      // Timed events show the time
      return event.start.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // All-day events - no time prefix needed
    if (!event.end) {
      // Single day all-day event
      return ''
    }

    // Check if it's actually a multi-day event
    const eventStartDate = new Date(
      event.start.getFullYear(),
      event.start.getMonth(),
      event.start.getDate(),
    )
    const eventEndDate = new Date(
      event.end.getFullYear(),
      event.end.getMonth(),
      event.end.getDate(),
    )
    const lastIncludedDay = new Date(
      eventEndDate.getTime() - 24 * 60 * 60 * 1000,
    ) // Subtract one day
    const checkDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )

    // Single day all-day event (start and end are same day after adjustment)
    if (eventStartDate.getTime() === lastIncludedDay.getTime()) {
      return ''
    }

    // Multi-day all-day event - show progress
    const totalDays =
      Math.ceil(
        (lastIncludedDay.getTime() - eventStartDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1

    if (checkDate.getTime() === eventStartDate.getTime()) {
      return `Day 1/${totalDays}`
    } else if (checkDate.getTime() === lastIncludedDay.getTime()) {
      return `Final day`
    } else {
      const dayNumber =
        Math.ceil(
          (checkDate.getTime() - eventStartDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      return `Day ${dayNumber}/${totalDays}`
    }
  }

  const parseRRule = (rrule: string): RecurrenceRule => {
    const parts = rrule.split(';')
    const rule: RecurrenceRule = { freq: '' }

    for (const part of parts) {
      const [key, value] = part.split('=')
      switch (key) {
        case 'FREQ':
          rule.freq = value
          break
        case 'INTERVAL':
          rule.interval = parseInt(value)
          break
        case 'UNTIL':
          rule.until = parseICSDate(value)
          break
        case 'COUNT':
          rule.count = parseInt(value)
          break
        case 'BYDAY':
          rule.byDay = value.split(',')
          break
      }
    }

    return rule
  }

  const expandRecurringEvent = (
    baseEvent: CalendarEvent,
    year: number,
  ): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    const rule = parseRRule(baseEvent.rrule!)

    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)

    let currentDate = new Date(baseEvent.start)
    let count = 0
    const maxOccurrences = rule.count || 365 // Prevent infinite loops

    while (currentDate <= yearEnd && count < maxOccurrences) {
      // Only include events that fall within the current year
      if (currentDate >= yearStart) {
        const eventDuration = baseEvent.end
          ? baseEvent.end.getTime() - baseEvent.start.getTime()
          : 0

        const newEvent: CalendarEvent = {
          ...baseEvent,
          start: new Date(currentDate),
          end: baseEvent.end
            ? new Date(currentDate.getTime() + eventDuration)
            : (undefined as any),
          rrule: undefined, // Remove rrule from individual instances
          isRecurring: true, // Mark as recurring event instance
        }

        events.push(newEvent)
      }

      // Calculate next occurrence based on frequency
      switch (rule.freq) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + (rule.interval || 1))
          break
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + 7 * (rule.interval || 1))
          break
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + (rule.interval || 1))
          break
        case 'YEARLY':
          currentDate.setFullYear(
            currentDate.getFullYear() + (rule.interval || 1),
          )
          break
        default:
          // Unknown frequency, break to prevent infinite loop
          break
      }

      count++

      // Check if we've reached the UNTIL date
      if (rule.until && currentDate > rule.until) {
        break
      }
    }

    return events
  }

  // Load events and credentials from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY)
    const savedImportInfo = localStorage.getItem(IMPORT_INFO_KEY)
    const savedCredentials = localStorage.getItem(CREDENTIALS_KEY)

    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: event.end ? new Date(event.end) : undefined,
          isRecurring: event.isRecurring ?? false,
        }))
        setEvents(parsedEvents)
      } catch (error) {
        console.error('Error loading saved events:', error)
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(IMPORT_INFO_KEY)
      }
    }

    if (savedImportInfo) {
      try {
        setLastImportInfo(JSON.parse(savedImportInfo))
      } catch (error) {
        console.error('Error loading import info:', error)
        localStorage.removeItem(IMPORT_INFO_KEY)
      }
    }

    if (savedCredentials) {
      try {
        setCalDAVCredentials(JSON.parse(savedCredentials))
      } catch (error) {
        console.error('Error loading CalDAV credentials:', error)
        localStorage.removeItem(CREDENTIALS_KEY)
      }
    }
  }, [])

  // Save events to localStorage whenever events change
  const saveEventsToStorage = (
    eventList: CalendarEvent[],
    fileName: string,
  ) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eventList))
      const importInfo = {
        fileName,
        importDate: new Date().toLocaleString(),
      }
      localStorage.setItem(IMPORT_INFO_KEY, JSON.stringify(importInfo))
      setLastImportInfo(importInfo)
    } catch (error) {
      console.error('Error saving events to localStorage:', error)
      // Handle storage quota exceeded or other errors
      alert('Unable to save calendar data. Your browser storage may be full.')
    }
  }

  const scrollToToday = () => {
    todayRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 linear-calendar-container">
      <h1 className="text-3xl font-bold text-center mb-8 no-print">
        Linear Calendar {currentYear}
      </h1>

      <div className="mb-6 no-print space-y-4">
        {/* Live Calendar Import */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold mb-2 text-green-800">
            🔗 Live Calendar Import
          </h2>
          <p className="text-sm text-green-700 mb-3">
            Connect directly to your Apple Calendar for real-time updates
            (requires app-specific password).
          </p>

          {!showCalDAVForm ? (
            <button
              onClick={() => setShowCalDAVForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Connect to Apple Calendar
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Apple ID Email
                </label>
                <input
                  type="email"
                  value={calDAVCredentials.username}
                  onChange={(e) => {
                    const newCreds = {
                      ...calDAVCredentials,
                      username: e.target.value,
                    }
                    setCalDAVCredentials(newCreds)
                    localStorage.setItem(
                      CREDENTIALS_KEY,
                      JSON.stringify(newCreds),
                    )
                  }}
                  placeholder="your@icloud.com"
                  className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  App-Specific Password
                </label>
                <input
                  type="password"
                  value={calDAVCredentials.password}
                  onChange={(e) => {
                    const newCreds = {
                      ...calDAVCredentials,
                      password: e.target.value,
                    }
                    setCalDAVCredentials(newCreds)
                    localStorage.setItem(
                      CREDENTIALS_KEY,
                      JSON.stringify(newCreds),
                    )
                  }}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-green-600 mt-1">
                  Generate at: appleid.apple.com → Security → App-Specific
                  Passwords
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCalDAVImport}
                  disabled={isCalDAVLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {isCalDAVLoading ? 'Connecting...' : 'Import Calendar'}
                </button>
                <button
                  onClick={() => {
                    setShowCalDAVForm(false)
                    setCalDAVCredentials({ username: '', password: '' })
                    localStorage.removeItem(CREDENTIALS_KEY)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cancel & Forget Credentials
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Import */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">
            📁 File Import
          </h2>
          <p className="text-sm text-blue-700 mb-3">
            Export your calendar as an ICS file and upload it here (one-time
            import).
          </p>
          <input
            type="file"
            accept=".ics"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Import Status */}
        {events.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="space-y-1">
              <p className="text-sm text-green-600">
                ✅ Loaded {events.length} events from your calendar
              </p>
              {lastImportInfo && (
                <p className="text-xs text-gray-500">
                  Last imported: {lastImportInfo.fileName} on{' '}
                  {lastImportInfo.importDate}
                </p>
              )}
              <button
                onClick={clearStoredData}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Clear stored calendar data
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="day-list">
        {(() => {
          // Group days by month for proper sticky header structure
          const monthGroups: { [key: number]: Date[] } = {}

          yearDays.forEach((date) => {
            const month = date.getMonth() + 1
            if (!monthGroups[month]) {
              monthGroups[month] = []
            }
            monthGroups[month].push(date)
          })

          return Object.entries(monthGroups).map(([monthNum, daysInMonth]) => {
            const monthNumber = parseInt(monthNum)
            const firstDay = daysInMonth[0]
            const { monthName } = formatDate(firstDay)

            return (
              <div key={monthNumber} className="month-container">
                <div
                  className="bg-blue-100 text-blue-800 font-bold text-lg p-2 mt-4 first:mt-0 month-header sticky top-0 z-10 border-b border-blue-200"
                  data-month={monthNumber}
                >
                  {monthName} {currentYear}
                </div>

                <div className="space-y-1">
                  {daysInMonth.map((date, dayIndex) => {
                    const {
                      dayName,
                      dayNumber,
                      monthName: dayMonthName,
                    } = formatDate(date)
                    const globalIndex = yearDays.findIndex(
                      (d) => d.getTime() === date.getTime(),
                    )
                    const isTodayDate = isToday(date)
                    const isWeekendDay = isWeekend(date)
                    const isHoliday = isSchoolHoliday(date)
                    const holidayInfo = getSchoolHolidayInfo(date)
                    const isPast = isPastDay(date)
                    const dayEvents = getEventsForDate(date)

                    return (
                      <div
                        key={dayIndex}
                        ref={isTodayDate ? todayRef : null}
                        className={`
                          flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 day-entry
                          ${isTodayDate ? 'bg-yellow-100 border-yellow-300 font-semibold today-highlight' : ''}
                          ${isWeekendDay && !isHoliday ? 'weekend-highlight' : ''}
                          ${isHoliday && isWeekendDay ? 'holiday-weekend-highlight' : ''}
                          ${isHoliday && !isWeekendDay ? 'holiday-highlight' : ''}
                          ${isPast ? 'past-day' : ''}
                        `}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-6 h-6 border-2 day-checkbox ${isPast ? 'bg-green-200 border-green-400' : 'border-gray-400'}`}
                          >
                            {isPast && (
                              <span className="text-green-700 text-sm font-bold flex items-center justify-center h-full">
                                ✓
                              </span>
                            )}
                          </div>

                          <div className="font-medium">{dayName}</div>
                          <div className="text-gray-600 flex items-center space-x-2">
                            <span>
                              {dayMonthName} {dayNumber}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="text-[8px]">📅</span>
                            )}
                            {holidayInfo && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full no-print">
                                {holidayInfo.name} Day {holidayInfo.dayNumber}/
                                {holidayInfo.totalDays}
                              </span>
                            )}
                          </div>
                          {isTodayDate && (
                            <div className="bg-red-500 text-white px-2 py-1 rounded text-sm no-print">
                              TODAY
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-gray-400 text-sm">
                            Day {globalIndex + 1} of {yearDays.length}
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="mt-1 text-xs space-y-1">
                              {dayEvents.slice(0, 3).map((event, i) => {
                                const timeDisplay = getEventDisplayForDate(
                                  event,
                                  date,
                                )
                                return (
                                  <div key={i}>
                                    {event.allDay ? (
                                      <span
                                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full inline-block cursor-help ${
                                          event.isRecurring
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                                        }`}
                                        title={
                                          event.title.length > 15
                                            ? event.title
                                            : undefined
                                        }
                                      >
                                        {(() => {
                                          const dayProgress =
                                            getEventDisplayForDate(event, date)
                                          const emoji = getEventEmoji(
                                            event.title,
                                          )
                                          const title =
                                            event.title.length > 12
                                              ? `${event.title.substring(0, 12)}...`
                                              : event.title
                                          const recurringIndicator =
                                            event.isRecurring ? '' : '★ '
                                          return dayProgress
                                            ? `${recurringIndicator}${dayProgress} ${title} ${emoji}`
                                            : `${recurringIndicator}${title} ${emoji}`
                                        })()}
                                      </span>
                                    ) : (
                                      <div
                                        className={`cursor-help ${
                                          event.isRecurring
                                            ? 'text-blue-700'
                                            : 'text-purple-700'
                                        }`}
                                        title={
                                          event.title.length > 22
                                            ? event.title
                                            : undefined
                                        }
                                      >
                                        {!event.isRecurring && (
                                          <span className="text-purple-600 font-medium mr-1">
                                            ★
                                          </span>
                                        )}
                                        {timeDisplay && (
                                          <span className="font-medium mr-1">
                                            {timeDisplay}
                                          </span>
                                        )}
                                        <span
                                          className={
                                            event.isRecurring
                                              ? 'text-blue-600'
                                              : 'text-purple-600'
                                          }
                                        >
                                          {(() => {
                                            const emoji = getEventEmoji(
                                              event.title,
                                            )
                                            const title =
                                              event.title.length > 20
                                                ? `${event.title.substring(0, 20)}...`
                                                : event.title
                                            return `${title} ${emoji}`
                                          })()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                              {dayEvents.length > 3 && (
                                <div className="text-gray-500 text-xs">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        })()}
      </div>

      <div className="mt-8 text-center text-gray-500 calendar-footer no-print">
        <p>
          Linear Calendar for {currentYear} • {yearDays.length} days total
        </p>
        <p className="text-sm">
          Print this page (Ctrl+P / Cmd+P) to create your physical calendar
        </p>
        <p className="text-xs mt-2">
          💡 Tip: Use "Print to PDF" to save a digital copy
        </p>
      </div>

      {/* Floating Jump to Today Button */}
      <button
        onClick={scrollToToday}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors no-print z-50"
        title="Jump to Today"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  )
}
