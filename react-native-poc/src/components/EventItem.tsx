import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarEvent } from '@/types/Event';

interface EventItemProps {
  event: CalendarEvent;
  onPress?: (event: CalendarEvent) => void;
}

export const EventItem: React.FC<EventItemProps> = React.memo(({ event, onPress }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const now = new Date();
    return date < now;
  };

  const handlePress = () => {
    onPress?.(event);
  };

  const dateStyle = [
    styles.dateText,
    isToday(event.startDate) && styles.todayDate,
    isPast(event.endDate) && styles.pastDate,
  ];

  const containerStyle = [
    styles.container,
    isPast(event.endDate) && styles.pastContainer,
  ];

  return (
    <TouchableOpacity 
      style={containerStyle} 
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.dateColumn}>
        <Text style={dateStyle}>{formatDate(event.startDate)}</Text>
        {!event.allDay && (
          <Text style={styles.timeText}>{formatTime(event.startDate)}</Text>
        )}
        {event.allDay && (
          <Text style={styles.allDayText}>All Day</Text>
        )}
      </View>
      
      <View style={styles.contentColumn}>
        <Text style={styles.titleText} numberOfLines={2}>
          {event.title}
        </Text>
        
        {event.location && (
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {event.location}
          </Text>
        )}
        
        {event.notes && (
          <Text style={styles.notesText} numberOfLines={1}>
            💭 {event.notes}
          </Text>
        )}
      </View>
      
      <View style={styles.indicatorColumn}>
        <View style={[styles.indicator, isPast(event.endDate) && styles.pastIndicator]} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  pastContainer: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  dateColumn: {
    width: 70,
    marginRight: 12,
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  todayDate: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  pastDate: {
    color: '#8e8e93',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  allDayText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
    backgroundColor: '#007AFF20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  contentColumn: {
    flex: 1,
    marginRight: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 13,
    color: '#8e8e93',
    fontStyle: 'italic',
  },
  indicatorColumn: {
    width: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  pastIndicator: {
    backgroundColor: '#8e8e93',
  },
});

EventItem.displayName = 'EventItem';