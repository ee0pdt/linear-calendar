import {
  CALDAV_CREDENTIALS_KEY,
  IMPORT_INFO_KEY,
  REMINDERS_STORAGE_KEY,
  STORAGE_KEY,
} from '../constants'
import type { CalDAVCredentials, CalendarEvent, ImportInfo, LearningReminder } from '../types'

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
  localStorage.removeItem(CALDAV_CREDENTIALS_KEY)
}

export type ThemePreference = 'light' | 'dark' | 'system'

const THEME_KEY = 'linear-calendar-theme-preference'

export function getStoredThemePreference(): ThemePreference {
  const pref = localStorage.getItem(THEME_KEY)
  if (pref === 'light' || pref === 'dark' || pref === 'system') return pref
  return 'system'
}

export function setStoredThemePreference(pref: ThemePreference) {
  localStorage.setItem(THEME_KEY, pref)
}

/**
 * Saves CalDAV credentials to localStorage
 */
export const saveCalDAVCredentials = (credentials: CalDAVCredentials): void => {
  try {
    localStorage.setItem(CALDAV_CREDENTIALS_KEY, JSON.stringify(credentials))
  } catch (error) {
    console.error('Error saving CalDAV credentials:', error)
    throw new Error('Unable to save CalDAV credentials')
  }
}

/**
 * Loads CalDAV credentials from localStorage
 */
export const loadCalDAVCredentials = (): CalDAVCredentials | null => {
  try {
    const credentials = localStorage.getItem(CALDAV_CREDENTIALS_KEY)
    return credentials ? JSON.parse(credentials) : null
  } catch (error) {
    console.error('Error loading CalDAV credentials:', error)
    localStorage.removeItem(CALDAV_CREDENTIALS_KEY)
    return null
  }
}

/**
 * Clears CalDAV credentials from localStorage
 */
export const clearCalDAVCredentials = (): void => {
  localStorage.removeItem(CALDAV_CREDENTIALS_KEY)
}

/**
 * Saves learning reminders to localStorage
 */
export const saveRemindersToStorage = (reminders: Array<LearningReminder>): void => {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders))
  } catch (error) {
    console.error('Error saving reminders to localStorage:', error)
    throw new Error('Unable to save learning reminders. Your browser storage may be full.')
  }
}

/**
 * Loads learning reminders from localStorage
 */
export const loadRemindersFromStorage = (): Array<LearningReminder> => {
  const savedReminders = localStorage.getItem(REMINDERS_STORAGE_KEY)
  if (!savedReminders) return []

  try {
    const parsedReminders = JSON.parse(savedReminders).map((reminder: any) => ({
      ...reminder,
      dateCreated: new Date(reminder.dateCreated),
      dateToShow: reminder.dateToShow ? new Date(reminder.dateToShow) : undefined,
    }))
    return parsedReminders
  } catch (error) {
    console.error('Error loading saved reminders:', error)
    localStorage.removeItem(REMINDERS_STORAGE_KEY)
    return []
  }
}

/**
 * Clears all learning reminders from localStorage
 */
export const clearRemindersFromStorage = (): void => {
  localStorage.removeItem(REMINDERS_STORAGE_KEY)
}
