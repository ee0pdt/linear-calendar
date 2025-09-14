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
    
    // Sample data initializer for previews
    init(id: String, title: String, startDate: Date, endDate: Date, isAllDay: Bool = false, location: String? = nil, notes: String? = nil, calendarTitle: String? = nil, calendarColor: String? = nil) {
        self.id = id
        self.title = title
        self.startDate = startDate
        self.endDate = endDate
        self.isAllDay = isAllDay
        self.location = location
        self.notes = notes
        self.calendarTitle = calendarTitle
        self.calendarColor = calendarColor
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
        case .authorized:
            self = .granted
        case .restricted:
            self = .restricted
        case .fullAccess:  // iOS 17+ compatibility
            self = .granted
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

// Sample data for SwiftUI previews
extension CalendarEvent {
    static let sampleEvents: [CalendarEvent] = [
        CalendarEvent(
            id: "1",
            title: "Team Meeting",
            startDate: Date(),
            endDate: Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date(),
            location: "Conference Room A",
            notes: "Weekly team standup",
            calendarTitle: "Work"
        ),
        CalendarEvent(
            id: "2",
            title: "Lunch with Sarah",
            startDate: Calendar.current.date(byAdding: .hour, value: 3, to: Date()) ?? Date(),
            endDate: Calendar.current.date(byAdding: .hour, value: 4, to: Date()) ?? Date(),
            location: "Italian Restaurant",
            calendarTitle: "Personal"
        ),
        CalendarEvent(
            id: "3",
            title: "Birthday Party",
            startDate: Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date(),
            endDate: Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date(),
            isAllDay: true,
            location: "Central Park",
            notes: "Bring cake!",
            calendarTitle: "Personal"
        )
    ]
}