import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
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
        virtualizer.scrollToIndex(index, { 
          align: 'start',
          behavior: 'smooth'
        })
      }
    },
    scrollToToday: () => {
      const today = new Date()
      const todayString = today.toDateString()
      const index = allDays.findIndex(d => d.toDateString() === todayString)
      if (index !== -1) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        
        virtualizer.scrollToIndex(index, { 
          align: 'start',
          behavior: 'smooth'
        })
        
        // On mobile, add fallback check after scroll attempt
        if (isMobile) {
          setTimeout(() => {
            const actualPosition = virtualizer.scrollElement?.scrollTop || 0
            const expectedItem = virtualizer.getVirtualItems().find(item => item.index === index)
            if (!expectedItem || Math.abs(actualPosition - expectedItem.start) > 100) {
              virtualizer.scrollToIndex(index, { 
                align: 'start',
                behavior: 'auto' // Use instant scroll for retry
              })
            }
          }, 500)
        }
      }
    }
  }), [allDays, virtualizer])

  // Auto-scroll to today on mount
  useEffect(() => {
    // Add a small delay to ensure virtualizer is fully ready
    const timer = setTimeout(() => {
      const today = new Date()
      const todayString = today.toDateString()
      const index = allDays.findIndex(d => d.toDateString() === todayString)
      
      if (index !== -1 && allDays.length > 0) {
        virtualizer.scrollToIndex(index, { 
          align: 'start', 
          behavior: 'auto' 
        })
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [allDays, virtualizer])

  // Get virtual items
  const virtualItems = virtualizer.getVirtualItems()

  // Find current month header - look at middle of visible range instead of first item
  const currentMonthHeader = useMemo(() => {
    if (virtualItems.length === 0) return null
    
    // Look at the item that's roughly in the middle of the visible range
    // This accounts for the header offset better
    const middleIndex = Math.floor(virtualItems.length / 3) // Use first third instead of very first
    const targetItem = virtualItems[middleIndex] || virtualItems[0]
    const targetDate = allDays[targetItem.index]
    
    if (!targetDate) return null
    
    return {
      month: targetDate.toLocaleString('default', { month: 'long' }),
      year: targetDate.getFullYear()
    }
  }, [virtualItems, allDays])

  return (
    <div className="relative" style={{ height: '100%' }}>
      {/* Sticky month header - positioned outside virtual container */}
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
        {/* Only render visible days */}
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