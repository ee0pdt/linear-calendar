import { getEventEmoji } from '../utils/emojiUtils'
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
    const formatTime = (timeDate: Date) =>
      timeDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
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
      className={getDayClasses()}
      data-date={date.toISOString().split('T')[0]}
    >
      <div className="day-header">
        <span className="day-date">{formatDayDate(date)}</span>
        {events.length > 0 && (
          <span className="event-count">({events.length})</span>
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
