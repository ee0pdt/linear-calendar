import { useRef, useState } from 'react'
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
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  const refreshEvents = async () => {
    if (!lastImportInfo || !confirm('This will clear all events and re-import from the last source. Continue?')) {
      return
    }

    setIsRefreshing(true)
    
    try {
      // Clear existing events first
      setEvents([], 'Refreshing...')
      
      if (lastImportInfo.type === 'caldav') {
        // Re-import from CalDAV
        const savedCredentials = localStorage.getItem('linear-calendar-caldav-credentials')
        if (!savedCredentials) {
          alert('CalDAV credentials not found. Please reconnect to your calendar.')
          setIsRefreshing(false)
          return
        }

        const credentials = JSON.parse(savedCredentials)
        setCalDAVCredentials(credentials)
        
        await handleCalDAVImport(
          (calDAVEvents) => {
            setEvents(calDAVEvents, 'CalDAV Refresh')
            
            const importInfo: ImportInfo = {
              fileName: 'CalDAV Refresh',
              eventCount: calDAVEvents.length,
              importDate: new Date().toLocaleString(),
              type: 'caldav',
            }
            setLastImportInfo(importInfo)
            
            saveEventsToStorage(calDAVEvents, 'CalDAV Refresh')
            localStorage.setItem('linear-calendar-import-info', JSON.stringify(importInfo))
          },
          (error) => {
            console.error('CalDAV refresh error:', error)
            alert('Failed to refresh from CalDAV server. Please check your connection.')
          },
        )
      } else {
        // File import - can't refresh automatically since we don't store the file
        alert('File imports cannot be automatically refreshed. Please re-upload your ICS file.')
      }
    } catch (error) {
      console.error('Refresh error:', error)
      alert('Failed to refresh events. Please try again.')
    } finally {
      setIsRefreshing(false)
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

        // Save events (credentials are already auto-saved by the hook)
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
    <div className="mb-6 no-print space-y-4">
      {/* Live Calendar Import */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h2 className="text-lg font-semibold mb-2 text-green-800">
          🔗 Live Calendar Import
        </h2>
        <p className="text-sm text-green-700 mb-3">
          Connect directly to your Apple Calendar for real-time updates
          (requires app-specific password).
        </p>
        {!showCalDAVForm ? (
          <button
            onClick={() => setShowCalDAVForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Connect to Apple Calendar
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Apple ID Email
              </label>
              <input
                type="email"
                value={calDAVCredentials.username}
                onChange={(e) => {
                  const newCreds = {
                    ...calDAVCredentials,
                    username: e.target.value,
                  }
                  setCalDAVCredentials(newCreds)
                }}
                placeholder="your@icloud.com"
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                App-Specific Password
              </label>
              <input
                type="password"
                value={calDAVCredentials.password}
                onChange={(e) => {
                  const newCreds = {
                    ...calDAVCredentials,
                    password: e.target.value,
                  }
                  setCalDAVCredentials(newCreds)
                }}
                placeholder="xxxx-xxxx-xxxx-xxxx"
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-green-600 mt-1">
                Generate at: appleid.apple.com → Security → App-Specific
                Passwords
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCalDAVConnect}
                disabled={isCalDAVLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isCalDAVLoading ? 'Connecting...' : 'Import Calendar'}
              </button>
              <button
                onClick={() => {
                  setShowCalDAVForm(false)
                  setCalDAVCredentials({
                    username: '',
                    password: '',
                    serverUrl: '',
                  })
                  localStorage.removeItem('linear-calendar-caldav-credentials')
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel & Forget Credentials
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Upload Import */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold mb-2 text-blue-800">
          📁 File Import
        </h2>
        <p className="text-sm text-blue-700 mb-3">
          Export your calendar as an ICS file and upload it here (one-time
          import).
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics"
          onChange={handleFileImport}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Import Status */}
      {events.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              ✅ Loaded {events.length} events from your calendar
            </p>
            {lastImportInfo && (
              <p className="text-xs text-gray-500">
                Last imported: {lastImportInfo.fileName} on{' '}
                {lastImportInfo.importDate}
              </p>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={refreshEvents}
                disabled={isRefreshing || !lastImportInfo}
                className="text-xs text-blue-600 hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline"
              >
                {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Events'}
              </button>
              <button
                onClick={clearAllEvents}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Clear stored calendar data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
