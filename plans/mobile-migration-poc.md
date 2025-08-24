# Mobile Migration PoC Research Plan

## Background

The Linear Calendar web application has proven successful for ADHD-friendly time management with features like:
- Virtualized multi-year calendar view
- Live Apple Calendar integration via CalDAV
- UK school holiday tracking
- High-performance rendering with TanStack Virtual
- Print-optimized layout

However, the web format has limitations for daily mobile use. We want to explore native mobile options while preserving core functionality.

## Research Question

**Can we successfully migrate the Linear Calendar to iOS while maintaining performance and Apple Calendar integration?**

## Migration Approaches to Test

### 1. React Native Migration
**Hypothesis:** We can reuse 70-80% of existing React logic while gaining native mobile benefits.

**Technical Stack:**
- React Native + TypeScript
- Expo or bare React Native CLI
- `expo-calendar` or `react-native-calendars` for calendar access
- FlatList/SectionList for virtualization
- React Navigation for routing

**Key Advantages:**
- Familiar React patterns and TypeScript
- Reuse existing hooks, utilities, and business logic
- Faster development due to existing codebase
- Cross-platform potential (iOS + Android)

**Key Risks:**
- Performance concerns with large calendar datasets
- Calendar permission complexity
- Limited native iOS integration
- Bundle size and memory usage

### 2. SwiftUI Migration
**Hypothesis:** Native iOS development will provide better performance and calendar integration despite learning curve.

**Technical Stack:**
- SwiftUI + Swift
- EventKit for native calendar access
- LazyVStack for virtualization
- Combine for reactive programming

**Key Advantages:**
- Native performance and memory management
- Deep EventKit integration (all calendar data, permissions)
- Native iOS patterns (widgets, shortcuts, sharing)
- Better long-term iOS ecosystem integration

**Key Risks:**
- Complete rewrite required
- Swift/SwiftUI learning curve
- No code reuse from existing project
- iOS-only (no cross-platform)

## Proof of Concept Scope

### Minimal Viable PoC Requirements

Both PoCs must demonstrate:

1. **Calendar Data Loading**
   - Request iOS calendar permissions
   - Load real Apple Calendar events from user's device
   - Handle multiple calendars if present

2. **Basic Event Display**
   - Show events in chronological order
   - Display event title, date, time
   - Handle all-day vs timed events
   - No styling required - basic list is sufficient

3. **Performance Test**
   - Load at least 30 days of calendar data
   - Test scrolling performance with real event density
   - Measure initial load time

### Success Criteria

**React Native PoC Success:**
- Calendar permissions work reliably
- Events load and display within 2 seconds
- Smooth scrolling through 30+ days of events
- TypeScript integration works properly
- Development velocity feels reasonable

**SwiftUI PoC Success:**
- EventKit integration straightforward
- Native calendar access feels robust
- LazyVStack performance excellent
- Swift learning curve manageable
- Development environment setup smooth

### Failure Criteria

**Deal Breakers:**
- Cannot access calendar data reliably
- Performance significantly worse than web version
- Development complexity too high for maintainable code
- Calendar permissions too restrictive or unreliable

## Implementation Plan

### Phase 1: React Native PoC (Branch: `react-native-poc`)

**Step 1: Project Setup**
- Initialize new React Native project with TypeScript
- Install calendar access libraries
- Set up basic navigation structure

**Step 2: Calendar Integration**
- Implement calendar permission requests
- Load events from default calendar
- Handle permission denied scenarios

**Step 3: Basic UI**
- Create simple FlatList of events
- Show event details (title, date, time)
- Test scrolling performance

**Estimated Time:** 4-6 hours

### Phase 2: SwiftUI PoC (Branch: `swiftui-poc`)

**Step 1: Project Setup**
- Create new Xcode SwiftUI project
- Configure EventKit framework
- Set up basic app structure

**Step 2: EventKit Integration**
- Request calendar permissions
- Fetch events using EventStore
- Handle permission and error states

**Step 3: Basic UI**
- Create List view of events
- Display event information
- Test LazyVStack performance

**Estimated Time:** 6-8 hours (including Swift learning)

## Key Learning Objectives

### Technical Questions to Answer

1. **Calendar Integration:**
   - How reliable is calendar data access on each platform?
   - What permission limitations exist?
   - Can we access all calendar types (iCloud, Exchange, etc.)?

2. **Performance:**
   - How does virtualization perform with real calendar data?
   - What are memory usage patterns?
   - How smooth is scrolling with 365+ days?

3. **Development Experience:**
   - How much existing code can be reused in React Native?
   - How steep is the SwiftUI learning curve?
   - What's the debugging and testing experience like?

4. **Architecture:**
   - How would multi-year date ranges work?
   - Can recurring events be handled efficiently?
   - How would live calendar sync work?

### Strategic Questions to Answer

1. **Maintainability:** Which approach leads to more maintainable code?
2. **Feature Parity:** How difficult would it be to implement full feature set?
3. **User Experience:** Which provides better native iOS experience?
4. **Time Investment:** What's the realistic development timeline for each?

## Decision Framework

After completing both PoCs, we'll evaluate based on:

### Technical Feasibility (40%)
- Calendar integration reliability
- Performance with real data
- Code complexity and maintainability

### Development Velocity (30%)
- Time to basic functionality
- Learning curve steepness
- Debugging and iteration speed

### User Experience (20%)
- Native feel and performance
- iOS ecosystem integration potential
- Future feature development ease

### Strategic Fit (10%)
- Cross-platform potential
- Long-term maintenance requirements
- Skill set alignment

## Success Outcomes

**Ideal Outcome:** One approach clearly wins on technical feasibility and development velocity.

**Good Outcome:** Both approaches viable, clear trade-offs identified for informed decision.

**Learning Outcome:** Even if neither approach is immediately viable, we understand the technical challenges and requirements for future attempts.

## Next Steps After PoC

Based on results:
1. **Clear Winner:** Proceed with full migration planning
2. **Close Decision:** Build slightly more advanced PoC for tiebreaker
3. **Both Challenging:** Document learnings and revisit when technical landscape improves
4. **Both Failed:** Focus on web app mobile optimizations instead

---

**Document Created:** 2025-01-24  
**Author:** Research spike for Linear Calendar mobile migration  
**Status:** Planning phase - PoCs not yet implemented