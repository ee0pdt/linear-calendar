import Foundation

/**
 * Returns an appropriate emoji for a calendar event based on its title
 * More specific matches are checked first to avoid conflicts
 * Ported from the React app's emojiUtils.ts
 */
public struct EmojiUtils {

    public static func getEventEmoji(for title: String) -> String {
        let lowerTitle = title.lowercased()

        // People - specific names first (highest priority)
        if lowerTitle.contains("nadine") {
            return "👩"
        }

        // Religious & Spiritual (high priority)
        if lowerTitle.contains("church") || lowerTitle.contains("service") {
            return "⛪"
        }
        if lowerTitle.contains("prayer") || lowerTitle.contains("worship") {
            return "🙏"
        }

        // Shopping - check before travel (to avoid "shopping trip" matching "trip")
        if lowerTitle.contains("shopping") || lowerTitle.contains("mall") {
            return "🛍️"
        }

        // Travel & Vacation
        if lowerTitle.contains("vacation") || lowerTitle.contains("holiday") || lowerTitle.contains("trip") {
            return "🏖️"
        }
        if lowerTitle.contains("flight") || lowerTitle.contains("plane") {
            return "✈️"
        }
        if lowerTitle.contains("hotel") || lowerTitle.contains("accommodation") {
            return "🏨"
        }

        // Exercise & Sports
        if lowerTitle.contains("swim") || lowerTitle.contains("pool") {
            return "🏊"
        }
        if lowerTitle.contains("gym") || lowerTitle.contains("workout") || lowerTitle.contains("fitness") {
            return "💪"
        }
        if lowerTitle.contains("pilates") || lowerTitle.contains("yoga") {
            return "🧘"
        }
        if lowerTitle.contains("run") || lowerTitle.contains("jog") {
            return "🏃"
        }
        if lowerTitle.contains("bike") || lowerTitle.contains("cycle") {
            return "🚴"
        }
        if lowerTitle.contains("tennis") {
            return "🎾"
        }
        if lowerTitle.contains("football") || lowerTitle.contains("soccer") {
            return "⚽"
        }
        if lowerTitle.contains("golf") {
            return "⛳"
        }

        // Medical & Health - most specific matches first
        if lowerTitle.contains("therapy") || lowerTitle.contains("counseling") {
            return "💭"
        }
        if lowerTitle.contains("dentist") || lowerTitle.contains("dental") {
            return "🦷"
        }
        if lowerTitle.contains("hospital") || lowerTitle.contains("surgery") {
            return "🏥"
        }
        // General medical appointments
        if lowerTitle.contains("doctor") || lowerTitle.contains("appointment") || lowerTitle.contains("medical") {
            return "👩‍⚕️"
        }

        // Family & Personal - check family context first
        if lowerTitle.contains("family") || lowerTitle.contains("kids") || lowerTitle.contains("children") {
            return "👨‍👩‍👧‍👦"
        }

        // Education - check before business events
        if lowerTitle.contains("school") || lowerTitle.contains("education") {
            return "🎓"
        }

        // Birthday gets priority over generic party
        if lowerTitle.contains("birthday") {
            return "🎂"
        }

        // Food & Social - specific matches first, avoiding conflicts with date/romantic
        if lowerTitle.contains("wedding") {
            return "💒"
        }
        // Check for romantic context but not food context
        if (lowerTitle.contains("date") || lowerTitle.contains("romantic")) &&
           !lowerTitle.contains("dinner") &&
           !lowerTitle.contains("lunch") &&
           !lowerTitle.contains("breakfast") {
            return "💕"
        }

        // Food events
        if lowerTitle.contains("dinner") || lowerTitle.contains("lunch") || lowerTitle.contains("breakfast") || lowerTitle.contains("brunch") || lowerTitle.contains("meal") || lowerTitle.contains("restaurant") || lowerTitle.contains("eat") {
            return "🍽️"
        }
        if lowerTitle.contains("party") || lowerTitle.contains("celebration") {
            return "🎉"
        }

        // Work & Business
        if lowerTitle.contains("conference") || lowerTitle.contains("summit") {
            return "🏢"
        }
        if lowerTitle.contains("meeting") || lowerTitle.contains("workshop") {
            return "💼"
        }
        if lowerTitle.contains("training") || lowerTitle.contains("course") {
            return "📚"
        }
        if lowerTitle.contains("presentation") || lowerTitle.contains("demo") {
            return "📊"
        }

        // Entertainment & Culture
        if lowerTitle.contains("movie") || lowerTitle.contains("cinema") || lowerTitle.contains("film") {
            return "🎬"
        }
        if lowerTitle.contains("concert") || lowerTitle.contains("music") {
            return "🎵"
        }
        if lowerTitle.contains("theater") || lowerTitle.contains("show") {
            return "🎭"
        }
        if lowerTitle.contains("museum") || lowerTitle.contains("gallery") {
            return "🏛️"
        }
        if lowerTitle.contains("festival") {
            return "🎪"
        }

        // Other Personal activities
        if lowerTitle.contains("cleaning") || lowerTitle.contains("chores") {
            return "🧹"
        }
        if lowerTitle.contains("garden") || lowerTitle.contains("plant") {
            return "🌱"
        }

        // Default calendar emoji
        return "📅"
    }
}

// MARK: - CalendarEvent Extension
public extension CalendarEvent {
    /// Gets the appropriate emoji for this event based on its title
    var emoji: String {
        return EmojiUtils.getEventEmoji(for: title)
    }
}