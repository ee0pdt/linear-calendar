# SwiftUI Minimal Roadmap - Linear Calendar

## Goal: Replace web app, kill Railway costs, daily use ASAP

**Target:** Working iOS app in 2-3 weeks, evenings only

---

## Week 1: Web App Replacement Essentials 🎯

**Goal:** Basic daily-usable app that replaces your web version

### Must-Have Features
- [x] **Real calendar loading** (PoC ✅ working)
- [ ] **Multi-year view** (2024, 2025, 2026)
- [ ] **UK school holidays** (copy from web app)
- [ ] **Event search** (find events quickly)
- [ ] **Today navigation** (jump to current date)
- [ ] **Print to PDF** (for wall mounting)

### Implementation
- Start with working PoC codebase
- Copy `holidayUtils.ts` → Swift equivalent
- Add simple search bar to existing EventListView
- Extend date range from 30 days → 3 years
- Add PDF export using iOS print system

**End of Week 1:** Daily usable app, Railway server OFF

---

## Week 2: Quality of Life Improvements 📱

**Goal:** Make it actually better than the web version

### Nice-to-Have Features
- [ ] **Past day checkmarks** (green ticks for completed days)
- [ ] **Weekend highlighting** (like web version)
- [ ] **Event details modal** (tap for full info)
- [ ] **Pull-to-refresh** calendar sync
- [ ] **App icon & launch screen** (basic branding)
- [ ] **Settings screen** (basic preferences)

### Implementation
- Add visual styling to match web app look
- Implement simple settings with UserDefaults
- Create basic app icon (use calendar emoji if needed)
- Polish UI transitions and loading states

**End of Week 2:** Polished daily driver, ready for personal use

---

## Week 3: iOS Polish (Optional) ✨

**Goal:** Take advantage of being native iOS

### iOS-Specific Wins
- [ ] **Today widget** (simple today's events)
- [ ] **Share sheet** (export events/calendar)
- [ ] **Siri shortcut** ("Show today's events")
- [ ] **Dark mode** support
- [ ] **Accessibility** basics (VoiceOver labels)

### Implementation
- Add single widget showing today
- Use iOS share sheet for calendar export
- Donate basic Siri intents
- Test with system dark mode

**End of Week 3:** Native iOS app with ecosystem features

---

## Technical Shortcuts for Speed 🏃‍♂️

### Skip the Enterprise Stuff
- ❌ No CI/CD pipeline setup
- ❌ No App Store Connect (use TestFlight only)
- ❌ No team provisioning
- ❌ No automated testing
- ❌ No fancy architecture patterns

### Use What Works
- ✅ Build on existing PoC
- ✅ XcodeBuildMCP for builds
- ✅ Copy web app logic directly
- ✅ Simple SwiftUI patterns
- ✅ UserDefaults for settings
- ✅ Basic Core Data if needed

### Copy from Web App
**Files to migrate:**
- `dateUtils.ts` → `DateUtilities.swift`
- `holidayUtils.ts` → `HolidayUtils.swift`
- `eventUtils.ts` → `EventUtilities.swift`
- Print CSS logic → iOS print formatter

**Don't reinvent:**
- UK school holiday data (copy arrays)
- Date calculations (port functions)
- Search logic (same algorithms)
- Visual styling (match colors/fonts)

---

## Development Strategy 🛠️

### Evening Development Plan
**Time available:** ~2 hours weeknight, ~4 hours weekend
**Total per week:** ~18 hours

### Week 1 Breakdown (18 hours)
- **Monday-Tuesday (4h):** Multi-year date range + UK holidays
- **Wednesday-Thursday (4h):** Event search + today navigation
- **Weekend (10h):** Print/PDF export + polish for daily use

### Week 2 Breakdown (18 hours)
- **Monday-Tuesday (4h):** Visual styling + past day markers
- **Wednesday-Thursday (4h):** Event details modal + settings
- **Weekend (10h):** App icon + final polish

### Motivation Strategy
- **Daily dogfooding:** Use app immediately, find pain points
- **Railway shutdown:** Turn off server after week 1
- **Progress tracking:** Screenshot daily progress
- **Small wins:** Each feature immediately improves daily workflow

---

## Success Definition 📊

### Week 1 Success
- [ ] Can replace web app for daily calendar viewing
- [ ] Railway server can be shut down (save money!)
- [ ] All events from 2024-2026 visible and searchable
- [ ] Can print monthly views for wall mounting
- [ ] UK school holidays show correctly

### Week 2 Success
- [ ] App feels polished and native
- [ ] Faster to use than web version
- [ ] Works offline (cached events)
- [ ] Looks professional enough to show others

### Week 3 Success (Stretch)
- [ ] Widget on home screen saves time
- [ ] Siri integration for voice queries
- [ ] Dark mode looks great
- [ ] Could submit to App Store if desired

---

## Risk Mitigation 🔧

### If Week 1 Takes Too Long
**Fallback:** Keep core calendar view working, skip advanced features

### If Stuck on iOS-Specific Stuff
**Fallback:** Focus on feature parity with web app first

### If Print/PDF is Complex
**Fallback:** Screenshot + share functionality

### If Multi-Year Performance Issues
**Fallback:** Load one year at a time with navigation

---

## Immediate Next Steps 🚀

1. **Tonight:** Extend PoC date range from 30 days → 1 year
2. **Tomorrow:** Add basic UK school holidays display
3. **This weekend:** Add event search functionality
4. **Next week:** Print/PDF export for wall mounting

**First milestone:** Daily usable app by end of Week 1, Railway OFF

---

**This plan gets you:**
- ✅ Money saved (no Railway costs)
- ✅ Daily value immediately
- ✅ Evening-friendly development pace
- ✅ No enterprise overhead
- ✅ Working iOS app in 2-3 weeks

**Ready to start with multi-year date range tonight?**