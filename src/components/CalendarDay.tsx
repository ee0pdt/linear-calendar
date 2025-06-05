import {
  formatDate,
  isFirstOfMonth,
  isPastDay,
  isWeekend,
} from '../utils/dateUtils'
import { getSchoolHolidayInfo, isSchoolHoliday } from '../utils/holidayUtils'
import { getEventEmoji } from '../utils/emojiUtils'
import { getEventDisplayForDate, getEventsForDate } from '../utils/eventUtils'
import type { CalendarEvent } from '../types'

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
  const { dayName, dayNumber, monthName } = formatDate(date)
  const isPast = isPastDay(date)
  const isFirstDay = isFirstOfMonth(date)
  const isWeekendDay = isWeekend(date)
  const isHoliday = isSchoolHoliday(date)
  const holidayInfo = getSchoolHolidayInfo(date)

  const dayEvents = getEventsForDate(events, date)
  const displayedEvents = dayEvents.slice(0, 3)
  const globalIndex = (() => {
    // Used for "Day X of Y" counter
    const yearStart = new Date(date.getFullYear(), 0, 1)
    return Math.floor(
      (date.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24),
    )
  })()

  // Main row: left and right columns
  return (
    <div
      ref={isTodayProp ? todayRef : undefined}
      className={`day-entry flex items-center justify-between min-h-[3rem] border-b border-gray-200 transition-colors
        ${isTodayProp ? 'today-highlight bg-yellow-100 border-yellow-300 font-semibold' : ''}
        ${isWeekendDay && !isHoliday ? 'weekend-highlight' : ''}
        ${isHoliday && isWeekendDay ? 'holiday-weekend-highlight' : ''}
        ${isHoliday && !isWeekendDay ? 'holiday-highlight' : ''}
        ${isPast ? 'past-day' : ''}
      `}
    >
      {/* Left column: checkbox, day name, date, badges, TODAY */}
      <div className="flex items-center space-x-4">
        <div
          className={`w-6 h-6 border-2 day-checkbox flex items-center justify-center mr-2 ${
            isPast ? 'bg-green-200 border-green-400' : 'border-gray-400'
          }`}
        >
          {isPast && (
            <span className="text-green-700 text-sm font-bold">✓</span>
          )}
        </div>
        <div className="font-medium">{dayName}</div>
        <div className="text-gray-600 flex items-center space-x-2">
          <span>
            {monthName} {dayNumber}
          </span>
          {dayEvents.length > 0 && <span className="text-[8px]">📅</span>}
          {holidayInfo && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full no-print">
              {holidayInfo.name} Day {holidayInfo.dayNumber}/
              {holidayInfo.totalDays}
            </span>
          )}
        </div>
        {isTodayProp && (
          <div className="bg-red-500 text-white px-2 py-1 rounded text-sm no-print ml-2">
            TODAY
          </div>
        )}
      </div>

      {/* Right column: day counter and events */}
      <div className="text-right">
        <div className="text-gray-400 text-sm day-counter">
          Day {globalIndex + 1} of {date.getFullYear() % 4 === 0 ? 366 : 365}
        </div>
        {dayEvents.length > 0 && (
          <div className="mt-1 text-xs space-y-1 events-list">
            {displayedEvents.map((event, i) => {
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
                      title={event.title.length > 15 ? event.title : undefined}
                    >
                      {(() => {
                        const dayProgress = getEventDisplayForDate(event, date)
                        const emoji = getEventEmoji(event.title)
                        const title =
                          event.title.length > 12
                            ? `${event.title.substring(0, 12)}...`
                            : event.title
                        const recurringIndicator = event.isRecurring ? '' : '★ '
                        return dayProgress
                          ? `${recurringIndicator}${dayProgress} ${title} ${emoji}`
                          : `${recurringIndicator}${title} ${emoji}`
                      })()}
                    </span>
                  ) : (
                    <div
                      className={`cursor-help ${
                        event.isRecurring ? 'text-blue-700' : 'text-purple-700'
                      }`}
                      title={event.title.length > 22 ? event.title : undefined}
                    >
                      {!event.isRecurring && (
                        <span className="text-purple-600 font-medium mr-1">
                          ★
                        </span>
                      )}
                      {timeDisplay && (
                        <span className="font-medium mr-1">{timeDisplay}</span>
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
}
