import { memo } from 'react'
import type { CalendarEvent } from '../types'

// Helper function to safely render string values that might be objects
const renderStringValue = (value: any): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    // Try various common properties from iCal objects
    const extracted =
      value.val ||
      value.value ||
      value.name ||
      value.href ||
      value.url ||
      (value.params && value.params.value) ||
      Object.values(value).find((v) => typeof v === 'string' && v.length > 0)

    // If we got a string that looks like a URL or valid content, return it
    if (typeof extracted === 'string' && extracted.length > 0) {
      return extracted
    }

    // If nothing worked and it's still an object, return empty string to hide the field
    return ''
  }
  return String(value || '')
}

// Helper function to generate map links from location
const generateMapLinks = (location: string) => {
  const encodedLocation = encodeURIComponent(location.replace(/\n/g, ' '))

  // Detect user agent for better map app selection
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isMac = /Macintosh/.test(navigator.userAgent)

  return {
    apple: `http://maps.apple.com/?q=${encodedLocation}`,
    google: `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
    defaultMap:
      isIOS || isMac
        ? `http://maps.apple.com/?q=${encodedLocation}`
        : `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
  }
}

interface EventDetailsModalProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
}

export const EventDetailsModal = memo(function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: EventDetailsModalProps) {
  if (!isOpen || !event) return null

  const formatDateTime = (date: Date, allDay: boolean) => {
    if (allDay) return 'All day'
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDuration = () => {
    if (event.allDay) return null
    if (!event.end) return null

    const durationMs = event.end.getTime() - event.start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {event.title}
            </h2>
            {event.calendar && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {event.calendar}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              When
            </h3>
            <div className="text-gray-900 dark:text-gray-100">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDateTime(event.start, event.allDay)}</span>
              </div>
              {event.end && !event.allDay && (
                <div className="flex items-center space-x-2 mt-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Until {formatDateTime(event.end, false)}</span>
                  {getDuration() && (
                    <span className="text-gray-500 dark:text-gray-400">
                      ({getDuration()})
                    </span>
                  )}
                </div>
              )}
              {event.isRecurring && (
                <div className="flex items-center space-x-2 mt-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    Recurring event
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-900 dark:text-gray-100">
                    {event.location}
                  </span>
                </div>
                {/* Map Links */}
                <div className="flex items-center space-x-4 ml-6">
                  <a
                    href={generateMapLinks(event.location).apple}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Apple Maps
                  </a>
                  <a
                    href={generateMapLinks(event.location).google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Google Maps
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </h3>
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          )}

          {/* URL */}
          {event.url && renderStringValue(event.url) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link
              </h3>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <a
                  href={renderStringValue(event.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {renderStringValue(event.url)}
                </a>
              </div>
            </div>
          )}

          {/* Organizer */}
          {event.organizer && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organizer
              </h3>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-gray-900 dark:text-gray-100">
                  {renderStringValue(event.organizer)}
                </span>
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attendees ({event.attendees.length})
              </h3>
              <div className="space-y-1">
                {event.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-gray-900 dark:text-gray-100 text-sm">
                      {renderStringValue(attendee)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event ID (for debugging/technical users) */}
          {event.uid && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Event ID
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all">
                {renderStringValue(event.uid)}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
})
