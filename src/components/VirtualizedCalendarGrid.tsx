import { useMemo, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { generateDateRangeDays } from '../utils/dateUtils'
import { CalendarDay } from './CalendarDay'
import type { CalendarEvent } from '../types'

interface VirtualizedCalendarGridProps {
  dateRange: { startYear: number; endYear: number }
  events: Array<CalendarEvent>
  todayRef?: React.RefObject<HTMLDivElement | null>
  onEventClick?: (event: CalendarEvent) => void
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
}

export interface VirtualizedCalendarGridHandle {
  scrollToDate: (date: Date) => void
  scrollToToday: () => void
}

export const VirtualizedCalendarGrid = forwardRef<
  VirtualizedCalendarGridHandle,
  VirtualizedCalendarGridProps
>(({
  dateRange,
  events,
  todayRef,
  onEventClick,
  scrollContainerRef
}, ref) => {
  const parentRef = useRef<HTMLDivElement>(null)

  // Generate all days
  const allDays = useMemo(
    () => generateDateRangeDays(dateRange.startYear, dateRange.endYear),
    [dateRange.startYear, dateRange.endYear],
  )

  // Create virtualizer
  const virtualizer = useVirtualizer({
    count: allDays.length,
    getScrollElement: () => scrollContainerRef?.current || parentRef.current,
    estimateSize: () => 60, // Estimated height of each day row
    overscan: 5, // Render 5 items above and below viewport
  })

  // Expose scroll methods via ref
  useImperativeHandle(ref, () => ({
    scrollToDate: (date: Date) => {
      const dateString = date.toDateString()
      const index = allDays.findIndex(d => d.toDateString() === dateString)
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'start', behavior: 'smooth' })
      }
    },
    scrollToToday: () => {
      const today = new Date()
      const todayString = today.toDateString()
      const index = allDays.findIndex(d => d.toDateString() === todayString)
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'start', behavior: 'smooth' })
      }
    }
  }), [allDays, virtualizer])

  // Auto-scroll to today on mount
  useEffect(() => {
    const today = new Date()
    const todayString = today.toDateString()
    const index = allDays.findIndex(d => d.toDateString() === todayString)
    if (index !== -1) {
      // Use instant scroll on mount for better UX
      virtualizer.scrollToIndex(index, { align: 'start', behavior: 'auto' })
    }
  }, []) // Only on mount

  // Get virtual items
  const virtualItems = virtualizer.getVirtualItems()

  // Track month headers that should be sticky
  const monthHeaders = useMemo(() => {
    const headers: Array<{ index: number; month: string; year: number }> = []
    let lastMonth = -1
    
    allDays.forEach((date, index) => {
      const month = date.getMonth()
      const year = date.getFullYear()
      if (month !== lastMonth || (index === 0)) {
        headers.push({
          index,
          month: date.toLocaleString('default', { month: 'long' }),
          year
        })
        lastMonth = month
      }
    })
    
    return headers
  }, [allDays])

  // Find current month for sticky header
  const currentMonthHeader = useMemo(() => {
    if (virtualItems.length === 0) return null
    
    const firstVisibleIndex = virtualItems[0].index
    const currentHeader = monthHeaders.findLast(h => h.index <= firstVisibleIndex)
    
    return currentHeader
  }, [virtualItems, monthHeaders])

  return (
    <div className="relative" style={{ height: '100%' }}>
      {/* Sticky month header */}
      {currentMonthHeader && (
        <div className="sticky top-[-8px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-2 mb-0 z-50 px-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {currentMonthHeader.month} {currentMonthHeader.year}
          </h2>
        </div>
      )}

      {/* Virtual list container */}
      <div
        ref={parentRef}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Only render visible items */}
        {virtualItems.map((virtualRow) => {
          const date = allDays[virtualRow.index]
          const isToday = 
            date.toDateString() === new Date().toDateString()

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <CalendarDay
                date={date}
                events={events}
                isToday={isToday}
                todayRef={isToday ? todayRef : undefined}
                onEventClick={onEventClick}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
})