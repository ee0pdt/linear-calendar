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
          fontSize="1.5em"
          fill="#333"
        >
          {percent}%
        </text>
      </svg>
      <div style={{ marginTop: 4, fontWeight: 500, fontSize: 12 }}>Year</div>
      <div style={{ fontSize: 10, color: '#888' }}>
        {year} • Day {dayOfYear} / {totalDays}
      </div>
    </div>
  )
}
