# SwiftUI Migration Plan - Linear Calendar

## Overview

This plan provides step-by-step instructions for migrating the Linear Calendar web application to native SwiftUI. The plan is designed for a reasonably junior developer to follow, with detailed explanations, Swift syntax guidance, and troubleshooting support.

## Prerequisites & Environment Setup

### Hardware Requirements
- **macOS machine** (required for iOS development)
- **macOS Monterey 12.5** or later (for Xcode 14+)
- **macOS Ventura 13** or later recommended (for latest Xcode 15/16)
- **Minimum 8GB RAM** (16GB+ recommended for smooth development)
- **SSD storage** with at least 15GB free space (Xcode is large)
- **Apple Developer Account** (free tier sufficient for local testing)

### Software Installation (Step-by-Step)

#### 1. Install/Update Xcode (Essential)
```bash
# Check current macOS version
sw_vers

# If compatible, install Xcode from Mac App Store
# Search for "Xcode" and click "Get"
# This download is ~10-15GB and may take 30-60 minutes
```

**Alternative Command Line Installation:**
```bash
# Install Xcode Command Line Tools if not already installed
xcode-select --install
```

#### 2. Verify Xcode Installation
- Launch Xcode from Applications
- Accept license agreements when prompted
- Install additional components when requested
- Verify iOS Simulator is included

