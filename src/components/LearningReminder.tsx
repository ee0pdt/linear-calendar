import { useState } from 'react'
import type { LearningReminder } from '../types'

interface LearningReminderProps {
  reminder: LearningReminder
  onEdit?: (reminder: LearningReminder) => void
  onDelete?: (id: string) => void
  compact?: boolean
}

export function LearningReminderComponent({
  reminder,
  onEdit,
  onDelete,
  compact = false,
}: LearningReminderProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClick = () => {
    if (reminder.externalLink) {
      window.open(reminder.externalLink, '_blank', 'noopener,noreferrer')
    } else if (reminder.fullContent) {
      setIsExpanded(!isExpanded)
    }
  }

  const getReminderStyle = () => {
    const baseClasses = compact
      ? 'inline-block px-2 py-1 rounded-full text-xs cursor-pointer transition-all'
      : 'block p-3 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md'
    
    return `${baseClasses} border-l-4`
  }

  const getColorClasses = () => {
    const colorMap = {
      blue: compact 
        ? 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-l-blue-500'
        : 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-l-blue-500',
      green: compact
        ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 border-l-green-500'
        : 'bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-100 border-l-green-500',
      purple: compact
        ? 'bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-100 border-l-purple-500'
        : 'bg-purple-50 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-l-purple-500',
      orange: compact
        ? 'bg-orange-50 dark:bg-orange-900 text-orange-800 dark:text-orange-100 border-l-orange-500'
        : 'bg-orange-50 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-l-orange-500',
      red: compact
        ? 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 border-l-red-500'
        : 'bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-100 border-l-red-500',
    }
    return colorMap[reminder.color as keyof typeof colorMap] || colorMap.blue
  }

  if (compact) {
    return (
      <span
        className={`${getReminderStyle()} ${getColorClasses()}`}
        onClick={handleClick}
        title={`${reminder.title}: ${reminder.snippet}${reminder.externalLink ? ' (Click to open link)' : ''}`}
      >
        💡 {reminder.title}
        {reminder.externalLink && (
          <span className="ml-1 text-xs">🔗</span>
        )}
      </span>
    )
  }

  return (
    <div className={`${getReminderStyle()} ${getColorClasses()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1" onClick={handleClick}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💡</span>
            <h3 className="font-semibold text-sm">{reminder.title}</h3>
            {reminder.externalLink && (
              <span className="text-xs opacity-75">🔗</span>
            )}
          </div>
          <p className="text-xs opacity-90 mb-2">{reminder.snippet}</p>
          {reminder.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {reminder.tags.map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 ml-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(reminder)
                }}
                className="text-xs opacity-50 hover:opacity-100 px-1"
                title="Edit reminder"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(reminder.id)
                }}
                className="text-xs opacity-50 hover:opacity-100 px-1"
                title="Delete reminder"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
      
      {isExpanded && reminder.fullContent && (
        <div className="mt-3 pt-3 border-t border-black border-opacity-10 dark:border-white dark:border-opacity-10">
          <div className="text-xs whitespace-pre-wrap">{reminder.fullContent}</div>
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-2 text-xs opacity-75 hover:opacity-100 underline"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  )
}