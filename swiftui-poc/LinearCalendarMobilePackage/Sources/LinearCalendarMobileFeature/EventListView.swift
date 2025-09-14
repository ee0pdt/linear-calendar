import SwiftUI

public struct EventListView: View {
    public let events: [CalendarEvent]
    public let isLoading: Bool
    public let onRefresh: () -> Void
    public let onEventTap: (CalendarEvent) -> Void

    public init(events: [CalendarEvent], isLoading: Bool, onRefresh: @escaping () -> Void, onEventTap: @escaping (CalendarEvent) -> Void) {
        self.events = events
        self.isLoading = isLoading
        self.onRefresh = onRefresh
        self.onEventTap = onEventTap
    }

    public var body: some View {
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

public struct EventRowView: View {
    public let event: CalendarEvent

    public init(event: CalendarEvent) {
        self.event = event
    }

    public var body: some View {
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
                        .foregroundStyle(.tertiary)
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

public struct HeaderView: View {
    public let eventCount: String
    public let permissionStatus: String
    public let isLoading: Bool

    public init(eventCount: String, permissionStatus: String, isLoading: Bool) {
        self.eventCount = eventCount
        self.permissionStatus = permissionStatus
        self.isLoading = isLoading
    }

    public var body: some View {
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

public struct EventDetailView: View {
    public let event: CalendarEvent
    @Environment(\.dismiss) private var dismiss

    public init(event: CalendarEvent) {
        self.event = event
    }

    public var body: some View {
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
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - SwiftUI Previews

#Preview("Event List - With Events") {
    EventListView(
        events: CalendarEvent.sampleEvents,
        isLoading: false,
        onRefresh: {},
        onEventTap: { _ in }
    )
}

#Preview("Event List - Empty") {
    EventListView(
        events: [],
        isLoading: false,
        onRefresh: {},
        onEventTap: { _ in }
    )
}

#Preview("Event List - Loading") {
    EventListView(
        events: [],
        isLoading: true,
        onRefresh: {},
        onEventTap: { _ in }
    )
}

#Preview("Event Row") {
    List {
        EventRowView(event: CalendarEvent.sampleEvents[0])
        EventRowView(event: CalendarEvent.sampleEvents[1])
        EventRowView(event: CalendarEvent.sampleEvents[2])
    }
}

#Preview("Event Detail") {
    EventDetailView(event: CalendarEvent.sampleEvents[0])
}

#Preview("Header View") {
    VStack {
        HeaderView(
            eventCount: "12 events • 3 today • 4 calendars",
            permissionStatus: "✅ Calendar access granted",
            isLoading: false
        )
        HeaderView(
            eventCount: "Loading...",
            permissionStatus: "⏳ Calendar permission needed",
            isLoading: true
        )
        Spacer()
    }
}