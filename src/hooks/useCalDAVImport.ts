import { useState } from 'react'
import { importFromCalDAV } from '../utils/caldavUtils'
import type { CalDAVCredentials, CalendarEvent } from '../types'

export function useCalDAVImport() {
  const [isCalDAVLoading, setIsCalDAVLoading] = useState(false)
  const [calDAVCredentials, setCalDAVCredentials] = useState<CalDAVCredentials>(
    {
      username: '',
      password: '',
      serverUrl: '',
    },
  )
  const [showCalDAVForm, setShowCalDAVForm] = useState(false)

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
