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
        ${isTodayProp ? 'today-highlight bg-yellow-100 border-l-8 border-blue-500 shadow-lg font-bold scale-[1.025] z-10 pl-24 pr-4 pt-4 pb-4' : 'pl-4 pr-4 pt-3 pb-3'}
        ${isWeekendDay && !isHoliday ? 'weekend-highlight' : ''}
        ${isHoliday && isWeekendDay ? 'holiday-weekend-highlight' : ''}
        ${isHoliday && !isWeekendDay ? 'holiday-highlight' : ''}
        ${isPast ? 'past-day' : ''}
      `}
      style={isTodayProp ? { position: 'relative' } : {}}
    >
      {/* Absolutely positioned floating TODAY badge, flush left with a gap */}
      {isTodayProp && (
        <div
          className="absolute -left-10 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-base font-extrabold shadow-md border-2 border-blue-700 no-print flex items-center z-20"
          style={{ pointerEvents: 'none' }}
        >
          <svg
            className="w-4 h-4 mr-1"
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
          TODAY
        </div>
      )}
      {/* Left column: day name, date, badges, TODAY */}
      <div className="flex items-center space-x-4">
        <div className="font-medium">{dayName}</div>
        <div className="text-gray-600 flex items-center space-x-2">
          <span>
            {monthName} {dayNumber}
          </span>
          {holidayInfo && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full no-print">
              {holidayInfo.name} Day {holidayInfo.dayNumber}/
              {holidayInfo.totalDays}
            </span>
          )}
        </div>
        {/* Empty placeholder for layout alignment when TODAY badge is floating */}
        {isTodayProp && <span className="w-0 h-0" />}
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
