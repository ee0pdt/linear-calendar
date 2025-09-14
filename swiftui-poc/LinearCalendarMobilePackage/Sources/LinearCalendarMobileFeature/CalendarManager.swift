import Foundation
@preconcurrency import EventKit
import SwiftUI

@MainActor
@Observable
public class CalendarManager {
    public var events: [CalendarEvent] = []
    public var isLoading: Bool = false
    public var errorMessage: String?
    public var permissionStatus: CalendarPermissionStatus = .notDetermined
    public var availableCalendars: [EKCalendar] = []
    
    private let eventStore = EKEventStore()
    
    public init() {
        checkPermissionStatus()
    }
    
    // MARK: - Permission Management
    
    public func checkPermissionStatus() {
        let currentStatus = EKEventStore.authorizationStatus(for: .event)
        self.permissionStatus = CalendarPermissionStatus(from: currentStatus)
        
        if permissionStatus == .granted {
            loadCalendars()
        }
    }
    
    nonisolated public func requestPermission() async {
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
    
    public func loadEvents() {
        guard permissionStatus == .granted else {
            errorMessage = "Calendar permission required"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Create date range (3 years: current year - 1 to current year + 1)
        let currentYear = Calendar.current.component(.year, from: Date())
        let startDate = Calendar.current.date(from: DateComponents(year: currentYear - 1, month: 1, day: 1)) ?? Date()
        let endDate = Calendar.current.date(from: DateComponents(year: currentYear + 2, month: 1, day: 1)) ?? Date()
        
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
    
    public func loadSampleData() {
        // For testing when calendar access is not available
        self.events = CalendarEvent.sampleEvents
        self.permissionStatus = .granted
        self.availableCalendars = [] // Simulated empty calendars
        print("Loaded sample data with \(events.count) events")
    }
}