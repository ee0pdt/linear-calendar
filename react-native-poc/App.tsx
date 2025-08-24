import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { EventList } from './src/components/EventList';
import { useCalendarEvents } from './src/hooks/useCalendarEvents';
import { CalendarEvent } from './src/types/Event';

export default function App() {
  const { 
    events, 
    calendars, 
    loading, 
    error, 
    permissionStatus, 
    reload 
  } = useCalendarEvents();

  React.useEffect(() => {
    if (error) {
      Alert.alert(
        'Calendar Error', 
        error,
        [
          { text: 'OK' },
          { text: 'Retry', onPress: reload }
        ]
      );
    }
  }, [error, reload]);

  const handleEventPress = (event: CalendarEvent) => {
    Alert.alert(
      event.title,
      [
        event.allDay ? 'All Day Event' : `${event.startDate.toLocaleTimeString()} - ${event.endDate.toLocaleTimeString()}`,
        event.location && `📍 ${event.location}`,
        event.notes && `💭 ${event.notes}`,
      ].filter(Boolean).join('\n\n'),
      [{ text: 'OK' }]
    );
  };

  const formatPermissionStatus = () => {
    if (!permissionStatus) return 'Checking permissions...';
    
    switch (permissionStatus.status) {
      case 'granted':
        return `✅ Calendar access granted`;
      case 'denied':
        return `❌ Calendar access denied`;
      case 'undetermined':
        return `⏳ Calendar permission needed`;
      default:
        return `❓ Permission status: ${permissionStatus.status}`;
    }
  };

  const getHeaderStats = () => {
    const total = events.length;
    const calendarsCount = calendars.length;
    
    if (total === 0) {
      return `${calendarsCount} calendar${calendarsCount !== 1 ? 's' : ''} connected`;
    }
    
    const today = new Date();
    const todayEvents = events.filter(event => 
      event.startDate.toDateString() === today.toDateString()
    );
    
    return `${total} events • ${todayEvents.length} today • ${calendarsCount} calendars`;
  };

  return (
    <>
      <ExpoStatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Linear Calendar</Text>
          <Text style={styles.headerSubtitle}>
            {getHeaderStats()}
          </Text>
          <Text style={styles.permissionStatus}>
            {formatPermissionStatus()}
          </Text>
        </View>
        
        <EventList 
          events={events} 
          loading={loading} 
          onRefresh={reload}
          onEventPress={handleEventPress}
        />
        
        {loading && events.length === 0 && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading your calendar events...</Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  permissionStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});