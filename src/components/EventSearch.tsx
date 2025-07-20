import { memo, useMemo, useState } from 'react'
import { Info, Search, X } from 'lucide-react'
import type { CalendarEvent } from '../types'

interface EventSearchProps {
  events: Array<CalendarEvent>
  onEventClick: (event: CalendarEvent) => void
  onScrollToEvent: (event: CalendarEvent) => void
  isVisible: boolean
  onClose: () => void
}

export const EventSearch = memo(function EventSearch({
  events,
  onEventClick,
  onScrollToEvent,
  isVisible,
  onClose,
}: EventSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return []
    
    const term = searchTerm.toLowerCase()
    return events
      .filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 50) // Limit to 50 results for performance
  }, [events, searchTerm])

  const formatEventDate = (date: Date, allDay: boolean) => {
    if (allDay) {
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
          {part}
        </mark>
      ) : part
    )
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black opacity-30 dark:bg-black dark:opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden text-gray-900 dark:text-gray-100 z-10 mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Search Events
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {searchTerm.trim() && (
            <div className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              {filteredEvents.length === 0 
                ? 'No events found'
                : `${filteredEvents.length} event${filteredEvents.length === 1 ? '' : 's'} found${filteredEvents.length === 50 ? ' (showing first 50)' : ''}`
              }
            </div>
          )}
          
          {filteredEvents.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredEvents.map((event, index) => (
                <div
                  key={`${event.uid || event.title}-${event.start.getTime()}-${index}`}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => {
                    onScrollToEvent(event)
                    onClose()
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {highlightSearchTerm(event.title)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatEventDate(event.start, event.allDay)}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 truncate">
                          📍 {highlightSearchTerm(event.location)}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                          {highlightSearchTerm(event.description.substring(0, 100))}
                          {event.description.length > 100 && '...'}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {event.isRecurring ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                          Recurring
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100">
                          ★ One-time
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                          onClose()
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
                        title="View event details"
                        aria-label="View event details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {searchTerm.trim() === '' && (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search through your events</p>
              <p className="text-sm mt-2">Search by title, description, or location</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})