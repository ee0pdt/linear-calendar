import { useState, useEffect } from 'react'
import { X, Save, Calendar, Clock } from 'lucide-react'
import type { CalendarEvent } from '../types'

interface EventEditModalProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
}

export function EventEditModal({
  event,
  isOpen,
  onClose,
  onSave,
}: EventEditModalProps) {
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      console.log('EventEditModal: Setting form data for event:', event)
      setTitle(event.title)
      setAllDay(event.allDay)
      setIsRecurring(event.isRecurring || false)

      // Format start date and time
      const startDateStr = event.start.toISOString().split('T')[0]
      setStartDate(startDateStr)

      if (!event.allDay) {
        const startTimeStr = event.start.toTimeString().slice(0, 5)
        setStartTime(startTimeStr)
      } else {
        setStartTime('09:00')
      }

      // Format end date and time
      if (event.end) {
        const endDateStr = event.end.toISOString().split('T')[0]
        setEndDate(endDateStr)

        if (!event.allDay) {
          const endTimeStr = event.end.toTimeString().slice(0, 5)
          setEndTime(endTimeStr)
        } else {
          setEndTime('10:00')
        }
      } else {
        setEndDate(startDateStr)
        setEndTime('10:00')
      }
    }
  }, [event])

  const handleSave = () => {
    console.log('EventEditModal handleSave called')
    if (!title.trim() || !event) return

    let startDateTime: Date
    let endDateTime: Date | undefined

    if (allDay) {
      // For all-day events, use midnight UTC
      startDateTime = new Date(`${startDate}T00:00:00.000Z`)
      if (endDate) {
        endDateTime = new Date(`${endDate}T23:59:59.999Z`)
      }
    } else {
      // For timed events, combine date and time
      startDateTime = new Date(`${startDate}T${startTime}:00`)
      if (endDate && endTime) {
        endDateTime = new Date(`${endDate}T${endTime}:00`)
      }
    }

    const updatedEvent: CalendarEvent = {
      ...event,
      title: title.trim(),
      start: startDateTime,
      end: endDateTime,
      allDay,
      isRecurring,
    }

    console.log('EventEditModal calling onSave with:', updatedEvent)
    onSave(updatedEvent)
    onClose()
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Edit Event
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter event title..."
              autoFocus
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="allDay"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              All day event
            </label>
          </div>

          {/* Start Date/Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="inline w-4 h-4 mr-1" />
              Start
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {!allDay && (
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
          </div>

          {/* End Date/Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <Clock className="inline w-4 h-4 mr-1" />
              End
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {!allDay && (
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="isRecurring"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Recurring event
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  )
}
