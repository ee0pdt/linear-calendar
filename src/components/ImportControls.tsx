import { useRef } from 'react'
import type { CalendarEvent } from '../types'
import { parseICSFile } from '../utils/icsParser'
import { saveEventsToStorage } from '../utils/storageUtils'
import { importFromCalDAV } from '../utils/caldavUtils'

interface ImportControlsProps {
  events: Array<CalendarEvent>
  setEvents: (events: Array<CalendarEvent>) => void
  lastImportInfo: {
    fileName: string
    importDate: string
  } | null
  setLastImportInfo: (
    info: { fileName: string; importDate: string } | null,
  ) => void
  isCalDAVLoading: boolean
  setIsCalDAVLoading: (loading: boolean) => void
  calDAVCredentials: {
    username: string
    password: string
  }
  setCalDAVCredentials: (credentials: {
    username: string
    password: string
  }) => void
  showCalDAVForm: boolean
  setShowCalDAVForm: (show: boolean) => void
}

export function ImportControls({
  events,
  setEvents,
  lastImportInfo,
  setLastImportInfo,
  isCalDAVLoading,
  setIsCalDAVLoading,
  calDAVCredentials,
  setCalDAVCredentials,
  showCalDAVForm,
  setShowCalDAVForm,
}: ImportControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsedEvents = parseICSFile(text, new Date().getFullYear())

      setEvents([...events, ...parsedEvents])

      const importInfo = {
        fileName: file.name,
        importDate: new Date().toLocaleString(),
      }
      setLastImportInfo(importInfo)

      // Save to localStorage
      saveEventsToStorage([...events, ...parsedEvents], file.name)
      localStorage.setItem(
        'linear-calendar-import-info',
        JSON.stringify(importInfo),
      )

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error parsing ICS file:', error)
      alert('Error parsing calendar file. Please check the file format.')
    }
  }

  const clearAllEvents = () => {
    if (confirm('Are you sure you want to clear all events?')) {
      setEvents([])
      setLastImportInfo(null)
      localStorage.removeItem('linear-calendar-events')
      localStorage.removeItem('linear-calendar-import-info')
    }
  }

  const handleCalDAVConnect = async () => {
    if (!calDAVCredentials.username || !calDAVCredentials.password) {
      alert('Please enter both username and password')
      return
    }

    setIsCalDAVLoading(true)
    try {
      const calDAVEvents = await importFromCalDAV({
        username: calDAVCredentials.username,
        password: calDAVCredentials.password,
        serverUrl: 'https://caldav.icloud.com', // Default to iCloud
      })

      setEvents([...events, ...calDAVEvents])

      const importInfo = {
        fileName: 'CalDAV Import',
        importDate: new Date().toLocaleString(),
      }
      setLastImportInfo(importInfo)

      // Save credentials and events
      localStorage.setItem(
        'linear-calendar-caldav-credentials',
        JSON.stringify(calDAVCredentials),
      )
      saveEventsToStorage([...events, ...calDAVEvents], 'CalDAV Import')
      localStorage.setItem(
        'linear-calendar-import-info',
        JSON.stringify(importInfo),
      )

      setShowCalDAVForm(false)
    } catch (error) {
      console.error('CalDAV connection error:', error)
      alert(
        'Failed to connect to CalDAV server. Please check your credentials.',
      )
    } finally {
      setIsCalDAVLoading(false)
    }
  }

  return (
    <div className="import-section">
      <div className="import-controls">
        <div className="import-group">
          <h3>🔗 Live Calendar Import</h3>
          <button
            onClick={() => setShowCalDAVForm(!showCalDAVForm)}
            className="connect-button"
          >
            Connect to Apple Calendar
          </button>

          {showCalDAVForm && (
            <div className="caldav-form">
              <input
                type="text"
                placeholder="Username/Email"
                value={calDAVCredentials.username}
                onChange={(e) =>
                  setCalDAVCredentials({
                    ...calDAVCredentials,
                    username: e.target.value,
                  })
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={calDAVCredentials.password}
                onChange={(e) =>
                  setCalDAVCredentials({
                    ...calDAVCredentials,
                    password: e.target.value,
                  })
                }
              />
              <button
                onClick={handleCalDAVConnect}
                disabled={isCalDAVLoading}
                className="import-button"
              >
                {isCalDAVLoading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          )}
        </div>

        <div className="import-group">
          <h3>📁 File Import</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics"
            onChange={handleFileImport}
            style={{ display: 'none' }}
            id="ics-upload"
          />
          <label htmlFor="ics-upload" className="file-input-label">
            Choose .ics File
          </label>
        </div>

        {events.length > 0 && (
          <button onClick={clearAllEvents} className="clear-button">
            Clear All Events
          </button>
        )}

        {lastImportInfo && (
          <div className="import-info">
            Last import: {lastImportInfo.fileName} on{' '}
            {lastImportInfo.importDate}
          </div>
        )}
      </div>
    </div>
  )
}
