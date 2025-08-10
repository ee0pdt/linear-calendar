import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { NavigationModal } from '../components/NavigationModal'
import { LinearCalendarView } from '../components/LinearCalendarView'
import { useState } from 'react'

export const Route = createFileRoute('/navigation')({
  component: NavigationRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      from: (search.from as string) || '/'
    }
  }
})

function NavigationRoute() {
  const navigate = useNavigate()
  const { from } = Route.useSearch()
  
  // These should ideally come from a global context or store
  const currentYear = new Date().getFullYear()
  const [dateRange] = useState({
    startYear: currentYear - 1,
    endYear: currentYear + 1,
  })

  const handleNavigateToYear = (year: number) => {
    // This logic should be handled by the parent component
    // For now, just navigate back with the year as a query param
    navigate({ 
      to: '/', 
      search: { targetYear: year }
    })
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
      
      {/* Render the navigation modal on top */}
      <div className="pointer-events-auto">
        <NavigationModal
          currentYear={currentYear}
          dateRange={dateRange}
          onNavigateToYear={handleNavigateToYear}
          onClose={handleClose}
        />
      </div>
    </>
  )
}