/**
 * Returns an appropriate emoji for a calendar event based on it    retu  if (
    (lowerTitle.includes('date') || lowerTitle.includes('romantic')) &&
    !lowerTitle.includes('dinner') &&
    !lowerTitle.includes('lunch') &&
    !lowerTitle.includes('breakfast')
  )
    return '�'👩‍👧‍👦' title
 * More specific matches are checked first to avoid conflicts
 */
export const getEventEmoji = (title: string): string => {
  const lowerTitle = title.toLowerCase()

  // People - specific names first (highest priority)
  if (lowerTitle.includes('nadine')) return '👩'

  // Religious & Spiritual (high priority)
  if (
    lowerTitle.includes('church') ||
    lowerTitle.includes('service') ||
    lowerTitle.includes('mass')
  )
    return '⛪'
  if (lowerTitle.includes('prayer') || lowerTitle.includes('worship'))
    return '🙏'

  // Travel & Vacation
  if (
    lowerTitle.includes('vacation') ||
    lowerTitle.includes('holiday') ||
    lowerTitle.includes('trip')
  )
    return '🏖️'
  if (lowerTitle.includes('flight') || lowerTitle.includes('plane')) return '✈️'
  if (lowerTitle.includes('hotel') || lowerTitle.includes('accommodation'))
    return '🏨'

  // Exercise & Sports
  if (lowerTitle.includes('swim') || lowerTitle.includes('pool')) return '🏊'
  if (
    lowerTitle.includes('gym') ||
    lowerTitle.includes('workout') ||
    lowerTitle.includes('fitness')
  )
    return '💪'
  if (lowerTitle.includes('pilates') || lowerTitle.includes('yoga')) return '🧘'
  if (lowerTitle.includes('run') || lowerTitle.includes('jog')) return '🏃'
  if (lowerTitle.includes('bike') || lowerTitle.includes('cycle')) return '🚴'
  if (lowerTitle.includes('tennis')) return '🎾'
  if (lowerTitle.includes('football') || lowerTitle.includes('soccer'))
    return '⚽'
  if (lowerTitle.includes('golf')) return '⛳'

  // Medical & Health - most specific matches first
  if (lowerTitle.includes('therapy') || lowerTitle.includes('counseling'))
    return '💭'
  if (lowerTitle.includes('dentist') || lowerTitle.includes('dental'))
    return '🦷'
  if (lowerTitle.includes('hospital') || lowerTitle.includes('surgery'))
    return '🏥'
  // General medical appointments
  if (
    lowerTitle.includes('doctor') ||
    lowerTitle.includes('appointment') ||
    lowerTitle.includes('medical')
  )
    return '👩‍⚕️'

  // Family & Personal - check family context first
  if (
    lowerTitle.includes('family') ||
    lowerTitle.includes('kids') ||
    lowerTitle.includes('children')
  )
    return '👩‍👧‍👦'

  // Birthday gets priority over generic party
  if (lowerTitle.includes('birthday')) return '🎂'

  // Food & Social - specific matches first, avoiding conflicts with date/romantic
  if (lowerTitle.includes('wedding')) return '💒'
  // Check for romantic context but not food context
  if (
    (lowerTitle.includes('date') || lowerTitle.includes('romantic')) &&
    !lowerTitle.includes('dinner') &&
    !lowerTitle.includes('lunch') &&
    !lowerTitle.includes('breakfast')
  )
    return '👩‍❤️‍👨' // Couple emoji for romantic dates

  // Food events
  if (
    lowerTitle.includes('dinner') ||
    lowerTitle.includes('lunch') ||
    lowerTitle.includes('breakfast')
  )
    return '🍽️'
  if (lowerTitle.includes('party') || lowerTitle.includes('celebration'))
    return '🎉'

  // Work & Business
  if (lowerTitle.includes('conference') || lowerTitle.includes('summit'))
    return '🏢'
  if (lowerTitle.includes('meeting') || lowerTitle.includes('workshop'))
    return '💼'
  if (lowerTitle.includes('training') || lowerTitle.includes('course'))
    return '📚'
  if (lowerTitle.includes('presentation') || lowerTitle.includes('demo'))
    return '📊'

  // Entertainment & Culture
  if (
    lowerTitle.includes('movie') ||
    lowerTitle.includes('cinema') ||
    lowerTitle.includes('film')
  )
    return '🎬'
  if (lowerTitle.includes('concert') || lowerTitle.includes('music'))
    return '🎵'
  if (lowerTitle.includes('theater') || lowerTitle.includes('show')) return '🎭'
  if (lowerTitle.includes('museum') || lowerTitle.includes('gallery'))
    return '🏛️'
  if (lowerTitle.includes('festival')) return '🎪'

  // Other Personal activities
  if (lowerTitle.includes('school') || lowerTitle.includes('education'))
    return '🎓'
  if (lowerTitle.includes('shopping') || lowerTitle.includes('mall'))
    return '🛍️'
  if (lowerTitle.includes('cleaning') || lowerTitle.includes('chores'))
    return '🧹'
  if (lowerTitle.includes('garden') || lowerTitle.includes('plant')) return '🌱'

  // Default
  return '📅'
}
