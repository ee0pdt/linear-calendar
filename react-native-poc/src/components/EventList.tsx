import React, { useCallback, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, ListRenderItemInfo } from 'react-native';
import { EventItem } from './EventItem';
import { CalendarEvent } from '@/types/Event';

interface EventListProps {
  events: CalendarEvent[];
  loading: boolean;
  onRefresh: () => void;
  onEventPress?: (event: CalendarEvent) => void;
}

export const EventList: React.FC<EventListProps> = React.memo(({ 
  events, 
  loading, 
  onRefresh,
  onEventPress,
}) => {
  const renderEvent = useCallback(({ item }: ListRenderItemInfo<CalendarEvent>) => (
    <EventItem event={item} onPress={onEventPress} />
  ), [onEventPress]);

  const keyExtractor = useCallback((item: CalendarEvent) => item.id, []);

  // Group events by date for better performance and UX
  const groupedEvents = useMemo(() => {
    if (events.length === 0) return [];

    const groups: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = event.startDate.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    // Convert to flat array with date headers
    const flatData: (CalendarEvent | { isDateHeader: true; date: string; events: CalendarEvent[] })[] = [];
    
    Object.entries(groups).forEach(([dateKey, dateEvents]) => {
      flatData.push({
        isDateHeader: true,
        date: dateKey,
        events: dateEvents,
      });
      flatData.push(...dateEvents);
    });

    return flatData;
  }, [events]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.isDateHeader) {
      return <DateHeader date={item.date} eventCount={item.events.length} />;
    }
    return <EventItem event={item as CalendarEvent} onPress={onEventPress} />;
  }, [onEventPress]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 80, // Approximate height per item
    offset: 80 * index,
    index,
  }), []);

  if (events.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No events found</Text>
        <Text style={styles.emptySubtitle}>
          Pull down to refresh or check your calendar permissions in Settings
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events} // Use original events array for now, can switch to groupedEvents later
      renderItem={renderEvent}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={onRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']}
        />
      }
      style={styles.list}
      contentContainerStyle={events.length === 0 ? styles.emptyContentContainer : undefined}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={15}
      windowSize={10}
      showsVerticalScrollIndicator={true}
      // getItemLayout={getItemLayout} // Uncomment if all items have same height
    />
  );
});

const DateHeader: React.FC<{ date: string; eventCount: number }> = React.memo(({ date, eventCount }) => {
  const formatHeaderDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.dateHeader}>
      <Text style={styles.dateHeaderText}>
        {formatHeaderDate(date)}
      </Text>
      <Text style={styles.eventCountText}>
        {eventCount} event{eventCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  dateHeader: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  eventCountText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
});

EventList.displayName = 'EventList';
DateHeader.displayName = 'DateHeader';