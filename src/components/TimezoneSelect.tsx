import React from 'react'
import { AVAILABLE_TIMEZONES } from '../constants'
import { getUserTimezone, setUserTimezone } from '../utils/timezoneUtils'

interface TimezoneSelectProps {
  onTimezoneChange?: (timezone: string) => void
}

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  onTimezoneChange,
}) => {
  const currentTimezone = getUserTimezone()

  const handleTimezoneChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newTimezone = event.target.value
    setUserTimezone(newTimezone)
    onTimezoneChange?.(newTimezone)

    // Refresh the page to apply timezone changes
    window.location.reload()
  }

  return (
    <div className="timezone-selector">
      <label htmlFor="timezone-select" className="timezone-label">
        Timezone:
      </label>
      <select
        id="timezone-select"
        value={currentTimezone}
        onChange={handleTimezoneChange}
        className="timezone-select"
      >
        {AVAILABLE_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  )
}
