import SwiftUI
@preconcurrency import EventKit

@MainActor
public struct ContentView: View {
    @State private var calendarManager = CalendarManager()

    private let currentYear = Calendar.current.component(.year, from: Date())

    public init() {}

    public var body: some View {
        NavigationStack {
            LinearCalendarView(calendarManager: calendarManager)
                .navigationTitle("Linear Calendar")
                .navigationBarTitleDisplayMode(.large)
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
        }
    }
}

@MainActor
struct LinearCalendarView: View {
    let calendarManager: CalendarManager
    private let yearRange: Range<Int>

    init(calendarManager: CalendarManager) {
        self.calendarManager = calendarManager

        let currentYear = Calendar.current.component(.year, from: Date())
        self.yearRange = (currentYear - 1)..<(currentYear + 2) // 3 years total

        print("LinearCalendarView: Current year = \(currentYear), Date range = \(yearRange)")
        print("LinearCalendarView: CalendarManager has \(calendarManager.events.count) events")
        if !calendarManager.events.isEmpty {
            print("LinearCalendarView: First few events: \(calendarManager.events.prefix(3).map { "\($0.title) on \($0.startDate)" })")
        }
    }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(allDaysInRange, id: \.timeIntervalSince1970) { date in
                        CalendarDayView(
                            date: date,
                            calendarManager: calendarManager
                        )
                        .id(dayId(for: date))
                    }
                }
                .padding(.horizontal)
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Sample") {
                        calendarManager.loadSampleData()
                    }
                    .fontWeight(.medium)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Today") {
                        let today = Date()
                        let formatter = DateFormatter()
                        formatter.dateFormat = "yyyy-MM-dd"
                        let todayId = formatter.string(from: today)

                        withAnimation(.easeInOut(duration: 0.5)) {
                            proxy.scrollTo(todayId, anchor: .top)
                        }
                    }
                    .fontWeight(.medium)
                }
            }
        }
    }

    private var allDaysInRange: [Date] {
        var days: [Date] = []
        let calendar = Calendar.current

        for year in yearRange {
            let startOfYear = calendar.date(from: DateComponents(year: year, month: 1, day: 1))!
            let endOfYear = calendar.date(from: DateComponents(year: year + 1, month: 1, day: 1))!

            var currentDate = startOfYear
            while currentDate < endOfYear {
                days.append(currentDate)
                currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate)!
            }
        }

        return days
    }

    private func dayId(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}

struct CalendarDayView: View {
    let date: Date
    let calendarManager: CalendarManager

    @State private var selectedEvent: CalendarEvent?

    // Computed property that reacts to calendarManager.events changes
    private var events: [CalendarEvent] {
        let calendar = Calendar.current
        return calendarManager.events.filter { event in
            calendar.isDate(event.startDate, inSameDayAs: date)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Date header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(dayOfWeek)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(isWeekend ? .secondary : .primary)

                    Text(dayNumber)
                        .font(.title2)
                        .fontWeight(isToday ? .bold : .semibold)
                        .foregroundColor(isToday ? .blue : .primary)

                    Text(monthYear)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // Past day checkmark
                if isPastDay && !isToday {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.title3)
                }
            }

            // Events for this day
            if !events.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(events) { event in
                        CalendarEventRowView(event: event) {
                            print("🟢 Setting selectedEvent to: \(event.title)")
                            selectedEvent = event
                        }
                    }
                }
            }

            Divider()
                .padding(.top, 4)
        }
        .padding(.vertical, 8)
        .background(backgroundColor)
        .sheet(item: $selectedEvent) { event in
            EventDetailView(event: event)
                .onAppear {
                    print("🟡 Sheet presenting with event: \(event.title)")
                }
        }
    }

    private var dayOfWeek: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        return formatter.string(from: date)
    }

    private var dayNumber: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: date)
    }

    private var monthYear: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM yyyy"
        return formatter.string(from: date)
    }

    private var isToday: Bool {
        Calendar.current.isDateInToday(date)
    }

    private var isPastDay: Bool {
        date < Date() && !isToday
    }

    private var isWeekend: Bool {
        let weekday = Calendar.current.component(.weekday, from: date)
        return weekday == 1 || weekday == 7 // Sunday or Saturday
    }

    private var backgroundColor: Color {
        if isToday {
            return .blue.opacity(0.1)
        } else if isWeekend {
            return .gray.opacity(0.05)
        } else {
            return .clear
        }
    }
}

struct CalendarEventRowView: View {
    let event: CalendarEvent
    let onTap: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                if let timeText = event.displayTime {
                    Text(timeText)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .fontWeight(.medium)
                } else if event.isAllDay {
                    Text("All Day")
                        .font(.caption)
                        .foregroundColor(.white)
                        .fontWeight(.medium)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.blue)
                        .cornerRadius(4)
                }
            }
            .frame(width: 60, alignment: .leading)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(event.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)

                    Spacer()

                    Text(event.emoji)
                        .font(.subheadline)
                }

                if let location = event.location, !location.isEmpty {
                    Label(location, systemImage: "location")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()
        }
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isButton)
        .onTapGesture {
            print("🔵 Event tapped: \(event.title)")
            onTap()
        }
    }
}

// SwiftUI Previews
#Preview("Linear Calendar") {
    ContentView()
}

#Preview("Single Day") {
    let manager = CalendarManager()
    manager.loadSampleData()
    return CalendarDayView(
        date: Date(),
        calendarManager: manager
    )
    .padding()
}
