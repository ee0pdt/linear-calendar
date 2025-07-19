# Linear Calendar with Live Apple Calendar Integration

A specialized calendar application designed for visual time management and ADHD planning needs. Displays all 365 days of the year in a linear, vertical format - perfect for understanding time progression and planning ahead.

![Linear Calendar Preview](https://via.placeholder.com/800x400/4f46e5/ffffff?text=Linear+Calendar+Preview)

## ✨ Features

### 📅 **Linear Time Visualization**

- **Multi-year support** with infinite scroll - view 2024, 2025, 2026 and beyond
- **All 365 days** displayed vertically in chronological order
- **Month separators** with clear visual hierarchy
- **Day counter** showing progress through the year (Day X of 365)
- **Past days auto-ticked** with green checkboxes for visual progress
- **Jump to Today** button works across any year

### 🖨️ **Print-Optimized Design**

- **4 A4 pages** - optimized layout for wall mounting
- **Compact styling** with readable fonts designed for printing
- **Print-friendly colors** that work in black and white
- **Physical checkbox spaces** for crossing off days manually

### 📱 **Apple Calendar Integration**

- **Live CalDAV integration** with Apple Calendar (via proxy server)
- **ICS file import** as alternative to live connection
- **Multi-year event support** - events from 2024, 2025, 2026+ all display correctly
- **Recurring events** expand across future years automatically
- **Multi-day event support** with day-by-day progress tracking
- **Time display** for scheduled events (hidden for all-day events)
- **Smart event parsing** handles both timed and all-day events
- **Visual distinction** between recurring and non-recurring events

### 🏫 **Built-in UK School Holidays**

- **Multi-year school holidays** - 2024, 2025, 2026+ term dates included
- **Visual indicators** distinguish school holidays from regular days
- **Weekend highlighting** with italic styling

### 🎯 **ADHD-Friendly Features**

- **"Jump to Today" button** for quick navigation
- **Visual time orientation** helps with time blindness
- **Progress tracking** through completed (past) days
- **Clear visual hierarchy** reduces cognitive load
- **Fast performance** with optimized loading and interactions

### ⚡ **Performance & Monitoring**

- **Progressive loading** with branded 5-stage initialization
- **Real-time Web Vitals monitoring** (FCP, LCP, CLS, INP, TTFB)
- **Performance dashboard** accessible via blue activity icon (top-right)
- **Optimized React components** with memoization for smooth scrolling
- **Modal performance tracking** for responsive interactions
- **Custom performance timers** for development insights

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/linear-calendar.git
cd linear-calendar

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run serve
```

## 📖 How to Use

### 1. **View Your Calendar**

- Scroll through multiple years (2024, 2025, 2026+) with infinite scroll
- Past days are automatically marked as completed
- Current day is highlighted (on screen only)
- Navigate between years seamlessly

### 2. **Import Your Events**

#### Live Calendar Integration:

- Generate an app-specific password at [appleid.apple.com](https://appleid.apple.com)
- Click "Connect to Apple Calendar" in the app
- Enter your Apple ID email and app-specific password
- Your calendar will update automatically with real-time data
- Events from all years (including future years) will import correctly

#### ICS File Import (Alternative):

- Export your calendar as an ICS file from Apple Calendar, Google Calendar, etc.
- Click "Choose File" at the top and select your ICS file
- Events will appear inline with their dates and times
- Recurring events will expand across multiple years automatically

### 3. **Print Your Calendar**

- Press `Ctrl+P` (or `Cmd+P` on Mac)
- Calendar automatically formats for 4 A4 pages
- Print and mount on your wall for physical planning

### 4. **Navigate Quickly**

- Use the floating blue button to "Jump to Today"
- Smooth scroll keeps you oriented in time
- Calendar automatically expands to show future years as you scroll

### 5. **Monitor Performance** (Development)

- Click the blue activity icon (top-right) to open the performance dashboard
- View real-time Web Vitals metrics (FCP, LCP, CLS, INP, TTFB)
- Check DevTools Console for detailed performance logs
- Modal interaction timing is automatically tracked

### 6. **Multi-Year Planning**

- **Infinite scroll** - calendar expands as you scroll up or down
- **Future events** - plan events in 2025, 2026, and beyond
- **Recurring events** - automatically generate future occurrences
- **Long-term planning** - see your entire schedule across multiple years

## 🎨 Visual Indicators

| Element             | Screen Appearance    | Print Appearance      | Meaning                       |
| ------------------- | -------------------- | --------------------- | ----------------------------- |
| **Past Days**       | Faded with green ✓   | Green checkbox        | Days that have passed         |
| **Today**           | Yellow highlight     | Normal (no highlight) | Current day                   |
| **Weekends**        | Italic text          | Italic text           | Saturday/Sunday               |
| **School Holidays** | Left border + 📚     | Left border           | UK school break periods       |
| **Events**          | Blue text with times | Calendar icon only    | Your imported calendar events |

## 🛠️ Technical Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **TanStack Router** - File-based routing system
- **Tailwind CSS v4** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Vitest** - Testing framework
- **Express.js** - CalDAV proxy server
- **tsdav** - CalDAV client for Apple Calendar integration

## 🚂 Deployment

### Railway Deployment (Recommended)

Both the UI and CalDAV proxy can be deployed to Railway for free hosting:

#### Quick Deploy

```bash
# Make sure Railway CLI is installed
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy everything with one command
./deploy.sh
```

#### Manual Deployment

**Deploy UI Application:**

```bash
# From project root
railway init
railway up
```

**Deploy CalDAV Proxy:**

```bash
# From caldav-proxy directory
cd caldav-proxy
railway init
railway up
```

**Configure CORS:**

```bash
# In caldav-proxy directory, set your UI URL
railway variables set FRONTEND_URL="https://your-ui-app.railway.app"
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Other Hosting Options

- **Vercel/Netlify**: Perfect for the UI (static site)
- **Heroku**: Good for both UI and proxy
- **Docker**: Use the included configurations for containerized deployment

## 📂 Project Structure

```
/
├── src/                       # React application
│   ├── components/            # Reusable components
│   ├── routes/                # File-based routing
│   │   ├── __root.tsx         # Root layout
│   │   └── index.tsx          # Main calendar component
│   ├── styles.css             # Global styles and print CSS
│   └── main.tsx               # Application entry point
│
├── caldav-proxy/              # CalDAV proxy server
│   ├── server.js              # Express server for Apple Calendar integration
│   ├── README.md              # Proxy documentation
│   └── DEPLOYMENT.md          # Railway deployment guide
│
└── public/                    # Static assets
```

## 🎯 Why Linear Calendar?

Traditional calendar views (month grids) can be challenging for people with ADHD or time management difficulties. This linear approach provides:

- **Clear time progression** - see exactly where you are in the year
- **Reduced cognitive load** - simple, consistent layout
- **Physical interaction** - print and physically cross off days
- **Progress visualization** - see how much of the year has passed
- **Context preservation** - events show in relation to the full year

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run test       # Run tests
npm run lint       # Run ESLint
npm run format     # Run Prettier
npm run check      # Auto-fix with Prettier and ESLint
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code) for rapid development
- Designed specifically for ADHD and time management needs
- Inspired by the need for better time visualization tools

---

**Made with ❤️ for better time management and planning**
