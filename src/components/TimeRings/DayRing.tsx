import React from 'react'
import { getUserTimezone } from '../../utils/timezoneUtils'

interface DayRingProps {
  currentDate?: Date
  size?: number
}

// Time range: 7:00am to 9:30pm (21.5 hours)
const START_HOUR = 7
const END_HOUR = 21.5
const TOTAL_HOURS = END_HOUR - START_HOUR

function getDayProgress(date: Date) {
  const hours = date.getHours() + date.getMinutes() / 60
  if (hours < START_HOUR) return 0
  if (hours > END_HOUR) return 1
  return (hours - START_HOUR) / TOTAL_HOURS
}

export const DayRing: React.FC<DayRingProps> = ({
  currentDate,
  size = 120,
}) => {
  const now = currentDate || new Date()
  const progress = getDayProgress(now)
  const percent = Math.round(progress * 100)
  const stroke = Math.max(6, Math.round(size / 10))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: size,
      }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eee"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4f8cff"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s' }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size < 60 ? '0.8em' : size < 80 ? '1.0em' : '1.5em'}
          fill="#333"
        >
          {percent}%
        </text>
      </svg>
      <div style={{ marginTop: 4, fontWeight: 500, fontSize: 12 }}>Day</div>
      <div style={{ fontSize: 10, color: '#888' }}>
        {now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: getUserTimezone(),
        })}
      </div>
    </div>
  )
}
