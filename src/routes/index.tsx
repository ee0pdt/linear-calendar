import { createFileRoute } from '@tanstack/react-router'
import { LinearCalendarView } from '../components/LinearCalendarView'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return <LinearCalendarView />
}