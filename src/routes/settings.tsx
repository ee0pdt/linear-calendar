import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SettingsPanel } from '../components/SettingsPanel'
import { LinearCalendarView } from '../components/LinearCalendarView'

export const Route = createFileRoute('/settings')({
  component: SettingsRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      from: (search.from as string) || '/'
    }
  }
})

function SettingsRoute() {
  const navigate = useNavigate()
  const { from } = Route.useSearch()

  const handleClose = () => {
    navigate({ to: from })
  }

  return (
    <>
      {/* Render the main calendar view in background */}
      <div className="filter blur-sm brightness-75 pointer-events-none">
        <LinearCalendarView />
      </div>
      
      {/* Render the settings modal on top */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black opacity-30 dark:bg-black dark:opacity-50" 
          onClick={handleClose}
        />
        
        {/* Modal content */}
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-100 z-10">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <SettingsPanel />
        </div>
      </div>
    </>
  )
}