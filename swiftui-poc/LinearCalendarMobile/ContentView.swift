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
            if calendarManager.permissionStatus == .denied || calendarManager.permissionStatus == .notDetermined {
                Button("Use Sample Data") {
                    calendarManager.loadSampleData()
                    calendarManager.errorMessage = nil
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

// MARK: - SwiftUI Previews

#Preview("Content View - With Events") {
    ContentView()
        .onAppear {
            // For preview, we can simulate loaded events
            // This won't work in the actual preview but shows the structure
        }
}

#Preview("Content View - Empty") {
    ContentView()
}