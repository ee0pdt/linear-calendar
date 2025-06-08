// Storage Keys
export const STORAGE_KEY = 'linear-calendar-events'
export const IMPORT_INFO_KEY = 'linear-calendar-import-info'

// Date Constants
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

// UI Constants
export const SCROLL_BEHAVIOR: ScrollBehavior = 'smooth'
export const BLOCK_POSITION: ScrollLogicalPosition = 'center'

// CalDAV Proxy
export const PROXY_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : 'https://caldev-proxy-production.up.railway.app'

// Current Year
export const CURRENT_YEAR = new Date().getFullYear()

// Timezone Configuration
export const DEFAULT_TIMEZONE = 'Europe/London'
export const TIMEZONE_STORAGE_KEY = 'linear-calendar-timezone'

// Available timezones for the UI selector
export const AVAILABLE_TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC' },
] as const