#### 3. Create Apple Developer Account (Free)
- Visit [developer.apple.com](https://developer.apple.com)
- Sign in with Apple ID
- Accept developer agreement
- This enables device testing and simulator access

## Swift Language Crash Course

### Key Syntax Differences from JavaScript/TypeScript

#### Variables and Constants
```swift
// JavaScript/TypeScript
let name = "Peter";
const age = 30;

// Swift
var name = "Peter"    // Mutable variable
let age = 30          // Immutable constant
```

#### Data Types
```swift
// Swift is strongly typed but has type inference
let title: String = "My Event"     // Explicit type
let title = "My Event"             // Inferred type (String)
let count = 42                     // Inferred type (Int)
let price = 19.99                  // Inferred type (Double)
let isActive = true                // Inferred type (Bool)
```

#### Optionals (Key Swift Concept)
```swift
// Swift uses optionals for values that might be nil
var eventLocation: String?        // Can be String or nil
eventLocation = "London"
eventLocation = nil               // Valid

// Unwrapping optionals safely
if let location = eventLocation {
    print("Event is in \(location)")  // String interpolation
} else {
    print("No location specified")
}
```

#### Arrays and Collections
```swift
// Arrays
var events: [String] = ["Meeting", "Lunch", "Gym"]
let events = ["Meeting", "Lunch", "Gym"]  // Inferred as [String]

// Dictionaries
var eventDetails: [String: Any] = [
    "title": "Team Meeting",
    "duration": 60,
    "isImportant": true
]
```

#### Functions
```swift
// JavaScript/TypeScript
function formatDate(date, format) {
    return date.toFormat(format);
}

// Swift
func formatDate(_ date: Date, format: String) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = format
    return formatter.string(from: date)
}
```

#### Classes and Structs
```swift
// Swift has both classes (reference types) and structs (value types)
struct CalendarEvent {
    let id: String
    let title: String
    let startDate: Date
    var location: String?        // Optional property
    
    // Computed property
    var isToday: Bool {
        Calendar.current.isDateInToday(startDate)
    }
}

class EventManager: ObservableObject {
    @Published var events: [CalendarEvent] = []  // SwiftUI reactive property
}
```

## Project Setup

### Step 1: Create New Xcode Project

1. **Launch Xcode**
2. **Select "Create new Xcode project"**
3. **Choose template:**
   - Platform: **iOS**
   - Template: **App**
   - Click **Next**

4. **Configure project:**
   - Product Name: `LinearCalendarMobile`
   - Team: (Select your Apple Developer account)
   - Organization Identifier: `com.yourname.linearcalendarmobile`
   - Bundle Identifier: (auto-generated)
   - Language: **Swift**
   - Interface: **SwiftUI**
   - Use Core Data: **Unchecked**
   - Include Tests: **Checked** (recommended)
   - Click **Next**

5. **Choose location:**
   - Select project directory (Desktop is fine for learning)
   - Click **Create**

### Step 2: Configure Calendar Permissions

**File: `Info.plist`** (in project navigator)
Add these keys by right-clicking in the plist editor:
```xml
<key>NSCalendarsUsageDescription</key>
<string>Linear Calendar needs access to your calendar to display and sync your events.</string>
<key>NSCalendarsFullAccessUsageDescription</key>
<string>Linear Calendar needs full calendar access to read and display all your events.</string>
<key>NSRemindersUsageDescription</key>
<string>Linear Calendar may access reminders associated with your calendar events.</string>
<key>NSContactsUsageDescription</key>
<string>Linear Calendar may access contacts for event attendee information.</string>
```

### Step 3: Project Structure Setup

Create these Swift files by right-clicking on project name → New File → Swift File:

## Code Implementation

### Phase 1: Basic Structure and Calendar Loading

#### 1. Data Models

**File: `CalendarEvent.swift`**
```swift
import Foundation
import EventKit

struct CalendarEvent: Identifiable, Hashable {
    let id: String
    let title: String
    let startDate: Date
    let endDate: Date
    let isAllDay: Bool
    let location: String?
    let notes: String?
    let calendarTitle: String?
    let calendarColor: String?
    
    // Computed properties for UI
    var isToday: Bool {
        Calendar.current.isDateInToday(startDate)
    }
    
    var isPast: Bool {
        endDate < Date()
    }
    
    var displayDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: startDate)
    }
    
    var displayTime: String? {
        guard !isAllDay else { return nil }
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: startDate)
    }
    
    // Initialize from EKEvent
    init(from ekEvent: EKEvent) {
        self.id = ekEvent.eventIdentifier
        self.title = ekEvent.title ?? "Untitled Event"
        self.startDate = ekEvent.startDate
        self.endDate = ekEvent.endDate
        self.isAllDay = ekEvent.isAllDay
        self.location = ekEvent.location
        self.notes = ekEvent.notes
        self.calendarTitle = ekEvent.calendar?.title
        self.calendarColor = ekEvent.calendar?.cgColor?.components?.description
    }
}

enum CalendarPermissionStatus {
    case notDetermined
    case denied
    case granted
    case restricted
    
    init(from ekAuthStatus: EKAuthorizationStatus) {
        switch ekAuthStatus {
        case .notDetermined:
            self = .notDetermined
        case .denied:
            self = .denied
        case .authorized, .fullAccess:  // iOS 17+ compatibility
            self = .granted
        case .restricted:
            self = .restricted
        case .writeOnly:
            self = .denied  // We need read access
        @unknown default:
            self = .notDetermined
        }
    }
    
    var displayText: String {
        switch self {
        case .notDetermined:
            return "⏳ Calendar permission needed"
        case .denied:
            return "❌ Calendar access denied"
        case .granted:
            return "✅ Calendar access granted"
        case .restricted:
            return "🚫 Calendar access restricted"
        }
    }
}
```

#### 2. Calendar Manager

**File: `CalendarManager.swift`**
```swift
import Foundation
import EventKit
import SwiftUI

@MainActor
class CalendarManager: ObservableObject {
    @Published var events: [CalendarEvent] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var permissionStatus: CalendarPermissionStatus = .notDetermined
    @Published var availableCalendars: [EKCalendar] = []
    
    private let eventStore = EKEventStore()
    
    init() {
        checkPermissionStatus()
    }
    
    // MARK: - Permission Management
    
    func checkPermissionStatus() {
        let currentStatus = EKEventStore.authorizationStatus(for: .event)
        self.permissionStatus = CalendarPermissionStatus(from: currentStatus)
        
        if permissionStatus == .granted {
            loadCalendars()
        }
    }
    
    func requestPermission() async {
        do {
            // iOS 17+ vs earlier versions compatibility
            let granted: Bool
            if #available(iOS 17.0, *) {
                granted = try await eventStore.requestFullAccessToEvents()
            } else {
                granted = try await eventStore.requestAccess(to: .event)
            }
            
            await MainActor.run {
                self.permissionStatus = granted ? .granted : .denied
                if granted {
                    loadCalendars()
                    loadEvents()
                } else {
                    self.errorMessage = "Calendar permission denied. Please enable in Settings → Privacy & Security → Calendars"
                }
            }
        } catch {
            await MainActor.run {
                self.errorMessage = "Permission request failed: \(error.localizedDescription)"
                self.permissionStatus = .denied
            }
        }
    }
    
    // MARK: - Data Loading
    
    private func loadCalendars() {
        let calendars = eventStore.calendars(for: .event)
        self.availableCalendars = calendars
    }
    
    func loadEvents() {
        guard permissionStatus == .granted else {
            errorMessage = "Calendar permission required"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Create date range (next 30 days)
        let startDate = Date()
        let endDate = Calendar.current.date(byAdding: .day, value: 30, to: startDate) ?? Date()
        
        // Create predicate for event search
        let predicate = eventStore.predicateForEvents(
            withStart: startDate,
            end: endDate,
            calendars: availableCalendars
        )
        
        // Fetch events
        let ekEvents = eventStore.events(matching: predicate)
        
        // Transform to our model
        let calendarEvents = ekEvents.map { CalendarEvent(from: $0) }
        
        // Sort by start date
        let sortedEvents = calendarEvents.sorted { $0.startDate < $1.startDate }
        
        // Update UI on main thread
        DispatchQueue.main.async {
            self.events = sortedEvents
            self.isLoading = false
            
            if sortedEvents.isEmpty {
                self.errorMessage = "No events found for the next 30 days"
            }
        }
    }
    
    // MARK: - Helper Methods
    
    var eventCountText: String {
        let total = events.count
        let todayEvents = events.filter { $0.isToday }.count
        let calendarsCount = availableCalendars.count
        
        if total == 0 {
            return "\(calendarsCount) calendar\(calendarsCount != 1 ? "s" : "") connected"
        }
        
        return "\(total) events • \(todayEvents) today • \(calendarsCount) calendars"
    }
}
```

#### 3. Event List View

**File: `EventListView.swift`**
```swift
import SwiftUI

struct EventListView: View {
    let events: [CalendarEvent]
    let isLoading: Bool
    let onRefresh: () -> Void
    let onEventTap: (CalendarEvent) -> Void
    
    var body: some View {
        if events.isEmpty && !isLoading {
            // Empty state
            VStack(spacing: 16) {
                Image(systemName: "calendar.badge.exclamationmark")
                    .font(.system(size: 60))
                    .foregroundColor(.gray)
                
                Text("No events found")
                    .font(.title2)
                    .fontWeight(.medium)
                
                Text("Pull down to refresh or check your calendar permissions in Settings")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .refreshable {
                onRefresh()
            }
        } else {
            // Event list - Use List for better performance with large datasets
            List {
                ForEach(events) { event in
                    EventRowView(event: event)
                        .onTapGesture {
                            onEventTap(event)
                        }
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                }
            }
            .listStyle(PlainListStyle())
            .refreshable {
                onRefresh()
            }
        }
    }
}

struct EventRowView: View {
    let event: CalendarEvent
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Date column
            VStack(alignment: .leading, spacing: 2) {
                Text(event.displayDate)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(event.isToday ? .blue : (event.isPast ? .gray : .primary))
                
                if let timeText = event.displayTime {
                    Text(timeText)
                        .font(.caption)
                        .foregroundColor(.secondary)
                } else if event.isAllDay {
                    Text("All Day")
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)
                }
            }
            .frame(width: 70, alignment: .leading)
            
            // Content column
            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.body)
                    .fontWeight(.medium)
                    .lineLimit(2)
                
                if let location = event.location, !location.isEmpty {
                    Label(location, systemImage: "location")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                
                if let notes = event.notes, !notes.isEmpty {
                    Label(notes, systemImage: "note.text")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                
                if let calendarTitle = event.calendarTitle {
                    Text(calendarTitle)
                        .font(.caption2)
                        .foregroundColor(.tertiary)
                }
            }
            
            Spacer()
            
            // Status indicator
            Circle()
                .fill(event.isPast ? Color.gray : Color.blue)
                .frame(width: 6, height: 6)
                .padding(.top, 2)
        }
        .opacity(event.isPast ? 0.6 : 1.0)
        .padding(.vertical, 4)
    }
}
```

#### 4. Main App View

**File: `ContentView.swift`** (Replace existing)
```swift
import SwiftUI

struct ContentView: View {
    @StateObject private var calendarManager = CalendarManager()
    @State private var selectedEvent: CalendarEvent?
    @State private var showingEventDetail = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                HeaderView(
                    eventCount: calendarManager.eventCountText,
                    permissionStatus: calendarManager.permissionStatus.displayText,
                    isLoading: calendarManager.isLoading
                )
                
                // Main content
                EventListView(
                    events: calendarManager.events,
                    isLoading: calendarManager.isLoading,
                    onRefresh: {
                        calendarManager.loadEvents()
                    },
                    onEventTap: { event in
                        selectedEvent = event
                        showingEventDetail = true
                    }
                )
            }
            .navigationTitle("Linear Calendar")
            .navigationBarTitleDisplayMode(.large)
        }
        .task {
            // Check permissions when view appears
            if calendarManager.permissionStatus == .notDetermined {
                await calendarManager.requestPermission()
            } else if calendarManager.permissionStatus == .granted {
                calendarManager.loadEvents()
            }
        }
        .alert("Calendar Error", isPresented: .constant(calendarManager.errorMessage != nil)) {
            Button("OK") {
                calendarManager.errorMessage = nil
            }
            Button("Retry") {
                Task {
                    if calendarManager.permissionStatus == .denied {
                        await calendarManager.requestPermission()
                    } else {
                        calendarManager.loadEvents()
                    }
                }
            }
        } message: {
            Text(calendarManager.errorMessage ?? "")
        }
        .sheet(isPresented: $showingEventDetail) {
            if let event = selectedEvent {
                EventDetailView(event: event)
            }
        }
    }
}

struct HeaderView: View {
    let eventCount: String
    let permissionStatus: String
    let isLoading: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(eventCount)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                if isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                }
            }
            
            Text(permissionStatus)
                .font(.caption)
                .foregroundColor(.blue)
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(Color(.systemBackground))
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(Color(.systemGray5)),
            alignment: .bottom
        )
    }
}

struct EventDetailView: View {
    let event: CalendarEvent
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(event.title)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        if event.isAllDay {
                            Label("All Day Event", systemImage: "clock")
                                .foregroundColor(.blue)
                        } else {
                            Label("\(event.startDate.formatted(date: .abbreviated, time: .shortened)) - \(event.endDate.formatted(date: .omitted, time: .shortened))", systemImage: "clock")
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
                
                if let location = event.location, !location.isEmpty {
                    Section("Location") {
                        Label(location, systemImage: "location")
                    }
                }
                
                if let notes = event.notes, !notes.isEmpty {
                    Section("Notes") {
                        Text(notes)
                    }
                }
                
                if let calendarTitle = event.calendarTitle {
                    Section("Calendar") {
                        Label(calendarTitle, systemImage: "calendar")
                    }
                }
            }
            .navigationTitle("Event Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        // This will be handled by the parent view
                    }
                }
            }
        }
    }
}
```

## Running and Testing

### Step 1: Build and Run

1. **Select Simulator:**
   - In Xcode toolbar, click device selector (next to play button)
   - Choose "iPhone 15" or "iPhone 15 Pro" 
   - Ensure iOS 17.0+ simulator is selected

2. **Build and Run:**
   - Press **⌘ + R** or click play button
   - Wait for build to complete (first build takes longer)
   - iOS Simulator should launch automatically

### Step 2: Testing Checklist

- [ ] App launches without crashing
- [ ] Calendar permission dialog appears on first launch
- [ ] Events load after granting permission
- [ ] Events display correctly with titles, dates, times
- [ ] Pull-to-refresh works
- [ ] Tap events to see detail view
- [ ] Error handling works (try denying permission)
- [ ] Performance is smooth with your real calendar data

## Common Issues & Troubleshooting

### Issue: "Build Failed - Swift Compilation Error"
**Solution:**
- Check for typos in Swift syntax
- Ensure all `import` statements are present
- Verify file names match the class/struct names

### Issue: "Calendar permission denied"
**Solution:**
- Go to iOS Simulator: Settings → Privacy & Security → Calendars
- Find your app and enable access
- Restart the app

### Issue: "No events found"
**Solution:**
- Add some events to iOS Simulator Calendar app
- Verify calendars exist in Calendar app
- Check date range (app loads next 30 days)

### Issue: iOS Simulator slow/unresponsive
**Solution:**
```bash
# Reset iOS Simulator
xcrun simctl shutdown all
xcrun simctl erase all
# Restart Xcode and try again
```

### Issue: Xcode build errors
**Solution:**
- Clean build folder: **Product → Clean Build Folder** (⌘ + Shift + K)
- Quit and restart Xcode
- Check macOS version compatibility with Xcode version

## Performance Considerations

### For Large Event Lists (1000+ events)

1. **Use List instead of LazyVStack for very large datasets**
   - List provides view recycling (like UITableView)
   - LazyVStack can accumulate views and slow down with growth

2. **Implement pagination if needed:**
```swift
// Load events in chunks
func loadMoreEvents() {
    let nextStartDate = lastLoadedDate
    let nextEndDate = Calendar.current.date(byAdding: .day, value: 30, to: nextStartDate)
    // ... fetch and append events
}
```

3. **Optimize EventRowView with lazy loading:**
```swift
struct EventRowView: View {
    let event: CalendarEvent
    
    var body: some View {
        // Keep view lightweight
        // Avoid complex calculations in body
    }
}
```

## Swift Learning Curve Timeline

**Day 1-2:** Basic syntax, variables, optionals  
**Day 3-5:** Functions, classes, SwiftUI basics  
**Week 2:** EventKit integration, data flow  
**Week 3:** UI polish, error handling  

## Success Criteria

The PoC is successful if:
- [ ] App loads and displays your real Apple Calendar events
- [ ] Calendar permissions work reliably across iOS versions
- [ ] Performance is acceptable with your actual event count
- [ ] Swift syntax feels manageable for basic operations
- [ ] Xcode development workflow is comfortable
- [ ] Native iOS features (like pull-to-refresh) work smoothly

## Time Estimation

- **Xcode Setup & Learning:** 2-3 hours (if new to Mac development)
- **Swift Syntax Learning:** 3-4 hours (with programming background)
- **Basic Project Creation:** 1 hour
- **EventKit Integration:** 3-4 hours
- **SwiftUI UI Components:** 2-3 hours
- **Testing and Debugging:** 2-3 hours

**Total: 13-20 hours** for complete PoC (higher due to Swift learning curve)

## Key Advantages Discovered

Once complete, you'll have validated:
- **Native performance:** Smooth scrolling, instant app launch
- **Deep iOS integration:** Native calendar access, system UI patterns
- **Future potential:** Widgets, Shortcuts, Watch app, etc.
- **Development experience:** Xcode tools, SwiftUI previews, debugging

## Next Steps After Basic PoC

Once basic calendar loading works:
1. **Add date range expansion** (load more than 30 days)
2. **Implement search functionality** 
3. **Add calendar filtering** (show/hide specific calendars)
4. **Migrate date utilities** from web version
5. **Add recurring event handling**
6. **Implement proper error recovery**

## Resources

- [Swift.org Getting Started](https://www.swift.org/getting-started/)
- [Apple SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- [EventKit Documentation](https://developer.apple.com/documentation/eventkit)
- [SwiftUI by Example](https://www.hackingwithswift.com/quick-start/swiftui)
- [100 Days of SwiftUI](https://www.hackingwithswift.com/100/swiftui) (free comprehensive course)

---

**Document Created:** 2025-01-24  
**Target Audience:** Junior developers with React/TypeScript experience  
**Prerequisites:** Basic programming knowledge, willingness to learn Swift syntax