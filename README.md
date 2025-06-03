# Linear Calendar

A specialized calendar application designed for visual time management and ADHD planning needs. Displays all 365 days of the year in a linear, vertical format - perfect for understanding time progression and planning ahead.

![Linear Calendar Preview](https://via.placeholder.com/800x400/4f46e5/ffffff?text=Linear+Calendar+Preview)

## ✨ Features

### 📅 **Linear Time Visualization**
- **All 365 days** displayed vertically in chronological order
- **Month separators** with clear visual hierarchy
- **Day counter** showing progress through the year (Day X of 365)
- **Past days auto-ticked** with green checkboxes for visual progress

### 🖨️ **Print-Optimized Design**
- **4 A4 pages** - optimized layout for wall mounting
- **Compact styling** with readable fonts designed for printing
- **Print-friendly colors** that work in black and white
- **Physical checkbox spaces** for crossing off days manually

### 📱 **Apple Calendar Integration**
- **Import ICS files** from Apple Calendar, Google Calendar, or any calendar app
- **Multi-day event support** with day-by-day progress tracking
- **Time display** for scheduled events (hidden for all-day events)
- **Smart event parsing** handles both timed and all-day events

### 🏫 **Built-in UK School Holidays**
- **2025 school term dates** pre-loaded for UK/Oxfordshire
- **Visual indicators** distinguish school holidays from regular days
- **Weekend highlighting** with italic styling

### 🎯 **ADHD-Friendly Features**
- **"Jump to Today" button** for quick navigation
- **Visual time orientation** helps with time blindness
- **Progress tracking** through completed (past) days
- **Clear visual hierarchy** reduces cognitive load

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
- Scroll through all 365 days of the year
- Past days are automatically marked as completed
- Current day is highlighted (on screen only)

### 2. **Import Your Events**
- Export your calendar as an ICS file from Apple Calendar, Google Calendar, etc.
- Click "Choose File" at the top and select your ICS file
- Events will appear inline with their dates and times

### 3. **Print Your Calendar**
- Press `Ctrl+P` (or `Cmd+P` on Mac)
- Calendar automatically formats for 4 A4 pages
- Print and mount on your wall for physical planning

### 4. **Navigate Quickly**
- Use the floating blue button to "Jump to Today"
- Smooth scroll keeps you oriented in time

## 🎨 Visual Indicators

| Element | Screen Appearance | Print Appearance | Meaning |
|---------|------------------|------------------|---------|
| **Past Days** | Faded with green ✓ | Green checkbox | Days that have passed |
| **Today** | Yellow highlight | Normal (no highlight) | Current day |
| **Weekends** | Italic text | Italic text | Saturday/Sunday |
| **School Holidays** | Left border + 📚 | Left border | UK school break periods |
| **Events** | Blue text with times | Calendar icon only | Your imported calendar events |

## 🛠️ Technical Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **TanStack Router** - File-based routing system
- **Tailwind CSS v4** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Vitest** - Testing framework

## 📂 Project Structure

```
src/
├── components/          # Reusable components
├── routes/             # File-based routing
│   ├── __root.tsx     # Root layout
│   └── index.tsx      # Main calendar component
├── styles.css         # Global styles and print CSS
└── main.tsx           # Application entry point
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