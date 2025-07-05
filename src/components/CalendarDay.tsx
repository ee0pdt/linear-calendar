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
}

export function CalendarDay({
  date,
  events,
  isToday: isTodayProp,
  todayRef,
}: CalendarDayProps) {
  const { dayName, dayNumberOrdinal, monthName } = formatDate(date)
  const isPast = isPastDay(date)
  const isWeekendDay = isWeekend(date)
  const isHoliday = isSchoolHoliday(date)
  const holidayInfo = getSchoolHolidayInfo(date)
  const { verse, loading: verseLoading, error: verseError } = useVerseOfTheDay()

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
  const displayedEvents = sortedEvents
  const globalIndex = (() => {
    // Used for "Day X of Y" counter
    const yearStart = new Date(date.getFullYear(), 0, 1)
    return Math.floor(
      (date.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24),
    )
  })()

  // Main row: responsive layout
  return (
    <div
      ref={isTodayProp ? todayRef : undefined}
      className={`day-entry border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors relative
        ${isTodayProp ? 'today-highlight bg-gray-50 dark:bg-gray-800 border-l-4 sm:border-l-8 border-blue-500 dark:border-blue-400 shadow-lg font-bold z-10' : ''}
        ${isWeekendDay && !isHoliday ? 'weekend-highlight bg-gray-100 dark:bg-gray-800' : ''}
        ${isHoliday && isWeekendDay ? 'holiday-weekend-highlight bg-blue-50 dark:bg-gray-800' : ''}
        ${isHoliday && !isWeekendDay ? 'holiday-highlight bg-green-50 dark:bg-gray-800' : ''}
        ${isPast ? 'past-day dark:opacity-70' : ''}
        p-3 sm:p-4 min-h-[3rem] sm:min-h-[4rem]`}
      style={isTodayProp ? { position: 'relative' } : {}}
    >
      {/* TODAY indicator - responsive */}
      {isTodayProp && (
        <>
          {/* Mobile: Larger blue dot */}
          <div className="sm:hidden absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg z-20" />

          {/* Desktop: Full badge */}
          <div className="hidden sm:flex absolute -left-28 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-base font-extrabold shadow-md border-2 border-blue-700 no-print items-center z-20">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" fill="#fff2" />
              <path
                d="M8 2v4M16 2v4M3 10h18"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>TODAY</span>
          </div>
        </>
      )}

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-gray-400 flex items-center space-x-2 font-normal">
            <span
              className="inline-block w-12 text-center rounded-full bg-gray-100 text-gray-400 dark:bg-black dark:text-gray-100 px-2 py-1 mr-2 text-sm font-normal"
              style={{ minWidth: '48px' }}
            >
              {dayName}
            </span>
            <span className="text-gray-800 font-bold text-lg dark:text-gray-100">
              {dayNumberOrdinal}
            </span>
            <span className="text-gray-700 font-medium dark:text-gray-100">
              {monthName}
            </span>
            {holidayInfo && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full no-print">
                {holidayInfo.name} Day {holidayInfo.dayNumber}/
                {holidayInfo.totalDays}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-sm day-counter">
            Day {globalIndex + 1} of {date.getFullYear() % 4 === 0 ? 366 : 365}
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
                <div className="verse-of-the-day text-blue-900 italic text-xs sm:text-sm max-w-xl mx-auto">
                  <span>“{verse.text}”</span>
                  <br />
                  <span className="font-semibold text-blue-700">
                    {verse.reference}
                  </span>
                </div>
              )}
            </div>
          )}
          {dayEvents.length > 0 && (
            <div className="mt-1 text-xs space-y-1 events-list">
              {sortedEvents.map((event, i) => {
                const timeDisplay = getEventDisplayForDate(event, date)
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
                          event.title.length > 15 ? event.title : undefined
                        }
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
                        className={`cursor-help ${
                          event.isRecurring
                            ? 'text-blue-700'
                            : 'text-purple-700'
                        }`}
                        title={
                          event.title.length > 22 ? event.title : undefined
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
            <span className="inline-block w-10 text-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-normal">
              {dayName}
            </span>
            <span className="text-gray-800 font-bold text-base">
              {dayNumberOrdinal}
            </span>
            <span className="text-gray-700 font-medium text-sm">
              {monthName}
            </span>
          </div>
          <div className="text-gray-400 text-xs">
            Day {globalIndex + 1} of {date.getFullYear() % 4 === 0 ? 366 : 365}
          </div>
        </div>

        {/* Holiday badge - full width on mobile */}
        {holidayInfo && (
          <div className="w-full">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full block text-center">
              {holidayInfo.name} Day {holidayInfo.dayNumber}/
              {holidayInfo.totalDays}
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
              <div className="verse-of-the-day text-blue-900 italic text-xs max-w-xl mx-auto">
                <span>“{verse.text}”</span>
                <br />
                <span className="font-semibold text-blue-700">
                  {verse.reference}
                </span>
              </div>
            )}
          </div>
        )}
        {/* Events - full width on mobile */}
        {dayEvents.length > 0 && (
          <div className="space-y-1">
            {sortedEvents.map((event, i) => {
              const timeDisplay = getEventDisplayForDate(event, date)
              return (
                <div key={i} className="w-full">
                  {event.allDay ? (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full block text-center cursor-help ${
                        event.isRecurring
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                      }`}
                      title={event.title.length > 25 ? event.title : undefined}
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
                      className={`text-xs cursor-help text-center p-1 rounded ${
                        event.isRecurring ? 'text-blue-700' : 'text-purple-700'
                      }`}
                      title={event.title.length > 30 ? event.title : undefined}
                    >
                      {!event.isRecurring && (
                        <span className="text-purple-600 font-medium mr-1">
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
}
