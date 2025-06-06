# Deploying Linear Calendar UI to Railway

## 🚂 Railway Deployment Steps

### Prerequisites

- Railway CLI installed: `npm install -g @railway/cli`
- Railway account at https://railway.app

### 1. Login to Railway

```bash
railway login
```

### 2. Deploy from Root Directory

From the project root directory (not the caldav-proxy subdirectory):

```bash
# Initialize Railway project
railway init

# Deploy the application
railway up
```

### 3. Configure Environment (Optional)

The app will work without additional environment variables, but you can set custom configurations:

```bash
# Set custom port (Railway will override this automatically)
railway variables set PORT=3000

# Set Node environment
railway variables set NODE_ENV=production
```

### 4. Get Your Deployment URL

```bash
railway status
```

## 🔗 Update CalDAV Proxy CORS

After deploying the UI, update your CalDAV proxy's FRONTEND_URL environment variable to include your new Railway URL:

```bash
# In the caldav-proxy directory
cd caldav-proxy
railway variables set FRONTEND_URL="https://your-ui-app.railway.app"
```

Or if you have multiple frontends:

```bash
railway variables set FRONTEND_URL="https://your-ui-app.railway.app,http://localhost:3000"
```

## 📝 Deployment Notes

- **Build Process**: Railway automatically runs `npm install` and `npm start`
- **Static Assets**: Built files are served from the `dist` directory
- **HTTPS**: Railway provides HTTPS automatically
- **Custom Domains**: Can be configured in Railway dashboard
- **Scaling**: Railway handles scaling automatically

## 🏗️ Architecture

Your complete setup will have:

1. **UI App**: `https://your-ui-app.railway.app` (this deployment)
2. **CalDAV Proxy**: `https://caldav-proxy-production.up.railway.app` (already deployed)

## 🔍 Health Check

Test your deployment:

```bash
curl "https://your-ui-app.railway.app"
```

## 💰 Railway Free Tier

Railway's free tier includes:

- 500 hours of usage per month
- $5 credit per month
- Automatic sleep after 1 hour of inactivity
- Custom domains available

## 🛠️ Troubleshooting

1. **Build Failures**: Check Railway logs in the dashboard
2. **CORS Issues**: Ensure CalDAV proxy FRONTEND_URL is updated
3. **Port Issues**: Railway automatically assigns PORT environment variable
4. **Asset Loading**: Ensure `vite.config.js` has correct base path configuration

## 🔄 Future Deployments

For subsequent deployments:

```bash
# From project root
railway up
```

The app will be automatically rebuilt and redeployed.
