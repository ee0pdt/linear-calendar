import { memo, useMemo } from 'react'
import { formatDate, isPastDay, isWeekend } from '../utils/dateUtils'
import { getSchoolHolidayInfo, isSchoolHoliday } from '../utils/holidayUtils'
import { getEventEmoji } from '../utils/emojiUtils'
import { getEventDisplayForDate, getEventsForDate } from '../utils/eventUtils'
import type { CalendarEvent } from '../types'
import { useVerseOfTheDay } from '../hooks/useVerseOfTheDay'

interface CalendarDayProps {
  date: Date
  events: Array<CalendarEvent>
  isToday: boolean
  todayRef?: React.RefObject<HTMLDivElement | null>
  onEventClick?: (event: CalendarEvent) => void
}

export const CalendarDay = memo(function CalendarDay({
  date,
  events,
  isToday: isTodayProp,
  todayRef,
  onEventClick,
}: CalendarDayProps) {
  // Memoize day metadata to prevent recalculation
  const dayData = useMemo(() => {
    const { dayName, dayNumberOrdinal, monthName } = formatDate(date)
    const isPast = isPastDay(date)
    const isWeekendDay = isWeekend(date)
    const isHoliday = isSchoolHoliday(date)
    const holidayInfo = getSchoolHolidayInfo(date)

    // Calculate global index for "Day X of Y" counter
    const yearStart = new Date(date.getFullYear(), 0, 1)
    const globalIndex = Math.floor(
      (date.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24),
    )

    return {
      dayName,
      dayNumberOrdinal,
      monthName,
      isPast,
      isWeekendDay,
      isHoliday,
      holidayInfo,
      globalIndex,
    }
  }, [date])

  const { verse, loading: verseLoading, error: verseError } = useVerseOfTheDay()

  // Memoize event processing to prevent re-sorting on every render
  const dayEventData = useMemo(() => {
    const dayEvents = getEventsForDate(events, date)
    // Sort events by time (all-day events first, then by start time)
    const sortedEvents = dayEvents.sort((a, b) => {
      // All-day events come first
      if (a.allDay !== b.allDay) {
        return a.allDay ? -1 : 1
      }
      // Both are timed events - sort by start time
      if (!a.allDay && !b.allDay) {
        return a.start.getTime() - b.start.getTime()
      }
      // Both are all-day events - sort by title
      return a.title.localeCompare(b.title)
    })
    return sortedEvents
  }, [events, date])

  // Main row: responsive layout
  return (
    <div
      ref={isTodayProp ? todayRef : undefined}
      data-date={date.toISOString().split('T')[0]} // YYYY-MM-DD format for easy targeting
      className={`day-entry border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors relative
        ${isTodayProp ? 'today-highlight bg-blue-50 dark:bg-blue-900 font-bold z-0' : ''}
        ${dayData.isWeekendDay && !dayData.isHoliday ? 'weekend-highlight bg-gray-100 dark:bg-gray-800' : ''}
        ${dayData.isHoliday && dayData.isWeekendDay ? 'holiday-weekend-highlight bg-blue-50 dark:bg-gray-800' : ''}
        ${dayData.isHoliday && !dayData.isWeekendDay ? 'holiday-highlight bg-green-50 dark:bg-gray-800' : ''}
        ${dayData.isPast ? 'past-day dark:opacity-70' : ''}
        p-3 sm:p-4 min-h-[3rem] sm:min-h-[4rem] ${isTodayProp ? 'text-lg sm:text-xl' : ''}`}
      style={isTodayProp ? { position: 'relative' } : {}}
    >
      {/* TODAY indicator - responsive */}
      {/* Removed Today pill and dot for today row */}

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-gray-400 flex items-center space-x-2 font-normal">
            <span
              className={`inline-block w-12 text-center rounded-full px-2 py-1 mr-2 text-sm font-normal ${isTodayProp ? 'bg-blue-700 text-white dark:bg-blue-600 dark:text-white' : 'bg-gray-100 text-gray-600 dark:bg-black dark:text-gray-100'}`}
              style={{ minWidth: '48px' }}
            >
              {dayData.dayName}
            </span>
            <span
              className={`font-bold ${isTodayProp ? 'text-blue-700 dark:text-blue-200 text-2xl' : 'text-gray-800 dark:text-gray-100 text-lg'}`}
            >
              {dayData.dayNumberOrdinal}
            </span>
            <span
              className={`font-medium ${isTodayProp ? 'text-blue-700 dark:text-blue-200 text-lg' : 'text-gray-700 dark:text-gray-100'}`}
            >
              {dayData.monthName}
            </span>
            {dayData.holidayInfo && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded-full no-print">
                {dayData.holidayInfo.name} Day {dayData.holidayInfo.dayNumber}/
                {dayData.holidayInfo.totalDays}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-sm day-counter">
            Day {dayData.globalIndex + 1} of{' '}
            {date.getFullYear() % 4 === 0 ? 366 : 365}
          </div>
          {/* Verse of the Day - Desktop */}
          {isTodayProp && (
            <div className="mt-2 mb-2">
              {verseLoading && (
                <span className="text-gray-400 text-xs">Loading verse...</span>
              )}
              {verseError && (
                <span className="text-red-500 text-xs">{verseError}</span>
              )}
              {verse && !verseLoading && !verseError && (
                <div className="verse-of-the-day text-blue-900 dark:text-blue-200 italic text-base sm:text-lg max-w-xl mx-auto font-semibold py-4">
                  <span>“{verse.text}”</span>
                  <br />
                  <span className="font-bold text-blue-700 dark:text-blue-400 text-base sm:text-lg">
                    {verse.reference}
                  </span>
                </div>
              )}
            </div>
          )}
          {dayEventData.length > 0 && (
            <div className="mt-1 text-xs space-y-1 events-list">
              {dayEventData.map((event, i) => {
                const timeDisplay = getEventDisplayForDate(event, date)
                return (
                  <div key={i}>
                    {event.allDay ? (
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full inline-block cursor-pointer hover:opacity-80 transition-opacity ${
                          event.isRecurring
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                            : 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 border-2 border-purple-300 dark:border-purple-700'
                        }`}
                        title={
                          event.title.length > 15 ? event.title : undefined
                        }
                        onClick={() => onEventClick?.(event)}
                      >
                        {(() => {
                          const dayProgress = getEventDisplayForDate(
                            event,
                            date,
                          )
                          const emoji = getEventEmoji(event.title)
                          const title =
                            event.title.length > 18
                              ? `${event.title.substring(0, 18)}...`
                              : event.title
                          const recurringIndicator = event.isRecurring
                            ? ''
                            : '★ '
                          return dayProgress
                            ? `${recurringIndicator}${dayProgress} ${title} ${emoji}`
                            : `${recurringIndicator}${title} ${emoji}`
                        })()}
                      </span>
                    ) : (
                      <div
                        className={`cursor-pointer hover:opacity-80 transition-opacity ${
                          event.isRecurring
                            ? 'text-blue-700 dark:text-blue-200'
                            : 'text-purple-700 dark:text-purple-200'
                        }`}
                        title={
                          event.title.length > 22 ? event.title : undefined
                        }
                        onClick={() => onEventClick?.(event)}
                      >
                        {!event.isRecurring && (
                          <span className="text-purple-600 font-medium mr-1 dark:text-purple-200">
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
                              ? 'text-blue-600 dark:text-blue-200'
                              : 'text-purple-600 dark:text-purple-200'
                          }
                        >
                          {(() => {
                            const emoji = getEventEmoji(event.title)
                            const title =
                              event.title.length > 25
                                ? `${event.title.substring(0, 25)}...`
                                : event.title
                            return `${title} ${emoji}`
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Vertical stacked layout */}
      <div className="sm:hidden space-y-2">
        {/* Date and day info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block w-10 text-center rounded-full px-1.5 py-0.5 text-xs font-normal ${isTodayProp ? 'bg-blue-700 text-white dark:bg-blue-600 dark:text-white' : 'bg-gray-100 text-gray-600 dark:bg-black dark:text-gray-100'}`}
            >
              {dayData.dayName}
            </span>
            <span
              className={`font-bold ${isTodayProp ? 'text-blue-700 dark:text-blue-200 text-xl' : 'text-gray-800 dark:text-gray-100 text-base'}`}
            >
              {dayData.dayNumberOrdinal}
            </span>
            <span
              className={`font-medium ${isTodayProp ? 'text-blue-700 dark:text-blue-200 text-lg' : 'text-gray-700 dark:text-gray-100 text-sm'}`}
            >
              {dayData.monthName}
            </span>
          </div>
          <div
            className={`text-xs ${isTodayProp ? 'text-blue-700 dark:text-blue-200 font-bold text-base' : 'text-gray-400'}`}
          >
            Day {dayData.globalIndex + 1} of{' '}
            {date.getFullYear() % 4 === 0 ? 366 : 365}
          </div>
        </div>

        {/* Holiday badge - full width on mobile */}
        {dayData.holidayInfo && (
          <div className="w-full">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium px-2 py-1 rounded-full block text-center">
              {dayData.holidayInfo.name} Day {dayData.holidayInfo.dayNumber}/
              {dayData.holidayInfo.totalDays}
            </span>
          </div>
        )}

        {/* Verse of the Day - Mobile */}
        {isTodayProp && (
          <div className="mb-2">
            {verseLoading && (
              <span className="text-gray-400 text-xs">Loading verse...</span>
            )}
            {verseError && (
              <span className="text-red-500 text-xs">{verseError}</span>
            )}
            {verse && !verseLoading && !verseError && (
              <div className="verse-of-the-day text-blue-900 dark:text-blue-200 italic text-base max-w-xl mx-auto font-semibold py-3">
                <span>“{verse.text}”</span>
                <br />
                <span className="font-bold text-blue-700 dark:text-blue-400 text-base">
                  {verse.reference}
                </span>
              </div>
            )}
          </div>
        )}
        {/* Events - full width on mobile */}
        {dayEventData.length > 0 && (
          <div className="space-y-1">
            {dayEventData.map((event, i) => {
              const timeDisplay = getEventDisplayForDate(event, date)
              return (
                <div key={i} className="w-full">
                  {event.allDay ? (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full block text-center cursor-pointer hover:opacity-80 transition-opacity ${
                        event.isRecurring
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                          : 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 border-2 border-purple-300 dark:border-purple-700'
                      }`}
                      title={event.title.length > 25 ? event.title : undefined}
                      onClick={() => onEventClick?.(event)}
                    >
                      {(() => {
                        const dayProgress = getEventDisplayForDate(event, date)
                        const emoji = getEventEmoji(event.title)
                        const title =
                          event.title.length > 45
                            ? `${event.title.substring(0, 45)}...`
                            : event.title
                        const recurringIndicator = event.isRecurring ? '' : '★ '
                        return dayProgress
                          ? `${recurringIndicator}${dayProgress} ${title} ${emoji}`
                          : `${recurringIndicator}${title} ${emoji}`
                      })()}
                    </span>
                  ) : (
                    <div
                      className={`text-xs cursor-pointer hover:opacity-80 transition-opacity text-center p-1 rounded ${
                        event.isRecurring
                          ? 'text-blue-700 dark:text-blue-200'
                          : 'text-purple-700 dark:text-purple-200'
                      }`}
                      title={event.title.length > 30 ? event.title : undefined}
                      onClick={() => onEventClick?.(event)}
                    >
                      {!event.isRecurring && (
                        <span className="text-purple-600 font-medium mr-1 dark:text-purple-200">
                          ★
                        </span>
                      )}
                      {timeDisplay && (
                        <span className="font-medium mr-1">{timeDisplay}</span>
                      )}
                      <span>
                        {(() => {
                          const emoji = getEventEmoji(event.title)
                          const title =
                            event.title.length > 45
                              ? `${event.title.substring(0, 45)}...`
                              : event.title
                          return `${title} ${emoji}`
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})
