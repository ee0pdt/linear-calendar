# Linear Calendar

A high-performance, ADHD-friendly calendar that displays all 365+ days in a vertical timeline. Features live Apple Calendar integration, event search, and print optimization for wall mounting.

## ✨ Key Features

- **High Performance** - Virtualized rendering with TanStack Virtual for instant loading
- **Multi-Year View** - Infinite scroll through 2024, 2025, 2026+ with smooth navigation
- **Live Apple Calendar** - Real-time CalDAV sync with auto-refresh across all years
- **Event Search** - Fast search with scroll-to-event and location map links
- **ADHD Optimized** - Linear time visualization reduces cognitive load

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/linear-calendar.git
cd linear-calendar
npm install

# Start CalDAV proxy first
cd caldav-proxy
npm install
npm run dev

# Then start UI (in new terminal)
cd ..
npm run dev
```

Open `http://localhost:3000` - CalDAV proxy runs on `:3001`

## 📖 Usage

### Import Events
- **Live Apple Calendar**: Generate app-specific password at [appleid.apple.com](https://appleid.apple.com), then connect
- **ICS File**: Export from any calendar app and import

### Navigation  
- **Scroll** through infinite multi-year view
- **Search** events with instant scroll-to-result
- **Jump to Today** button for quick navigation

## 🛠️ Tech Stack

React 19 • TypeScript • TanStack Virtual • TanStack Router • Vite • Tailwind v4 • Express CalDAV Proxy

## 🚀 Development

```bash
npm run dev        # Start dev server
npm run build      # Build for production  
npm run test:all   # Run all tests
npm run lint       # Lint and format
```

## 🚂 Deploy

Railway (recommended) or Vercel/Netlify for UI + Railway/Heroku for CalDAV proxy.

## 🎯 Why Linear?

Traditional month grids are hard for ADHD minds. Linear view provides clear time progression, reduced cognitive load, and visual progress tracking - making time management actually manageable.

## ⚠️ Disclaimer

**Use at your own risk.** This is a personal project with no support provided. PRs welcome but don't expect fast reviews.

Built with [Claude Code](https://claude.ai/code) ❤️
