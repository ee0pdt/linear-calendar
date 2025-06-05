import { useState, useCallback } from 'react'
import { importFromCalDAV } from '../utils/caldavUtils'
import type { CalDAVCredentials, CalendarEvent } from '../types'

export function useCalDAVImport() {
  const [isCalDAVLoading, setIsCalDAVLoading] = useState(false)
  const [calDAVCredentials, _setCalDAVCredentials] =
    useState<CalDAVCredentials>(() => {
      const saved = localStorage.getItem('linear-calendar-caldav-credentials')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return { username: '', password: '', serverUrl: '' }
        }
      }
      return { username: '', password: '', serverUrl: '' }
    })
  const [showCalDAVForm, setShowCalDAVForm] = useState(false)

  // Always sync credentials to localStorage
  const setCalDAVCredentials = useCallback((creds: CalDAVCredentials) => {
    _setCalDAVCredentials(creds)
    localStorage.setItem(
      'linear-calendar-caldav-credentials',
      JSON.stringify(creds),
    )
  }, [])

  const handleCalDAVImport = async (
    onSuccess: (events: Array<CalendarEvent>) => void,
    onError: (error: string) => void,
  ) => {
    if (!calDAVCredentials.username || !calDAVCredentials.password) {
      onError('Username and password are required')
      return
    }

    setIsCalDAVLoading(true)
    try {
      const importedEvents = await importFromCalDAV(calDAVCredentials)
      onSuccess(importedEvents)
      setShowCalDAVForm(false)
      // Reset credentials after successful import for security
      setCalDAVCredentials({
        username: '',
        password: '',
        serverUrl: '',
      })
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
    setCalDAVCredentials({
      username: '',
      password: '',
      serverUrl: '',
    })
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
