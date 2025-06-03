import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: LinearCalendar,
})

interface CalendarEvent {
  title: string
  start: Date
  end: Date
  allDay: boolean
}

function LinearCalendar() {
  const currentYear = new Date().getFullYear()
  const today = new Date()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const todayRef = useRef<HTMLDivElement>(null)
  
  // Generate all days of the year
  const generateYearDays = (year: number) => {
    const days = []
    const startDate = new Date(year, 0, 1) // January 1st
    const endDate = new Date(year, 11, 31) // December 31st
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }
    
    return days
  }
  
  const yearDays = generateYearDays(currentYear)
  
  const formatDate = (date: Date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    return {
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      monthName: monthNames[date.getMonth()],
      fullDate: date
    }
  }
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }
  
  const isPastDay = (date: Date) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return checkDate < todayDate
  }
  
  const isFirstOfMonth = (date: Date) => {
    return date.getDate() === 1
  }
  
  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday = 0, Saturday = 6
  }
  
  const isSchoolHoliday = (date: Date) => {
    const month = date.getMonth() + 1 // 1-12
    const day = date.getDate()
    
    // 2025 UK School Holiday periods (approximate - Oxfordshire pattern)
    const holidays = [
      // Christmas holidays (late Dec 2024 into Jan 2025)
      { start: [1, 1], end: [1, 6] }, // New Year period
      
      // February half term
      { start: [2, 17], end: [2, 21] },
      
      // Easter holidays
      { start: [4, 7], end: [4, 21] },
      
      // May half term  
      { start: [5, 26], end: [5, 30] },
      
      // Summer holidays
      { start: [7, 21], end: [9, 1] },
      
      // October half term
      { start: [10, 27], end: [10, 31] },
      
      // Christmas holidays (end of year)
      { start: [12, 22], end: [12, 31] }
    ]
    
    return holidays.some(holiday => {
      const [startMonth, startDay] = holiday.start
      const [endMonth, endDay] = holiday.end
      
      if (startMonth === endMonth) {
        return month === startMonth && day >= startDay && day <= endDay
      } else {
        return (month === startMonth && day >= startDay) || 
               (month === endMonth && day <= endDay) ||
               (month > startMonth && month < endMonth)
      }
    })
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
          const isAllDay = !dtStartLine.includes('T') || 
                          (currentEvent.start.getHours() === 0 && 
                           currentEvent.start.getMinutes() === 0 && 
                           currentEvent.start.getSeconds() === 0 &&
                           currentEvent.end && 
                           currentEvent.end.getHours() === 0 && 
                           currentEvent.end.getMinutes() === 0)
          
          currentEvent.allDay = isAllDay
          events.push(currentEvent as CalendarEvent)
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
        }
      }
    }
    
    // Filter events for current year
    return events.filter(event => event.start.getFullYear() === currentYear)
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
        const content = e.target?.result as string
        const parsedEvents = parseICSFile(content)
        setEvents(parsedEvents)
      }
      reader.readAsText(file)
    }
  }
  
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStartDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate())
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      if (!event.allDay) {
        // Timed events - only show on exact start date
        return checkDate.getTime() === eventStartDate.getTime()
      }
      
      if (!event.end) {
        // Single day all-day event
        return checkDate.getTime() === eventStartDate.getTime()
      }
      
      // Multi-day all-day event - end date in ICS is exclusive (day after last day)
      const eventEndDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate())
      const lastIncludedDay = new Date(eventEndDate.getTime() - 24 * 60 * 60 * 1000) // Subtract one day
      
      return checkDate >= eventStartDate && checkDate <= lastIncludedDay
    })
  }
  
  const getEventDisplayForDate = (event: CalendarEvent, date: Date): string => {
    console.log('Event:', event.title, 'AllDay:', event.allDay, 'Start:', event.start, 'End:', event.end)
    
    if (!event.allDay) {
      // Timed events show the time
      return event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
    
    // All-day events - no time prefix needed
    if (!event.end) {
      // Single day all-day event
      return ''
    }
    
    // Check if it's actually a multi-day event
    const eventStartDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate())
    const eventEndDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate())
    const lastIncludedDay = new Date(eventEndDate.getTime() - 24 * 60 * 60 * 1000) // Subtract one day
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    // Single day all-day event (start and end are same day after adjustment)
    if (eventStartDate.getTime() === lastIncludedDay.getTime()) {
      return ''
    }
    
    // Multi-day all-day event - show progress
    const totalDays = Math.ceil((lastIncludedDay.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    if (checkDate.getTime() === eventStartDate.getTime()) {
      return `Day 1/${totalDays}`
    } else if (checkDate.getTime() === lastIncludedDay.getTime()) {
      return `Final day`
    } else {
      const dayNumber = Math.ceil((checkDate.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return `Day ${dayNumber}/${totalDays}`
    }
  }
  
  const scrollToToday = () => {
    todayRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 linear-calendar-container">
      <h1 className="text-3xl font-bold text-center mb-8 no-print">
        Linear Calendar {currentYear}
      </h1>
      
      <div className="mb-6 no-print">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Import Apple Calendar</h2>
          <p className="text-sm text-gray-600 mb-3">
            Export your calendar from Apple Calendar as an ICS file and upload it here to see your events.
          </p>
          <input
            type="file"
            accept=".ics"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {events.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Loaded {events.length} events from your calendar
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-1 day-list">
        {yearDays.map((date, index) => {
          const { dayName, dayNumber, monthName } = formatDate(date)
          const isTodayDate = isToday(date)
          const isMonthStart = isFirstOfMonth(date)
          const isWeekendDay = isWeekend(date)
          const isHoliday = isSchoolHoliday(date)
          const isPast = isPastDay(date)
          const dayEvents = getEventsForDate(date)
          const monthNumber = date.getMonth() + 1
          
          return (
            <div key={index} ref={isTodayDate ? todayRef : null}>
              {isMonthStart && (
                <div 
                  className="bg-blue-100 text-blue-800 font-bold text-lg p-2 mt-4 first:mt-0 month-header"
                  data-month={monthNumber}
                >
                  {monthName} {currentYear}
                </div>
              )}
              
              <div
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
                  <div className={`w-6 h-6 border-2 day-checkbox ${isPast ? 'bg-green-200 border-green-400' : 'border-gray-400'}`}>
                    {isPast && <span className="text-green-700 text-sm font-bold flex items-center justify-center h-full">✓</span>}
                  </div>
                  <div className="font-medium">
                    {dayName}
                  </div>
                  <div className="text-gray-600">
                    {monthName} {dayNumber}
                    {isHoliday && <span className="text-[8px] ml-1">📚</span>}
                    {dayEvents.length > 0 && <span className="text-[8px] ml-1">📅</span>}
                  </div>
                  {isTodayDate && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-sm no-print">
                      TODAY
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-gray-400 text-sm">
                    Day {index + 1} of {yearDays.length}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 text-xs">
                      {dayEvents.slice(0, 3).map((event, i) => {
                        const timeDisplay = getEventDisplayForDate(event, date)
                        return (
                          <div key={i} className="text-blue-700 mb-1">
                            {timeDisplay && (
                              <span className="font-medium mr-1">
                                {timeDisplay}
                              </span>
                            )}
                            <span className="text-blue-600">
                              {event.title.length > 25 ? `${event.title.substring(0, 25)}...` : event.title}
                            </span>
                          </div>
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-gray-500 text-xs">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-8 text-center text-gray-500 calendar-footer no-print">
        <p>Linear Calendar for {currentYear} • {yearDays.length} days total</p>
        <p className="text-sm">Print this page (Ctrl+P / Cmd+P) to create your physical calendar</p>
        <p className="text-xs mt-2">💡 Tip: Use "Print to PDF" to save a digital copy</p>
      </div>
      
      {/* Floating Jump to Today Button */}
      <button
        onClick={scrollToToday}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors no-print z-50"
        title="Jump to Today"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  )
}
