# Manual Xcode Project Creation

Since the automated project creation had issues, please create the Xcode project manually:

## Steps to Create Project in Xcode:

1. **Open Xcode**
2. **Create New Project:**
   - Choose "Create a new Xcode project"
   - Select **iOS** → **App**
   - Click **Next**

3. **Configure Project:**
   - Product Name: `LinearCalendarMobile`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Use Core Data: **Unchecked**
   - Include Tests: **Checked**
   - Organization Identifier: `com.linearcalendar.mobile`

4. **Save Location:**
   - Navigate to: `/Users/petethorne/Documents/Projects/Linear Calendar/swiftui-poc/`
   - Click **Create**

5. **Replace Generated Files:**
   The Swift files I created are ready to copy into your new project:
   - `CalendarEvent.swift`
   - `CalendarManager.swift` 
   - `EventListView.swift`
   - `ContentView.swift` (replace existing)
   - `LinearCalendarMobileApp.swift` (replace existing)

6. **Add Info.plist Permissions:**
   - Select your project in navigator
   - Go to **Info** tab
   - Add these custom iOS target properties:
     - `NSCalendarsUsageDescription`: "Linear Calendar needs access to your calendar to display and sync your events."
     - `NSCalendarsFullAccessUsageDescription`: "Linear Calendar needs full calendar access to read and display all your events."
     - `NSRemindersUsageDescription`: "Linear Calendar may access reminders associated with your calendar events."
     - `NSContactsUsageDescription`: "Linear Calendar may access contacts for event attendee information."

7. **Import EventKit Framework:**
   - Select project → target → **General** tab
   - Scroll to "Frameworks, Libraries, and Embedded Content"
   - Click **+** and add **EventKit.framework**

## Alternative: Copy Files After Creation

After creating the basic project, you can copy the Swift files I created:

```bash
# Copy Swift files into your new Xcode project
cp LinearCalendarMobile/CalendarEvent.swift [NEW_PROJECT]/LinearCalendarMobile/
cp LinearCalendarMobile/CalendarManager.swift [NEW_PROJECT]/LinearCalendarMobile/
cp LinearCalendarMobile/EventListView.swift [NEW_PROJECT]/LinearCalendarMobile/
cp LinearCalendarMobile/ContentView.swift [NEW_PROJECT]/LinearCalendarMobile/
cp LinearCalendarMobile/LinearCalendarMobileApp.swift [NEW_PROJECT]/LinearCalendarMobile/
```

The project should then build and run successfully!