import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { EventSearch } from '../components/EventSearch'
import { LinearCalendarView } from '../components/LinearCalendarView'
import { useEvents } from '../hooks/useEvents'
import type { CalendarEvent } from '../types'

export const Route = createFileRoute('/search')({
  component: SearchRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      from: (search.from as string) || '/'
    }
  }
})

function SearchRoute() {
  const navigate = useNavigate()
  const { from } = Route.useSearch()
  const { events } = useEvents()

  const handleEventClick = (_event: CalendarEvent) => {
    // For now, just close the search modal
    // Event details will be handled differently
    handleClose()
  }

  const handleScrollToEvent = (_event: CalendarEvent) => {
    // Navigate back to main view
    // The main view will handle scrolling to the event
    navigate({ to: '/' })
  }

  const handleClose = () => {
    navigate({ to: from })
  }

  return (
    <>
      {/* Render the main calendar view in background */}
      <div className="filter blur-sm brightness-75 pointer-events-none">
        <LinearCalendarView />
      </div>
      
      {/* Render the search modal on top */}
      <div className="pointer-events-auto">
        <EventSearch
          events={events}
          onEventClick={handleEventClick}
          onScrollToEvent={handleScrollToEvent}
          isVisible={true}
          onClose={handleClose}
        />
      </div>
    </>
  )
}