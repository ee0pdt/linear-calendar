import { useState } from 'react'
import type { LearningReminder } from '../types'

interface ReminderFormProps {
  reminder?: LearningReminder
  onSave: (reminder: Omit<LearningReminder, 'id' | 'dateCreated'>) => void
  onCancel: () => void
}

const REMINDER_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
]

const REMINDER_CATEGORIES = [
  'ADHD Strategies',
  'Mental Models',
  'Productivity',
  'Learning',
  'Personal Development',
  'Health & Wellness',
  'Relationships',
  'Work Skills',
  'Other'
]

export function ReminderForm({ reminder, onSave, onCancel }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    snippet: reminder?.snippet || '',
    fullContent: reminder?.fullContent || '',
    externalLink: reminder?.externalLink || '',
    tags: reminder?.tags || [],
    category: reminder?.category || 'ADHD Strategies',
    color: reminder?.color || 'blue',
    dateToShow: reminder?.dateToShow ? reminder.dateToShow.toISOString().split('T')[0] : '',
    isArchived: reminder?.isArchived || false,
  })

  const [newTag, setNewTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.snippet.trim()) return

    onSave({
      title: formData.title.trim(),
      snippet: formData.snippet.trim(),
      fullContent: formData.fullContent.trim() || undefined,
      externalLink: formData.externalLink.trim() || undefined,
      tags: formData.tags,
      category: formData.category,
      color: formData.color,
      dateToShow: formData.dateToShow ? new Date(formData.dateToShow) : undefined,
      isArchived: formData.isArchived,
    })
  }

  const addTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }))
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {reminder ? 'Edit' : 'Add'} Learning Reminder
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Pomodoro Technique"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short snippet *
              </label>
              <textarea
                value={formData.snippet}
                onChange={(e) => setFormData(prev => ({ ...prev, snippet: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-20"
                placeholder="Brief reminder of the key insight..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full content (optional)
              </label>
              <textarea
                value={formData.fullContent}
                onChange={(e) => setFormData(prev => ({ ...prev, fullContent: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-32"
                placeholder="Detailed explanation, steps, examples..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                External link (optional)
              </label>
              <input
                type="url"
                value={formData.externalLink}
                onChange={(e) => setFormData(prev => ({ ...prev, externalLink: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {REMINDER_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                {REMINDER_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 ${color.class} ${
                      formData.color === color.value ? 'border-gray-800 dark:border-gray-200' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Show on specific date (optional)
              </label>
              <input
                type="date"
                value={formData.dateToShow}
                onChange={(e) => setFormData(prev => ({ ...prev, dateToShow: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave blank to show every day
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={!formData.title.trim() || !formData.snippet.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reminder ? 'Update' : 'Add'} Reminder
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}