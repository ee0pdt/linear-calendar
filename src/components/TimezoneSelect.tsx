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
    <div className="timezone-selector flex flex-col gap-2 mt-4">
      <label
        htmlFor="timezone-select"
        className="text-sm font-semibold text-gray-700 dark:text-gray-200"
      >
        Timezone:
      </label>
      <select
        id="timezone-select"
        value={currentTimezone}
        onChange={handleTimezoneChange}
        className="rounded-lg px-4 py-2 font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
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
