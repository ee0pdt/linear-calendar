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
    : 'https://caldav-proxy-production.up.railway.app'

// Current Year
export const CURRENT_YEAR = new Date().getFullYear()
