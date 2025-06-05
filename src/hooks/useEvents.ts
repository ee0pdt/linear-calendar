import { useEffect, useState } from 'react'
import {
  clearStoredData,
  loadEventsFromStorage,
  loadImportInfoFromStorage,
  saveEventsToStorage,
} from '../utils/storageUtils'
import type { CalendarEvent, ImportInfo } from '../types'

export function useEvents() {
  const [events, setEvents] = useState<Array<CalendarEvent>>([])
  const [lastImportInfo, setLastImportInfo] = useState<ImportInfo | null>(null)

  // Load stored data on component mount
  useEffect(() => {
    const storedEvents = loadEventsFromStorage()
    setEvents(storedEvents)

    const importInfo = loadImportInfoFromStorage()
    if (importInfo) {
      setLastImportInfo(importInfo)
    }
  }, [])

  // Enhanced setter that also saves to storage
  const updateEvents = (newEvents: Array<CalendarEvent>, fileName: string) => {
    setEvents(newEvents)
    saveEventsToStorage(newEvents, fileName)
  }

  // Enhanced setter that also saves to storage
  const updateImportInfo = (info: ImportInfo | null) => {
    setLastImportInfo(info)
  }

  // Clear all events and import info
  const clearAllData = () => {
    setEvents([])
    setLastImportInfo(null)
    clearStoredData()
  }

  return {
    events,
    setEvents: updateEvents,
    lastImportInfo,
    setLastImportInfo: updateImportInfo,
    clearAllData,
  }
}
