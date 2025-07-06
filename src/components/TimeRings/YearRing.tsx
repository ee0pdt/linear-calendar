import React from 'react'

interface YearRingProps {
  currentDate?: Date
  size?: number
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function getYearProgress(date: Date) {
  const year = date.getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  const now = date.getTime()
  const total = end.getTime() - start.getTime()
  const elapsed = now - start.getTime()
  return elapsed / total
}

export const YearRing: React.FC<YearRingProps> = ({
  currentDate,
  size = 120,
}) => {
  const now = currentDate || new Date()
  const progress = getYearProgress(now)
  const percent = Math.round(progress * 100)
  const year = now.getFullYear()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24),
  )
  const totalDays = isLeapYear(year) ? 366 : 365
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
          stroke="var(--ring-bg)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ff375f"
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
      <div className="mt-1 font-medium text-xs sm:text-sm">Year</div>
      <div className="text-xs text-gray-600 dark:text-gray-300">
        {dayOfYear} / {totalDays}
      </div>
    </div>
  )
}
