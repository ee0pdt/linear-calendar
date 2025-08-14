import { useMemo, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { generateDateRangeDays } from '../utils/dateUtils'
import { CalendarMonth } from './CalendarMonth'
import type { CalendarEvent } from '../types'

interface VirtualizedMonthGridProps {
  dateRange: { startYear: number; endYear: number }
  events: Array<CalendarEvent>
  todayRef?: React.RefObject<HTMLDivElement | null>
  onEventClick?: (event: CalendarEvent) => void
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
}

export interface VirtualizedMonthGridHandle {
  scrollToDate: (date: Date) => void
  scrollToToday: () => void
}

export const VirtualizedMonthGrid = forwardRef<
  VirtualizedMonthGridHandle,
  VirtualizedMonthGridProps
>(({
  dateRange,
  events,
  todayRef,
  onEventClick,
  scrollContainerRef
}, ref) => {
  const parentRef = useRef<HTMLDivElement>(null)

  // Generate all days and group by month
  const monthGroups = useMemo(() => {
    const allDays = generateDateRangeDays(dateRange.startYear, dateRange.endYear)
    const groups: Array<{ key: string; days: Date[] }> = []
    
    let currentMonth = -1
    let currentYear = -1
    let currentDays: Date[] = []
    
    allDays.forEach((date) => {
      const month = date.getMonth()
      const year = date.getFullYear()
      
      if (month !== currentMonth || year !== currentYear) {
        if (currentDays.length > 0) {
          groups.push({
            key: `${currentYear}-${currentMonth + 1}`,
            days: currentDays
          })
        }
        currentMonth = month
        currentYear = year
        currentDays = []
      }
      
      currentDays.push(date)
    })
    
    // Don't forget the last month
    if (currentDays.length > 0) {
      groups.push({
        key: `${currentYear}-${currentMonth + 1}`,
        days: currentDays
      })
    }
    
    return groups
  }, [dateRange.startYear, dateRange.endYear])

  // Create virtualizer for months (not individual days)
  const virtualizer = useVirtualizer({
    count: monthGroups.length,
    getScrollElement: () => scrollContainerRef?.current || parentRef.current,
    estimateSize: () => 1860, // Estimated height of a month (31 days * 60px)
    overscan: 1, // Render 1 month above and below viewport
  })

  // Expose scroll methods via ref
  useImperativeHandle(ref, () => ({
    scrollToDate: (date: Date) => {
      const targetKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      const monthIndex = monthGroups.findIndex(g => g.key === targetKey)
      if (monthIndex !== -1) {
        virtualizer.scrollToIndex(monthIndex, { align: 'start', behavior: 'smooth' })
      }
    },
    scrollToToday: () => {
      const today = new Date()
      const targetKey = `${today.getFullYear()}-${today.getMonth() + 1}`
      const monthIndex = monthGroups.findIndex(g => g.key === targetKey)
      if (monthIndex !== -1) {
        virtualizer.scrollToIndex(monthIndex, { align: 'start', behavior: 'smooth' })
      }
    }
  }), [monthGroups, virtualizer])

  // Auto-scroll to today on mount
  useEffect(() => {
    const today = new Date()
    const targetKey = `${today.getFullYear()}-${today.getMonth() + 1}`
    const monthIndex = monthGroups.findIndex(g => g.key === targetKey)
    if (monthIndex !== -1) {
      // Use instant scroll on mount for better UX
      virtualizer.scrollToIndex(monthIndex, { align: 'start', behavior: 'auto' })
    }
  }, []) // Only on mount

  // Get virtual items
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="relative" style={{ height: '100%' }}>
      {/* Virtual list container */}
      <div
        ref={parentRef}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Only render visible months */}
        {virtualItems.map((virtualRow) => {
          const monthGroup = monthGroups[virtualRow.index]

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
              <CalendarMonth
                daysInMonth={monthGroup.days}
                events={events}
                todayRef={todayRef}
                onEventClick={onEventClick}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
})