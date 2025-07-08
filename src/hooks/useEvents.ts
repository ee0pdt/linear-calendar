import { useEffect, useState } from 'react'
import {
  clearStoredData,
  loadEventsFromStorage,
  loadImportInfoFromStorage,
  saveEventsToStorage,
} from '../utils/storageUtils'
import { caldavService, generateEventId } from '../utils/caldavService'
import type { CalendarEvent, ImportInfo } from '../types'

export function useEvents() {
  const [events, setEvents] = useState<Array<CalendarEvent>>([])
  const [lastImportInfo, setLastImportInfo] = useState<ImportInfo | null>(null)

  // Load stored data on component mount
  useEffect(() => {
    const storedEvents = loadEventsFromStorage()
    setEvents(storedEvents)

    const importInfo = loadImportInfoFromStorage()
    if (importInfo) {
      setLastImportInfo(importInfo)
    }
  }, [])

  // Enhanced setter that also saves to storage
  const updateEvents = (newEvents: Array<CalendarEvent>, fileName: string) => {
    setEvents(newEvents)
    saveEventsToStorage(newEvents, fileName)
  }

  // Enhanced setter that also saves to storage
  const updateImportInfo = (info: ImportInfo | null) => {
    setLastImportInfo(info)
  }

  // Update a single event by replacing the original with the updated version
  const updateEvent = async (originalEvent: CalendarEvent, updatedEvent: CalendarEvent) => {
    console.log('Updating event:', { originalEvent, updatedEvent })
    
    // Ensure the updated event has an ID
    const eventWithId = { ...updatedEvent, id: updatedEvent.id || generateEventId(originalEvent) }
    
    // Try to sync with CalDAV if credentials are available
    let syncError: string | null = null
    if (caldavService.hasCredentials()) {
      try {
        const eventId = originalEvent.id || generateEventId(originalEvent)
        const result = await caldavService.updateEvent(eventId, eventWithId)
        if (!result.success) {
          syncError = result.error || 'Failed to sync with calendar server'
          console.warn('CalDAV sync failed:', syncError)
        } else {
          console.log('Successfully synced event update to CalDAV')
        }
      } catch (error) {
        syncError = error instanceof Error ? error.message : 'Unknown sync error'
        console.warn('CalDAV sync error:', syncError)
      }
    }
    
    // Update local state regardless of sync status
    const updatedEvents = events.map((event, index) => {
      // Find the original event by reference or by exact match
      const isReferenceMatch = event === originalEvent
      const isTitleMatch = event.title === originalEvent.title
      const isStartMatch = event.start.getTime() === originalEvent.start.getTime()
      const isAllDayMatch = event.allDay === originalEvent.allDay
      
      console.log(`Event ${index}:`, {
        title: event.title,
        originalTitle: originalEvent.title,
        isReferenceMatch,
        isTitleMatch,
        isStartMatch,
        isAllDayMatch
      })
      
      if (isReferenceMatch || (isTitleMatch && isStartMatch && isAllDayMatch)) {
        console.log('Found matching event, replacing with:', eventWithId)
        return eventWithId
      }
      return event
    })
    
    console.log('Updated events array:', updatedEvents)
    console.log('Original events array length:', events.length)
    console.log('Updated events array length:', updatedEvents.length)
    
    // Force React to detect the change by creating a completely new array
    const newEventsArray = [...updatedEvents]
    setEvents(newEventsArray)
    saveEventsToStorage(newEventsArray, lastImportInfo?.fileName || 'events')
    
    // Show sync error if any
    if (syncError) {
      // You might want to show a toast notification here
      console.error('Event updated locally but CalDAV sync failed:', syncError)
    }
  }

  // Delete a single event
  const deleteEvent = async (eventToDelete: CalendarEvent) => {
    console.log('Deleting event:', eventToDelete)
    
    // Try to sync with CalDAV if credentials are available
    let syncError: string | null = null
    if (caldavService.hasCredentials()) {
      try {
        const eventId = eventToDelete.id || generateEventId(eventToDelete)
        const result = await caldavService.deleteEvent(eventId)
        if (!result.success) {
          syncError = result.error || 'Failed to delete from calendar server'
          console.warn('CalDAV delete failed:', syncError)
        } else {
          console.log('Successfully deleted event from CalDAV')
        }
      } catch (error) {
        syncError = error instanceof Error ? error.message : 'Unknown delete error'
        console.warn('CalDAV delete error:', syncError)
      }
    }
    
    // Delete from local state regardless of sync status
    const filteredEvents = events.filter((event) => {
      // Simple comparison based on title and start time
      return !(
        event.title === eventToDelete.title &&
        event.start.getTime() === eventToDelete.start.getTime()
      )
    })
    
    setEvents(filteredEvents)
    saveEventsToStorage(filteredEvents, lastImportInfo?.fileName || 'events')
    
    // Show sync error if any
    if (syncError) {
      console.error('Event deleted locally but CalDAV sync failed:', syncError)
    }
  }

  // Clear all events and import info
  const clearAllData = () => {
    setEvents([])
    setLastImportInfo(null)
    clearStoredData()
  }

  return {
    events,
    setEvents: updateEvents,
    updateEvent,
    deleteEvent,
    lastImportInfo,
    setLastImportInfo: updateImportInfo,
    clearAllData,
  }
}
