# Deploying CalDAV Proxy to Railway

## 🚂 Railway Deployment Steps

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

### 3. Create New Project

From the `caldav-proxy` directory:

```bash
railway init
```

### 4. Deploy

```bash
railway up
```

### 5. Set Environment Variables

```bash
# Set your React app URL for CORS
railway variables set FRONTEND_URL=https://your-linear-calendar.vercel.app

# Or for local development
railway variables set FRONTEND_URL=http://localhost:5173
```

### 6. Get Your Deployment URL

```bash
railway status
```

## 🔗 Connect React App

Update your React app's environment variables:

### Development (.env.local)

```bash
REACT_APP_CALDAV_PROXY_URL=http://localhost:3001
```

### Production

Set in Vercel/Netlify dashboard:

```bash
REACT_APP_CALDAV_PROXY_URL=https://your-railway-app.railway.app
```

## 🧪 Testing

### Test Locally

```bash
# Start proxy server
npm run dev

# Test endpoint
curl "http://localhost:3001/api/calendar?username=test@icloud.com&password=test-password"
```

### Test Production

```bash
curl "https://your-railway-app.railway.app/health"
```

## 🔒 Security Notes

- Railway provides HTTPS automatically
- Never log or store user credentials
- Consider adding rate limiting for production
- Monitor usage to stay within Railway's free tier

## 💰 Railway Free Tier

- 500 hours/month execution time
- $5 credit (enough for personal use)
- Sleeps after 30 minutes of inactivity
- Automatically wakes on request

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `FRONTEND_URL` is set correctly
   - Add all your frontend URLs to the CORS whitelist

   ```bash
   # For multiple frontend URLs
   railway variables set FRONTEND_URL="https://app1.com,https://app2.com"
   ```

2. **Authentication Failed**: Use app-specific passwords, not regular Apple ID password
   - Generate app-specific passwords at [appleid.apple.com](https://appleid.apple.com)
   - Security → App-Specific Passwords → "+" icon
   - Label it "Linear Calendar" and copy the generated password

3. **Missing Events or All-Day Detection Issues**:
   - Check logs for any parsing errors
   - The CalDAV proxy uses multiple detection methods for all-day events:
     - Date-only values with no time component
     - Multi-day events with 00:00:00 start/end times
     - Events spanning full days

4. **Railway Deployment Errors**:
   - Check application status and logs
   ```bash
   railway status
   railway logs
   ```

   - Restart service if needed
   ```bash
   railway service restart
   ```

### Viewing Logs

```bash
# View recent logs
railway logs

# Follow logs in real-time
railway logs --follow
```

## 📊 Stats and Monitoring

The API returns detailed stats in the response:

```json
{
  "stats": {
    "currentYear": 2025,
    "calendarsFound": 3,
    "totalEventsFetched": 420,
    "eventsInCurrentYear": 256,
    "calendarBreakdown": [
      { "name": "Personal", "eventCount": 186 },
      { "name": "Work", "eventCount": 70 }
    ],
    "allDayEvents": 42,
    "timedEvents": 214,
    "recurringEvents": 35
  }
}
```
