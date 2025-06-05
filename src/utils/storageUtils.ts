import { IMPORT_INFO_KEY, STORAGE_KEY } from '../constants'
import type { CalendarEvent, ImportInfo } from '../types'

/**
 * Saves events to localStorage with metadata
 */
export const saveEventsToStorage = (
  eventList: Array<CalendarEvent>,
  fileName: string,
): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventList))
    const importInfo: ImportInfo = {
      fileName,
      eventCount: eventList.length,
      importDate: new Date().toLocaleString(),
      type: fileName.startsWith('CalDAV:') ? 'caldav' : 'file',
    }
    localStorage.setItem(IMPORT_INFO_KEY, JSON.stringify(importInfo))
  } catch (error) {
    console.error('Error saving events to localStorage:', error)
    // Handle storage quota exceeded or other errors
    throw new Error(
      'Unable to save calendar data. Your browser storage may be full.',
    )
  }
}

/**
 * Loads events from localStorage
 */
export const loadEventsFromStorage = (): Array<CalendarEvent> => {
  const savedEvents = localStorage.getItem(STORAGE_KEY)
  if (!savedEvents) return []

  try {
    const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : undefined,
      isRecurring: event.isRecurring ?? false,
    }))
    return parsedEvents
  } catch (error) {
    console.error('Error loading saved events:', error)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(IMPORT_INFO_KEY)
    return []
  }
}

/**
 * Loads import info from localStorage
 */
export const loadImportInfoFromStorage = (): ImportInfo | null => {
  const savedImportInfo = localStorage.getItem(IMPORT_INFO_KEY)
  if (!savedImportInfo) return null

  try {
    return JSON.parse(savedImportInfo)
  } catch (error) {
    console.error('Error loading import info:', error)
    localStorage.removeItem(IMPORT_INFO_KEY)
    return null
  }
}

/**
 * Clears all stored calendar data
 */
export const clearStoredData = (): void => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(IMPORT_INFO_KEY)
}
