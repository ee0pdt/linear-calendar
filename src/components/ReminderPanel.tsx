import { useState } from 'react'
import { LearningReminderComponent } from './LearningReminder'
import { ReminderForm } from './ReminderForm'
import { useReminders } from '../hooks/useReminders'
import type { LearningReminder } from '../types'

interface ReminderPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ReminderPanel({ isOpen, onClose }: ReminderPanelProps) {
  const { reminders, addReminder, updateReminder, deleteReminder } = useReminders()
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<LearningReminder | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active')

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'archived') return reminder.isArchived
    if (filter === 'active') return !reminder.isArchived
    return true
  })

  const handleSave = (reminderData: Omit<LearningReminder, 'id' | 'dateCreated'>) => {
    if (editingReminder) {
      updateReminder(editingReminder.id, reminderData)
    } else {
      addReminder(reminderData)
    }
    setShowForm(false)
    setEditingReminder(null)
  }

  const handleEdit = (reminder: LearningReminder) => {
    setEditingReminder(reminder)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder(id)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingReminder(null)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Learning Reminders
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Add Reminder
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'archived')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {filter === 'active' ? 'No active reminders yet.' : 'No reminders found.'}
                <br />
                <button
                  onClick={() => setShowForm(true)}
                  className="text-blue-600 dark:text-blue-400 underline mt-2"
                >
                  Add your first reminder
                </button>
              </div>
            ) : (
              filteredReminders.map(reminder => (
                <LearningReminderComponent
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {filteredReminders.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {filteredReminders.length} reminder{filteredReminders.length !== 1 ? 's' : ''} shown
              </p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ReminderForm
          reminder={editingReminder || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}