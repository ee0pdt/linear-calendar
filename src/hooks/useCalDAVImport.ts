import { useCallback, useState } from 'react'
import { importFromCalDAV } from '../utils/caldavUtils'
import {
  clearCalDAVCredentials,
  loadCalDAVCredentials,
  saveCalDAVCredentials,
} from '../utils/storageUtils'
import type { CalDAVCredentials, CalendarEvent } from '../types'

export function useCalDAVImport() {
  const [isCalDAVLoading, setIsCalDAVLoading] = useState(false)
  const [calDAVCredentials, _setCalDAVCredentials] =
    useState<CalDAVCredentials>(() => {
      const saved = loadCalDAVCredentials()
      return saved || { username: '', password: '', serverUrl: '' }
    })
  const [showCalDAVForm, setShowCalDAVForm] = useState(false)

  // Always sync credentials to localStorage
  const setCalDAVCredentials = useCallback((creds: CalDAVCredentials) => {
    _setCalDAVCredentials(creds)
    saveCalDAVCredentials(creds)
  }, [])

  const handleCalDAVImport = async (
    onSuccess: (events: Array<CalendarEvent>) => void,
    onError: (error: string) => void,
    startYear: number,
    endYear: number,
  ) => {
    if (!calDAVCredentials.username || !calDAVCredentials.password) {
      onError('Username and password are required')
      return
    }

    setIsCalDAVLoading(true)
    try {
      const importedEvents = await importFromCalDAV(calDAVCredentials, startYear, endYear)
      onSuccess(importedEvents)
      setShowCalDAVForm(false)
      // Keep credentials saved for future imports and refresh functionality
    } catch (error) {
      console.error('CalDAV import failed:', error)
      onError(
        error instanceof Error
          ? error.message
          : 'Failed to connect to CalDAV server',
      )
    } finally {
      setIsCalDAVLoading(false)
    }
  }

  const resetCalDAVState = () => {
    setShowCalDAVForm(false)
    _setCalDAVCredentials({
      username: '',
      password: '',
      serverUrl: '',
    })
    clearCalDAVCredentials()
    setIsCalDAVLoading(false)
  }

  return {
    isCalDAVLoading,
    calDAVCredentials,
    setCalDAVCredentials,
    showCalDAVForm,
    setShowCalDAVForm,
    handleCalDAVImport,
    resetCalDAVState,
  }
}
