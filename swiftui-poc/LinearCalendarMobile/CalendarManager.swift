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
        print("Loaded \(calendars.count) calendars: \(calendars.map { $0.title })")
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
        
        print("Loading events from \(startDate) to \(endDate)")
        
        // Create predicate for event search
        let predicate = eventStore.predicateForEvents(
            withStart: startDate,
            end: endDate,
            calendars: availableCalendars
        )
        
        // Fetch events
        let ekEvents = eventStore.events(matching: predicate)
        print("Found \(ekEvents.count) raw events")
        
        // Transform to our model
        let calendarEvents = ekEvents.map { CalendarEvent(from: $0) }
        
        // Sort by start date
        let sortedEvents = calendarEvents.sorted { $0.startDate < $1.startDate }
        
        // Update UI on main thread
        DispatchQueue.main.async {
            self.events = sortedEvents
            self.isLoading = false
            
            print("Displaying \(sortedEvents.count) events")
            
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
    
    // MARK: - Development Helper
    
    func loadSampleData() {
        // For testing when calendar access is not available
        self.events = CalendarEvent.sampleEvents
        self.permissionStatus = .granted
        self.availableCalendars = [] // Simulated empty calendars
        print("Loaded sample data with \(events.count) events")
    }
}