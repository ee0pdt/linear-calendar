import { useState, useEffect, useCallback } from 'react';
import * as Calendar from 'expo-calendar';
import { CalendarEvent, CalendarEventRaw, CalendarInfo, CalendarPermissionStatus } from '@/types/Event';

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  calendars: CalendarInfo[];
  loading: boolean;
  error: string | null;
  permissionStatus: CalendarPermissionStatus | null;
  reload: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

export const useCalendarEvents = (): UseCalendarEventsReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<CalendarPermissionStatus | null>(null);

  const transformEvent = (event: CalendarEventRaw, index: number): CalendarEvent => ({
    id: event.id ? `${event.id}-${index}` : `event-${index}`, // Ensure unique IDs
    title: event.title || 'Untitled Event',
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
    allDay: event.allDay || false,
    location: event.location || undefined,
    notes: event.notes || undefined,
    calendarId: event.calendarId || undefined,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      const permissionResult: CalendarPermissionStatus = {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status as 'granted' | 'denied' | 'undetermined',
      };
      
      setPermissionStatus(permissionResult);
      
      if (status !== 'granted') {
        setError(`Calendar permission ${status}. Please enable calendar access in Settings.`);
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Permission request failed';
      setError(errorMsg);
      return false;
    }
  }, []);

  const loadCalendars = useCallback(async (): Promise<CalendarInfo[]> => {
    try {
      const rawCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      const transformedCalendars: CalendarInfo[] = rawCalendars.map(cal => ({
        id: cal.id,
        title: cal.title || 'Untitled Calendar',
        color: cal.color || '#007AFF',
        isPrimary: cal.isPrimary,
        source: cal.source ? {
          name: cal.source.name || 'Unknown',
          type: cal.source.type || 'unknown',
        } : undefined,
      }));
      
      setCalendars(transformedCalendars);
      return transformedCalendars;
    } catch (err) {
      throw new Error(`Failed to load calendars: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const loadEvents = useCallback(async (calendarIds: string[]): Promise<CalendarEvent[]> => {
    if (calendarIds.length === 0) {
      return [];
    }

    try {
      // Load events for the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      const rawEvents = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
      
      const transformedEvents = rawEvents.map((event, index) => transformEvent(event, index));
      
      // Sort events by start date
      transformedEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      return transformedEvents;
    } catch (err) {
      throw new Error(`Failed to load events: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Check/request permissions
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return;
      }

      // Load calendars
      const loadedCalendars = await loadCalendars();
      
      if (loadedCalendars.length === 0) {
        setError('No calendars found. Please set up calendars in the iOS Calendar app.');
        setEvents([]);
        return;
      }

      // Load events from all calendars
      const calendarIds = loadedCalendars.map(cal => cal.id);
      const loadedEvents = await loadEvents(calendarIds);
      
      setEvents(loadedEvents);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load calendar data';
      setError(errorMsg);
      console.error('Calendar loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [requestPermission, loadCalendars, loadEvents]);

  // Auto-load on mount
  useEffect(() => {
    reload();
  }, [reload]);

  return {
    events,
    calendars,
    loading,
    error,
    permissionStatus,
    reload,
    requestPermission,
  };
};