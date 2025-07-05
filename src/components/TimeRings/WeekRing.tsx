import React from 'react'

interface WeekRingProps {
  currentDate?: Date
  size?: number
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekProgress(date: Date) {
  // Sunday = 0, Saturday = 6
  const day = date.getDay()
  const hour = date.getHours() + date.getMinutes() / 60
  // Progress through the week, including partial day
  return (day + hour / 24) / 7
}

export const WeekRing: React.FC<WeekRingProps> = ({
  currentDate,
  size = 120,
}) => {
  const now = currentDate || new Date()
  const progress = getWeekProgress(now)
  const percent = Math.round(progress * 100)
  const stroke = Math.max(6, Math.round(size / 10))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <div
      className="text-gray-900 dark:text-gray-100"
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
          stroke="#ffb347"
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
          fill="currentColor"
        >
          {percent}%
        </text>
      </svg>
      <div className="mt-1 font-medium text-xs sm:text-sm">Week</div>
      <div className="text-xs text-gray-600 dark:text-gray-300">
        {DAYS[now.getDay()]}
      </div>
    </div>
  )
}
