import type { CalendarEvent } from '../types'

interface CalendarHeaderProps {
  currentYear: number
  today: Date
  events: Array<CalendarEvent>
  onJumpToToday: () => void
}

export function CalendarHeader({
  currentYear,
  today,
  events,
  onJumpToToday,
}: CalendarHeaderProps) {
  // Calculate total days in year
  const isLeapYear = (year: number) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const totalDays = isLeapYear(currentYear) ? 366 : 365

  return (
    <div className="calendar-header">
      <div className="header-content">
        <h1>Linear Calendar {currentYear}</h1>
        <div className="header-stats">
          <span>
            Linear Calendar for {currentYear} • {totalDays} days total
          </span>
          {events.length > 0 && (
            <span className="event-count">
              {' '}
              • {events.length} events loaded
            </span>
          )}
        </div>
      </div>

      <div className="header-actions">
        <button
          onClick={onJumpToToday}
          className="jump-today-btn"
          title="Jump to Today"
        >
          Today (
          {today.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
          )
        </button>
      </div>
    </div>
  )
}
