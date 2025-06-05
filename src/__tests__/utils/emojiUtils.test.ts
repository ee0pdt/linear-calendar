import { describe, expect, it } from 'vitest'
import { getEventEmoji } from '../../utils/emojiUtils'

describe('Emoji Utilities', () => {
  describe('getEventEmoji', () => {
    it('returns default emoji for unknown events', () => {
      expect(getEventEmoji('Random Event')).toBe('📅')
      expect(getEventEmoji('Something Unknown')).toBe('📅')
      expect(getEventEmoji('')).toBe('📅')
    })

    it('handles people-specific emojis', () => {
      expect(getEventEmoji('Meet with Nadine')).toBe('👩')
      expect(getEventEmoji('Nadine birthday')).toBe('👩')
      expect(getEventEmoji('NADINE APPOINTMENT')).toBe('👩')
    })

    it('handles religious & spiritual events', () => {
      expect(getEventEmoji('Church service')).toBe('⛪')
      expect(getEventEmoji('Sunday mass')).toBe('⛪')
      expect(getEventEmoji('Morning prayer')).toBe('🙏')
      expect(getEventEmoji('Worship session')).toBe('🙏')
    })

    it('handles travel & vacation events', () => {
      expect(getEventEmoji('Summer vacation')).toBe('🏖️')
      expect(getEventEmoji('Holiday in Spain')).toBe('🏖️')
      expect(getEventEmoji('Business trip')).toBe('🏖️')
      expect(getEventEmoji('Flight to London')).toBe('✈️')
      expect(getEventEmoji('Plane departure')).toBe('✈️')
      expect(getEventEmoji('Hotel check-in')).toBe('🏨')
      expect(getEventEmoji('Accommodation booking')).toBe('🏨')
    })

    it('handles exercise & sports events', () => {
      expect(getEventEmoji('Swimming practice')).toBe('🏊')
      expect(getEventEmoji('Pool session')).toBe('🏊')
      expect(getEventEmoji('Gym workout')).toBe('💪')
      expect(getEventEmoji('Fitness training')).toBe('💪')
      expect(getEventEmoji('Pilates session')).toBe('🧘')
      expect(getEventEmoji('Yoga class')).toBe('🧘')
      expect(getEventEmoji('Morning run')).toBe('🏃')
      expect(getEventEmoji('Evening jog')).toBe('🏃')
      expect(getEventEmoji('Bike ride')).toBe('🚴')
      expect(getEventEmoji('Cycle to work')).toBe('🚴')
      expect(getEventEmoji('Tennis match')).toBe('🎾')
      expect(getEventEmoji('Football game')).toBe('⚽')
      expect(getEventEmoji('Soccer practice')).toBe('⚽')
      expect(getEventEmoji('Golf tournament')).toBe('⛳')
    })

    it('handles medical & health events', () => {
      expect(getEventEmoji('Doctor appointment')).toBe('👩‍⚕️')
      expect(getEventEmoji('Medical checkup')).toBe('👩‍⚕️')
      expect(getEventEmoji('Dentist visit')).toBe('🦷')
      expect(getEventEmoji('Dental cleaning')).toBe('🦷')
      expect(getEventEmoji('Hospital visit')).toBe('🏥')
      expect(getEventEmoji('Surgery consultation')).toBe('🏥')
      expect(getEventEmoji('Therapy session')).toBe('💭')
      expect(getEventEmoji('Counseling appointment')).toBe('💭')
    })

    it('handles food & social events', () => {
      expect(getEventEmoji('Dinner with friends')).toBe('🍽️')
      expect(getEventEmoji('Lunch meeting')).toBe('🍽️')
      expect(getEventEmoji('Breakfast date')).toBe('🍽️')
      expect(getEventEmoji('Birthday party')).toBe('🎂')
      expect(getEventEmoji('Celebration party')).toBe('🎉')
      expect(getEventEmoji('Wedding ceremony')).toBe('💒')
      // Test romantic dates (not food related)
      expect(getEventEmoji('Romantic evening')).toBe('💕')
      expect(getEventEmoji('Date night movie')).toBe('💕')
    })

    it('handles work & business events', () => {
      expect(getEventEmoji('Tech conference')).toBe('🏢')
      expect(getEventEmoji('Summit meeting')).toBe('🏢')
      expect(getEventEmoji('Team meeting')).toBe('💼')
      expect(getEventEmoji('Workshop session')).toBe('💼')
      expect(getEventEmoji('Training course')).toBe('📚')
      expect(getEventEmoji('Presentation prep')).toBe('📊')
      expect(getEventEmoji('Demo day')).toBe('📊')
    })

    it('handles entertainment & culture events', () => {
      expect(getEventEmoji('Movie night')).toBe('🎬')
      expect(getEventEmoji('Cinema visit')).toBe('🎬')
      expect(getEventEmoji('Film screening')).toBe('🎬')
      expect(getEventEmoji('Concert tickets')).toBe('🎵')
      expect(getEventEmoji('Music festival')).toBe('🎵')
      expect(getEventEmoji('Theater show')).toBe('🎭')
      expect(getEventEmoji('Museum visit')).toBe('🏛️')
      expect(getEventEmoji('Art gallery')).toBe('🏛️')
      expect(getEventEmoji('Food festival')).toBe('🎪')
    })

    it('handles family & personal events', () => {
      expect(getEventEmoji('Family dinner')).toBe('👨‍👩‍👧‍👦')
      expect(getEventEmoji('Kids playdate')).toBe('👨‍👩‍👧‍👦')
      expect(getEventEmoji('Children party')).toBe('👨‍👩‍👧‍👦')
      expect(getEventEmoji('School meeting')).toBe('🎓')
      expect(getEventEmoji('Education conference')).toBe('🎓')
      expect(getEventEmoji('Shopping trip')).toBe('🛍️')
      expect(getEventEmoji('Mall visit')).toBe('🛍️')
      expect(getEventEmoji('House cleaning')).toBe('🧹')
      expect(getEventEmoji('Weekend chores')).toBe('🧹')
      expect(getEventEmoji('Garden work')).toBe('🌱')
      expect(getEventEmoji('Plant watering')).toBe('🌱')
    })

    it('handles case insensitivity', () => {
      expect(getEventEmoji('SWIMMING PRACTICE')).toBe('🏊')
      expect(getEventEmoji('Doctor Appointment')).toBe('👩‍⚕️')
      expect(getEventEmoji('BiRtHdAy PaRtY')).toBe('🎂')
    })

    it('handles events with multiple matching keywords (priority order)', () => {
      // More specific matches should take priority
      expect(getEventEmoji('Nadine birthday party')).toBe('👩') // Person name beats birthday
      expect(getEventEmoji('Church birthday celebration')).toBe('⛪') // Religious beats birthday
    })
  })
})
