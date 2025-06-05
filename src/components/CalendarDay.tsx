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

  const getDayClasses = () => {
    const baseClasses =
      'day-item p-4 border border-gray-200 bg-white transition-colors'
    const classes = [baseClasses]

    if (isTodayProp)
      classes.push('today-highlight bg-yellow-50 border-yellow-300 shadow-md')
    if (isPast) classes.push('past-day opacity-60')
    if (isWeekendDay && !isHoliday) classes.push('weekend-day bg-blue-50')
    if (isHoliday) classes.push('holiday-day bg-red-50 border-red-200')

    return classes.join(' ')
  }

  const formatTimeDisplay = (eventDate: Date) => {
    return eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div ref={isTodayProp ? todayRef : undefined} className={getDayClasses()}>
      <div className="day-header">
        {/* Month header for first day of month */}
        {isFirstDay && (
          <div className="month-header text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
            {monthName}
          </div>
        )}

        {/* Day header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {dayNumber}
            </div>
            <div className="text-sm text-gray-600">{dayName}</div>
          </div>

          {/* Today indicator */}
          {isTodayProp && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              TODAY
            </div>
          )}
        </div>

        {/* Holiday indicator */}
        {holidayInfo && (
          <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded mb-2">
            {holidayInfo.name} (Day {holidayInfo.dayNumber}/
            {holidayInfo.totalDays})
          </div>
        )}

        {/* Weekend indicator */}
        {isWeekendDay && !isHoliday && (
          <div className="text-blue-600 text-xs font-medium mb-2">Weekend</div>
        )}
      </div>

      {/* Events */}
      {dayEvents.length > 0 && (
        <div className="day-events space-y-1">
          {displayedEvents.map((event, index) => {
            const timeDisplay = !event.allDay
              ? formatTimeDisplay(event.start)
              : null

            const isMultiDay =
              event.end &&
              event.start.toDateString() !== event.end.toDateString()

            return (
              <div key={index} className="event-item">
                {isMultiDay ? (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium cursor-help ${
                      event.isRecurring
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                    title={event.title.length > 12 ? event.title : undefined}
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
                        event.isRecurring ? 'text-blue-600' : 'text-purple-600'
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
  )
}
