import { useEffect, useState } from 'react'
import { importFromCalDAV } from '../utils/caldavUtils'
import { loadCalDAVCredentials } from '../utils/storageUtils'
import type { CalendarEvent } from '../types'

interface AutoRefreshState {
  isRefreshing: boolean
  lastRefreshTime: Date | null
  refreshStatus: 'idle' | 'refreshing' | 'success' | 'error'
  error: string | null
}

interface UseAutoRefreshReturn extends AutoRefreshState {
  refreshCalendar: () => Promise<void>
}

export function useAutoRefresh(
  onEventsUpdate: (events: Array<CalendarEvent>, fileName: string) => void,
): UseAutoRefreshReturn {
  const [state, setState] = useState<AutoRefreshState>({
    isRefreshing: false,
    lastRefreshTime: null,
    refreshStatus: 'idle',
    error: null,
  })

  // Auto-refresh on mount if CalDAV credentials exist
  useEffect(() => {
    const autoRefreshOnMount = async () => {
      const credentials = loadCalDAVCredentials()
      if (credentials) {
        await refreshCalendar()
      }
    }

    autoRefreshOnMount()
  }, [])

  const refreshCalendar = async () => {
    const credentials = loadCalDAVCredentials()
    if (!credentials) {
      setState((prev) => ({
        ...prev,
        refreshStatus: 'error',
        error: 'No CalDAV credentials found',
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      isRefreshing: true,
      refreshStatus: 'refreshing',
      error: null,
    }))

    try {
      const events = await importFromCalDAV(credentials)
      onEventsUpdate(events, `CalDAV: ${credentials.username}`)

      setState((prev) => ({
        ...prev,
        isRefreshing: false,
        lastRefreshTime: new Date(),
        refreshStatus: 'success',
      }))

      // Reset success status after 3 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          refreshStatus: 'idle',
        }))
      }, 3000)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isRefreshing: false,
        refreshStatus: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  return {
    ...state,
    refreshCalendar,
  }
}
