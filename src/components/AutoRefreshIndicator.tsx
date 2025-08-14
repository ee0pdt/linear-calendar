import { CheckCircle, Loader2, WifiOff } from 'lucide-react'
import type { ReactElement } from 'react'

interface AutoRefreshIndicatorProps {
  isRefreshing: boolean
  refreshStatus: 'idle' | 'refreshing' | 'success' | 'error'
  lastRefreshTime: Date | null
  error?: string | null
}

export function AutoRefreshIndicator({
  refreshStatus,
  lastRefreshTime,
  error,
}: AutoRefreshIndicatorProps): ReactElement {
  const getStatusIcon = () => {
    switch (refreshStatus) {
      case 'refreshing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (refreshStatus) {
      case 'refreshing':
        return 'Syncing...'
      case 'success':
        return 'Synced'
      case 'error':
        return 'Sync failed'
      default:
        return null
    }
  }

  const getTimeText = () => {
    if (!lastRefreshTime) return null

    const now = new Date()
    const diffMs = now.getTime() - lastRefreshTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return lastRefreshTime.toLocaleDateString()
  }

  if (refreshStatus === 'idle' && !lastRefreshTime) {
    return <div className="h-6" /> // Placeholder to maintain layout
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      {getStatusIcon()}
      <span className="hidden sm:inline">{getStatusText()}</span>
      {lastRefreshTime && refreshStatus !== 'refreshing' && (
        <span className="text-xs opacity-75">{getTimeText()}</span>
      )}
      {error && refreshStatus === 'error' && (
        <span className="text-xs text-red-500 max-w-48 truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  )
}
