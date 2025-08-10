import { useRef } from 'react'
import { AutoRefreshIndicator } from './AutoRefreshIndicator'
import { parseICSFile } from '../utils/icsParser'
import type { CalendarEvent } from '../types'

interface HeaderProps {
  onImportICS: (events: CalendarEvent[], importDetails?: { filename?: string }) => void
  onCalDAVConnect: (credentials: { appleId: string; appPassword: string; timezone?: string }) => Promise<void>
  onClearData: () => void
  events: CalendarEvent[]
  isCalDAVLoading: boolean
  autoRefreshEnabled: boolean
  setAutoRefreshEnabled: (enabled: boolean) => void
  autoRefreshInterval: number
  setAutoRefreshInterval: (interval: number) => void
  lastRefreshTime: Date | null
}

export function Header({
  onImportICS,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
  autoRefreshInterval,
  setAutoRefreshInterval,
  lastRefreshTime,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const currentYear = new Date().getFullYear()
      const parsedEvents = parseICSFile(text, currentYear - 1, currentYear + 1)
      onImportICS(parsedEvents, { filename: file.name })
    } catch (error) {
      console.error('Error parsing ICS file:', error)
    }
  }

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* File upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Import ICS
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>

        {/* Auto-refresh indicator */}
        <AutoRefreshIndicator
          enabled={autoRefreshEnabled}
          onToggle={setAutoRefreshEnabled}
          interval={autoRefreshInterval}
          onIntervalChange={setAutoRefreshInterval}
          lastRefreshTime={lastRefreshTime}
        />
      </div>
    </div>
  )
}