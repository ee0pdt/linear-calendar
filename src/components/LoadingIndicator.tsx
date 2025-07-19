import { useEffect, useState } from 'react'
import { Activity, Clock } from 'lucide-react'

interface LoadingIndicatorProps {
  isLoading: boolean
  loadingText?: string
  showSpinner?: boolean
  className?: string
}

export function LoadingIndicator({
  isLoading,
  loadingText = 'Loading...',
  showSpinner = true,
  className = '',
}: LoadingIndicatorProps) {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '.'
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        {showSpinner && (
          <div className="relative">
            <Activity
              size={32}
              className="text-blue-600 dark:text-blue-400 animate-pulse"
            />
            <div className="absolute inset-0 animate-spin">
              <div className="h-8 w-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Clock size={16} />
          <span className="font-medium">
            {loadingText}
            <span className="inline-block w-6 text-left">{dots}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// Progressive loading indicator for calendar components
export function CalendarLoadingIndicator({
  stage,
  totalStages,
}: {
  stage: number
  totalStages: number
}) {
  const percentage = Math.round((stage / totalStages) * 100)

  const stages = [
    'Initializing calendar...',
    'Loading time rings...',
    'Preparing calendar grid...',
    'Loading events...',
    'Rendering calendar...',
  ]

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-6">
        {/* Logo/Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Linear Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ADHD-friendly time management
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {stages[stage - 1] || 'Loading...'}
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance hint */}
        {stage >= 3 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            <Activity size={12} className="inline mr-1" />
            Performance dashboard will be available in top-right corner
          </div>
        )}
      </div>
    </div>
  )
}
