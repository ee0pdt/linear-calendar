# React Native Migration Plan - Linear Calendar

## Overview

This plan provides step-by-step instructions for migrating the Linear Calendar web application to React Native. The plan is designed for a reasonably junior developer to follow, with detailed explanations and troubleshooting guidance.

## Prerequisites & Environment Setup

### Hardware Requirements
- **macOS machine** (required for iOS development)
- **Minimum 8GB RAM** (16GB+ recommended for smooth simulator performance)
- **SSD storage** with at least 10GB free space
- **Apple Developer Account** (for device testing and App Store deployment)

### Software Installation (Step-by-Step)

#### 1. Install Node.js and npm
```bash
# Check if Node.js is already installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Or use Homebrew:
brew install node
```

#### 2. Install Xcode (Essential)
- Open **Mac App Store**
- Search for "Xcode"
- Click **Get** and wait for download (this is large, ~10GB+)
- Launch Xcode and accept license agreements
- Install additional components when prompted

#### 3. Configure Xcode Command Line Tools
```bash
# Open Xcode
# Go to: Xcode → Settings → Locations
# Under "Command Line Tools", select the latest version
# Or install via command line:
xcode-select --install
```

#### 4. Install iOS Simulator
- In Xcode: **Window → Devices and Simulators**
- Click **Simulators** tab
- Click **+** to add new simulator
- Choose **iOS 17.x** and **iPhone 15** (recommended for testing)

#### 5. Install CocoaPods (iOS Dependency Manager)
```bash
sudo gem install cocoapods
# If this fails, try:
brew install cocoapods
```

#### 6. Install Watchman (Performance Tool)
```bash
brew install watchman
```

## Project Setup Options

We'll use **Expo CLI** for easier setup and better calendar integration support.

### Option A: Expo (Recommended for PoC)

#### Step 1: Install Expo CLI
```bash
npm install -g @expo/cli
```

#### Step 2: Create New Project
```bash
# Navigate to your projects directory
cd /path/to/your/projects

# Create new Expo project
npx create-expo-app LinearCalendarMobile --template typescript

# Navigate to project
cd LinearCalendarMobile
```

#### Step 3: Install Calendar Dependencies
```bash
# Install calendar package
npx expo install expo-calendar

# Install additional dependencies we'll need
npm install @react-native-async-storage/async-storage
npm install react-native-calendars
npm install date-fns
```

### Option B: React Native CLI (More Control)

If you prefer full control:

```bash
# Install React Native CLI
npm install -g react-native-cli

# Create new project
npx react-native init LinearCalendarMobile --template react-native-template-typescript

# Navigate to project
cd LinearCalendarMobile

# Install calendar dependencies
npm install react-native-calendar-events
npm install @react-native-async-storage/async-storage
npm install react-native-calendars
npm install date-fns

# iOS setup
cd ios && pod install && cd ..
```

## Configuration Files

### 1. iOS Permissions (Info.plist)

For Expo projects, add to `app.json`:
```json
{
  "expo": {
    "name": "Linear Calendar Mobile",
    "plugins": [
      [
        "expo-calendar",
        {
          "calendarPermission": "Linear Calendar needs access to your calendar to display and sync your events."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCalendarsUsageDescription": "This app needs access to your calendar to display your events.",
        "NSCalendarsFullAccessUsageDescription": "This app needs full calendar access to read and display all your events."
      }
    }
  }
}
```

For React Native CLI, manually edit `ios/LinearCalendarMobile/Info.plist`:
```xml
<key>NSCalendarsUsageDescription</key>
<string>This app needs access to your calendar to display your events.</string>
<key>NSCalendarsFullAccessUsageDescription</key>
<string>This app needs full calendar access to read and display all your events.</string>
```

## Code Migration Strategy

### Phase 1: Basic Structure and Calendar Loading

#### 1. Create Basic App Structure

**File: `src/types/Event.ts`**
```typescript
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
```

**File: `src/hooks/useCalendarEvents.ts`**
```typescript
import { useState, useEffect } from 'react';
import * as Calendar from 'expo-calendar';
import { CalendarEvent } from '../types/Event';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permission
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Calendar permission denied');
      }

      // Get calendars
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );

      if (calendars.length === 0) {
        throw new Error('No calendars found');
      }

      // Get events for next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      const calendarEvents = await Calendar.getEventsAsync(
        calendars.map(cal => cal.id),
        startDate,
        endDate
      );

      // Transform to our format
      const transformedEvents: CalendarEvent[] = calendarEvents.map(event => ({
        id: event.id,
        title: event.title,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        allDay: event.allDay || false,
        location: event.location || undefined,
        notes: event.notes || undefined,
        calendarId: event.calendarId || undefined,
      }));

      setEvents(transformedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return { events, loading, error, reload: loadEvents };
};
```

**File: `src/components/EventItem.tsx`**
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarEvent } from '../types/Event';

