import { useRef } from 'react'
import { useCalDAVImport } from '../hooks/useCalDAVImport'
import { parseICSFile } from '../utils/icsParser'
import { saveEventsToStorage } from '../utils/storageUtils'
import type { CalendarEvent, ImportInfo } from '../types'

interface ImportControlsProps {
  events: Array<CalendarEvent>
  setEvents: (events: Array<CalendarEvent>, fileName: string) => void
  lastImportInfo: ImportInfo | null
  setLastImportInfo: (info: ImportInfo | null) => void
}

export function ImportControls({
  events,
  setEvents,
  lastImportInfo,
  setLastImportInfo,
}: ImportControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use CalDAV hook
  const {
    isCalDAVLoading,
    calDAVCredentials,
    setCalDAVCredentials,
    showCalDAVForm,
    setShowCalDAVForm,
    handleCalDAVImport,
  } = useCalDAVImport()

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsedEvents = parseICSFile(text, new Date().getFullYear())

      setEvents([...events, ...parsedEvents], file.name)

      const importInfo: ImportInfo = {
        fileName: file.name,
        eventCount: parsedEvents.length,
        importDate: new Date().toLocaleString(),
        type: 'file',
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
      setEvents([], 'Clear All')
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

    await handleCalDAVImport(
      (calDAVEvents) => {
        const allEvents = [...events, ...calDAVEvents]
        setEvents(allEvents, 'CalDAV Import')

        const importInfo: ImportInfo = {
          fileName: 'CalDAV Import',
          eventCount: calDAVEvents.length,
          importDate: new Date().toLocaleString(),
          type: 'caldav',
        }
        setLastImportInfo(importInfo)

        // Save credentials and events
        localStorage.setItem(
          'linear-calendar-caldav-credentials',
          JSON.stringify(calDAVCredentials),
        )
        saveEventsToStorage(allEvents, 'CalDAV Import')
        localStorage.setItem(
          'linear-calendar-import-info',
          JSON.stringify(importInfo),
        )
      },
      (error) => {
        console.error('CalDAV connection error:', error)
        alert(
          'Failed to connect to CalDAV server. Please check your credentials.',
        )
      },
    )
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
