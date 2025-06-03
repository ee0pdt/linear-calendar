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
2. **Authentication Failed**: Use app-specific passwords, not regular Apple ID password
3. **Proxy Not Found**: Check Railway deployment URL
4. **Timeout**: CalDAV requests can be slow, increase timeout if needed

### Logs
```bash
railway logs
```