interface EventItemProps {
  event: CalendarEvent;
}

export const EventItem: React.FC<EventItemProps> = ({ event }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.dateColumn}>
        <Text style={styles.dateText}>{formatDate(event.startDate)}</Text>
        {!event.allDay && (
          <Text style={styles.timeText}>{formatTime(event.startDate)}</Text>
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
        
        {event.allDay && (
          <Text style={styles.allDayText}>All Day</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dateColumn: {
    width: 60,
    marginRight: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contentColumn: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  allDayText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});
```

**File: `src/components/EventList.tsx`**
```typescript
import React, { useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { EventItem } from './EventItem';
import { CalendarEvent } from '../types/Event';

interface EventListProps {
  events: CalendarEvent[];
  loading: boolean;
  onRefresh: () => void;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  loading, 
  onRefresh 
}) => {
  const renderEvent = useCallback(({ item }: { item: CalendarEvent }) => (
    <EventItem event={item} />
  ), []);

  const keyExtractor = useCallback((item: CalendarEvent) => item.id, []);

  if (events.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No events found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      renderItem={renderEvent}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      style={styles.list}
      // Performance optimizations for large lists
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
  );
};

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
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
```

**File: `App.tsx`**
```typescript
import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert } from 'react-native';
import { EventList } from './src/components/EventList';
import { useCalendarEvents } from './src/hooks/useCalendarEvents';

export default function App() {
  const { events, loading, error, reload } = useCalendarEvents();

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Linear Calendar</Text>
        <Text style={styles.eventCount}>
          {events.length} event{events.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <EventList 
        events={events} 
        loading={loading} 
        onRefresh={reload}
      />
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  eventCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
```

## Running and Testing

### 1. Start Development Server

For Expo:
```bash
# Start Expo development server
npx expo start

# In the terminal, press 'i' to open iOS simulator
# Or scan QR code with Expo Go app on physical device
```

For React Native CLI:
```bash
# Start Metro bundler
npx react-native start

# In another terminal, run iOS app
npx react-native run-ios
```

### 2. Testing Checklist

- [ ] App launches without crashing
- [ ] Calendar permission dialog appears
- [ ] Events load after granting permission
- [ ] Events display correctly with titles, dates, times
- [ ] Pull-to-refresh works
- [ ] Error handling works (try denying permission)
- [ ] Performance is smooth with your real calendar data

## Common Issues & Troubleshooting

### Issue: "Calendar permission denied"
**Solution:**
- Go to iOS Settings → Privacy & Security → Calendars
- Find your app and enable access
- Restart the app

### Issue: "No calendars found"
**Solution:**
- Check that you have calendars set up in iOS Calendar app
- Verify calendar access is enabled in iOS settings

### Issue: iOS Simulator not loading
**Solution:**
```bash
# Reset iOS simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

### Issue: Build errors with CocoaPods
**Solution:**
```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
```

### Issue: Metro bundler cache issues
**Solution:**
```bash
npx react-native start --reset-cache
# Or for Expo:
npx expo start -c
```

## Performance Optimization

### For Large Event Lists (1000+ events)

1. **Use FlashList instead of FlatList**:
```bash
npm install @shopify/flash-list
```

2. **Implement proper memoization**:
```typescript
const EventItem = React.memo(({ event }: EventItemProps) => {
  // Component implementation
});
```

3. **Add getItemLayout if items have fixed height**:
```typescript
const getItemLayout = (data: any, index: number) => ({
  length: 80, // Fixed item height
  offset: 80 * index,
  index,
});
```

## Next Steps After Basic PoC

Once basic calendar loading works:

1. **Add date filtering** (show events for specific date ranges)
2. **Implement search functionality**
3. **Add event details modal**
4. **Migrate existing utilities** from web version
5. **Add recurring event support**
6. **Implement proper styling and theming**

## Success Criteria

The PoC is successful if:
- [ ] App loads and displays your real Apple Calendar events
- [ ] Performance is acceptable with your actual event count
- [ ] Calendar permissions work reliably
- [ ] Basic list navigation is smooth
- [ ] Error handling works properly
- [ ] Development workflow feels manageable

## Time Estimation

- **Environment Setup**: 1-2 hours (first time)
- **Basic Project Creation**: 30 minutes
- **Calendar Integration**: 2-3 hours
- **Basic UI Components**: 1-2 hours
- **Testing and Debugging**: 1-2 hours

**Total: 5.5-9.5 hours** for complete PoC

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Calendar Docs](https://docs.expo.dev/versions/latest/sdk/calendar/)
- [iOS Simulator Guide](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)
- [React Native Performance Guide](https://reactnative.dev/docs/performance)

---

**Document Created:** 2025-01-24  
**Target Audience:** Junior-to-mid level React developers  
**Prerequisites:** Basic React and TypeScript knowledge