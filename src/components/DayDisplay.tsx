import { getEventEmoji } from '../utils/emojiUtils'
import { getUserTimezone } from '../utils/timezoneUtils'
import type { DayInfo } from '../types'

interface DayDisplayProps {
  dayInfo: DayInfo
  isToday?: boolean
  ref?: React.RefObject<HTMLDivElement>
}

export function DayDisplay({ dayInfo, isToday, ref }: DayDisplayProps) {
  const { date, events, isFirstOfMonth, isWeekend } = dayInfo

  const formatDayDate = (dateToFormat: Date) => {
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
    return `${dayNames[dateToFormat.getDay()]}, ${monthNames[dateToFormat.getMonth()]} ${dateToFormat.getDate()}`
  }

  const formatTimeRange = (start: Date, end?: Date) => {
    const userTimezone = getUserTimezone()
    const formatTime = (timeDate: Date) =>
      timeDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: userTimezone,
      })

    if (!end) return formatTime(start)
    return `${formatTime(start)} - ${formatTime(end)}`
  }

  const getDayClasses = () => {
    const classes = ['day']
    if (isToday) classes.push('today')
    if (isFirstOfMonth) classes.push('first-of-month')
    if (isWeekend) classes.push('weekend')
    if (events.length > 0) classes.push('has-events')
    return classes.join(' ')
  }

  return (
    <div
      ref={isToday ? ref : undefined}
      className={
        getDayClasses() +
        ' bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700'
      }
      data-date={date.toISOString().split('T')[0]}
    >
      <div className="day-header bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="day-date text-gray-800 dark:text-gray-100">
          {formatDayDate(date)}
        </span>
        {events.length > 0 && (
          <span className="event-count text-gray-500 dark:text-gray-300">
            ({events.length})
          </span>
        )}
      </div>

      {events.length > 0 && (
        <div className="day-events">
          {events.map((event, index) => (
            <div key={index} className="event">
              <span className="event-emoji">{getEventEmoji(event.title)}</span>
              <div className="event-details">
                <span className="event-title">{event.title}</span>
                {!event.allDay && (
                  <span className="event-time">
                    {formatTimeRange(event.start, event.end)}
                  </span>
                )}
                {event.isRecurring && (
                  <span className="recurring-indicator">🔄</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
