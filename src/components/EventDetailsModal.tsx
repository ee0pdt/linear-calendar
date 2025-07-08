import { useState } from 'react'
import { X, Calendar, Clock, Repeat, Edit3, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '../types'
import { getEventEmoji } from '../utils/emojiUtils'

interface EventDetailsModalProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (event: CalendarEvent) => void
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: EventDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!isOpen || !event) return null

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) {
      if (
        event.end &&
        event.end.toDateString() !== event.start.toDateString()
      ) {
        return `${event.start.toLocaleDateString()} - ${event.end.toLocaleDateString()}`
      }
      return 'All day'
    }

    const startTime = event.start.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })

    if (event.end) {
      const endTime = event.end.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })

      if (event.end.toDateString() === event.start.toDateString()) {
        return `${startTime} - ${endTime}`
      } else {
        return `${event.start.toLocaleDateString()} ${startTime} - ${event.end.toLocaleDateString()} ${endTime}`
      }
    }

    return startTime
  }

  const formatEventDate = (event: CalendarEvent) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return event.start.toLocaleDateString(undefined, options)
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(event)
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const emoji = getEventEmoji(event.title)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{emoji}</span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Event Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Event Details */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {event.title}
            </h3>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-3">
            <Calendar className="text-gray-400" size={20} />
            <span className="text-gray-700 dark:text-gray-300">
              {formatEventDate(event)}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center space-x-3">
            <Clock className="text-gray-400" size={20} />
            <span className="text-gray-700 dark:text-gray-300">
              {formatEventTime(event)}
            </span>
          </div>

          {/* Recurring indicator */}
          {event.isRecurring && (
            <div className="flex items-center space-x-3">
              <Repeat className="text-gray-400" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Recurring event
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 size={16} />
            <span>Edit</span>
          </button>

          <button
            onClick={handleDelete}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showDeleteConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Trash2 size={16} />
            <span>{showDeleteConfirm ? 'Confirm Delete' : 'Delete'}</span>
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="px-6 pb-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              Click "Confirm Delete" again to permanently delete this event.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
