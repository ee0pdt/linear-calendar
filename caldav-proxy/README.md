# Linear Calendar CalDAV Proxy

A simple proxy server that connects to Apple Calendar via CalDAV and provides a REST API for the Linear Calendar React app.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test the proxy:**
   ```bash
   curl "http://localhost:3001/api/calendar?username=your@icloud.com&password=your-app-password"
   ```

### Apple Calendar Setup

1. **Generate App-Specific Password:**
   - Go to [appleid.apple.com](https://appleid.apple.com)
   - Sign in → Security → App-Specific Passwords
   - Generate password for "Linear Calendar"

2. **Test Connection:**
   - Use your iCloud email as username
   - Use the generated app password (not your regular password)

## 📡 API Endpoints

### `GET /health`
Health check endpoint

### `GET /api/calendar`
Fetch all calendar events for the current year

**Query Parameters:**
- `username` - Your iCloud email address
- `password` - App-specific password from Apple

**Response:**
```json
{
  "success": true,
  "events": [...],
  "calendars": [...],
  "count": 42,
  "message": "Successfully retrieved 42 events from 3 calendars"
}
```

## 🚂 Railway Deployment

### Deploy to Railway

1. **Connect Repository:**
   ```bash
   # From the caldav-proxy directory
   railway login
   railway link
   ```

2. **Set Environment Variables:**
   ```bash
   railway variables set FRONTEND_URL=https://your-linear-calendar.vercel.app
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### Environment Variables

- `PORT` - Server port (Railway sets this automatically)
- `FRONTEND_URL` - Your React app URL for CORS

## 🔒 Security Notes

- Never commit real passwords to git
- Use app-specific passwords, not your Apple ID password  
- The proxy doesn't store credentials - they're passed through
- Consider adding rate limiting for production use

## 🐛 Troubleshooting

### Authentication Errors
- Make sure you're using app-specific password
- Verify your Apple ID has CalDAV enabled
- Check your internet connection

### No Events Returned
- Verify you have events in the current year
- Check that your calendars aren't empty
- Some calendar types might not be accessible via CalDAV

### CORS Errors
- Set `FRONTEND_URL` environment variable
- Make sure your React app URL is correct

## 📚 Technical Details

- Uses `tsdav` library for CalDAV protocol
- Parses ICS format with `ical` library
- Express.js REST API
- Filters events to current year only
- Handles recurring events (RRULE)