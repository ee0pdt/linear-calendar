import React from 'react'

interface MonthRingProps {
  currentDate?: Date
  size?: number
}

function getMonthProgress(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const hour = date.getHours() + date.getMinutes() / 60
  // Get total days in month
  const totalDays = new Date(year, month + 1, 0).getDate()
  // Progress through the month, including partial day
  return (day - 1 + hour / 24) / totalDays
}

export const MonthRing: React.FC<MonthRingProps> = ({
  currentDate,
  size = 120,
}) => {
  const now = currentDate || new Date()
  const progress = getMonthProgress(now)
  const percent = Math.round(progress * 100)
  const year = now.getFullYear()
  const day = now.getDate()
  const totalDays = new Date(year, now.getMonth() + 1, 0).getDate()
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
          stroke="#34c759"
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
      <div className="mt-1 font-medium text-xs sm:text-sm">Month</div>
      <div className="text-xs text-gray-600 dark:text-gray-300">
        {day} / {totalDays}
      </div>
    </div>
  )
}
