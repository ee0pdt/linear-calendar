export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  notes?: string;
  calendarId?: string;
}

export interface CalendarEventRaw {
  id: string;
  title: string;
  startDate: string | Date;
  endDate: string | Date;
  allDay?: boolean;
  location?: string;
  notes?: string;
  calendarId?: string;
}

export interface CalendarInfo {
  id: string;
  title: string;
  color: string;
  isPrimary?: boolean;
  source?: {
    name: string;
    type: string;
  };
}

export interface CalendarPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}