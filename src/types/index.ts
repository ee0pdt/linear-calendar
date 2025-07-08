// Event Types
export interface CalendarEvent {
  id?: string
  title: string
  start: Date
  end?: Date
  allDay: boolean
  isRecurring?: boolean
  rrule?: string
  calendarUrl?: string // CalDAV calendar URL for syncing
  calendarName?: string // Display name of the calendar
}

// Import Information
export interface ImportInfo {
  fileName: string
  eventCount: number
  importDate: string
  type: 'file' | 'caldav'
}

// Utility Types
export interface DayInfo {
  date: Date
  isToday: boolean
  isPast: boolean
  isFirstOfMonth: boolean
  isWeekend: boolean
  events: Array<CalendarEvent>
}

// UI State Types
export interface UIState {
  expandedMonths: Set<string>
  showAllMonths: boolean
  loading: boolean
  error: string | null
}

// CalDAV Types
export interface CalDAVCredentials {
  username: string
  password: string
  serverUrl: string
}
