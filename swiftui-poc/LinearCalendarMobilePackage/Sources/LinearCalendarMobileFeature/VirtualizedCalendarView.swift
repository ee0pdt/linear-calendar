import SwiftUI

/// A properly virtualized calendar view that only renders visible days
/// Unlike LazyVStack which still creates all view structs, this only renders ~15 visible days
@MainActor
struct VirtualizedCalendarView: View {
    let calendarManager: CalendarManager
    let yearRange: Range<Int>

    @State private var visibleRange: Range<Int> = 0..<20
    @State private var scrollOffset: CGFloat = 0

    private let itemHeight: CGFloat = 120 // Estimated height per day
    private let overscan: Int = 5 // Extra items to render outside viewport

    private var allDays: [Date] {
        var days: [Date] = []
        let calendar = Calendar.current

        for year in yearRange {
            let startOfYear = calendar.date(from: DateComponents(year: year, month: 1, day: 1))!
            let startOfNextYear = calendar.date(from: DateComponents(year: year + 1, month: 1, day: 1))!

            var currentDate = startOfYear
            while currentDate < startOfNextYear {
                days.append(currentDate)
                currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate)!
            }
        }
        return days
    }

    var body: some View {
        GeometryReader { geometry in
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 0) {
                        // Spacer for content above visible range
                        if visibleRange.lowerBound > 0 {
                            Spacer()
                                .frame(height: CGFloat(visibleRange.lowerBound) * itemHeight)
                        }

                        // Render only visible + overscan items
                        ForEach(visibleDays, id: \.timeIntervalSince1970) { date in
                            CalendarDayView(
                                date: date,
                                events: eventsForDate(date),
                                calendarManager: calendarManager
                            )
                            .frame(minHeight: itemHeight)
                            .id(dayId(for: date))
                        }

                        // Spacer for content below visible range
                        let remainingItems = max(0, allDays.count - visibleRange.upperBound)
                        if remainingItems > 0 {
                            Spacer()
                                .frame(height: CGFloat(remainingItems) * itemHeight)
                        }
                    }
                    .background(
                        GeometryReader { scrollGeometry in
                            Color.clear
                                .preference(key: ScrollOffsetPreferenceKey.self,
                                          value: scrollGeometry.frame(in: .named("scroll")).minY)
                        }
                    )
                }
                .coordinateSpace(name: "scroll")
                .onPreferenceChange(ScrollOffsetPreferenceKey.self) { offset in
                    updateVisibleRange(for: offset, viewportHeight: geometry.size.height)
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
                            scrollToToday(proxy: proxy)
                        }
                        .fontWeight(.semibold)
                    }
                }
            }
        }
    }

    private var visibleDays: [Date] {
        let startIndex = max(0, visibleRange.lowerBound)
        let endIndex = min(allDays.count, visibleRange.upperBound)
        return Array(allDays[startIndex..<endIndex])
    }

    private func updateVisibleRange(for offset: CGFloat, viewportHeight: CGFloat) {
        let scrollPosition = abs(offset)
        let startIndex = max(0, Int(scrollPosition / itemHeight) - overscan)
        let visibleCount = Int(viewportHeight / itemHeight) + (overscan * 2)
        let endIndex = min(allDays.count, startIndex + visibleCount)

        let newRange = startIndex..<endIndex
        if newRange != visibleRange {
            visibleRange = newRange
        }
    }

    private func scrollToToday(proxy: ScrollViewReader) {
        let today = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let todayId = formatter.string(from: today)

        withAnimation(.easeInOut(duration: 0.5)) {
            proxy.scrollTo(todayId, anchor: .top)
        }
    }

    private func dayId(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    private func eventsForDate(_ date: Date) -> [CalendarEvent] {
        let calendar = Calendar.current
        return calendarManager.events.filter { event in
            calendar.isDate(event.startDate, inSameDayAs: date)
        }
    }
}

struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}