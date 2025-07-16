import { useState, useEffect } from 'react'
import type { LearningReminder } from '../types'
import {
  loadRemindersFromStorage,
  saveRemindersToStorage,
  clearRemindersFromStorage,
} from '../utils/storageUtils'

export function useReminders() {
  const [reminders, setReminders] = useState<Array<LearningReminder>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadedReminders = loadRemindersFromStorage()
    setReminders(loadedReminders)
    setLoading(false)
  }, [])

  const saveReminders = (newReminders: Array<LearningReminder>) => {
    setReminders(newReminders)
    saveRemindersToStorage(newReminders)
  }

  const addReminder = (reminder: Omit<LearningReminder, 'id' | 'dateCreated'>) => {
    const newReminder: LearningReminder = {
      ...reminder,
      id: crypto.randomUUID(),
      dateCreated: new Date(),
    }
    const updatedReminders = [...reminders, newReminder]
    saveReminders(updatedReminders)
    return newReminder
  }

  const updateReminder = (id: string, updates: Partial<LearningReminder>) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, ...updates } : reminder
    )
    saveReminders(updatedReminders)
  }

  const deleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id)
    saveReminders(updatedReminders)
  }

  const getRemindersForDate = (date: Date): Array<LearningReminder> => {
    return reminders.filter(reminder => {
      if (reminder.isArchived) return false
      
      // If no specific date is set, show on any day
      if (!reminder.dateToShow) return true
      
      // Show on the specific date
      const reminderDate = new Date(reminder.dateToShow)
      return (
        reminderDate.getFullYear() === date.getFullYear() &&
        reminderDate.getMonth() === date.getMonth() &&
        reminderDate.getDate() === date.getDate()
      )
    })
  }

  const getTodaysReminders = (): Array<LearningReminder> => {
    return getRemindersForDate(new Date())
  }

  const clearAllReminders = () => {
    setReminders([])
    clearRemindersFromStorage()
  }

  return {
    reminders,
    loading,
    addReminder,
    updateReminder,
    deleteReminder,
    getRemindersForDate,
    getTodaysReminders,
    clearAllReminders,
  }
}