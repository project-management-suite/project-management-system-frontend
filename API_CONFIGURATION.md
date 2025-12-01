# 🔧 API Configuration Guide

## Current Configuration Status

### 🔧 Fixed Issues:

1. ✅ **Localhost Port**: Changed from port 3000 → 5000 in `src/lib/api.ts`
2. ✅ **Node Version**: Updated netlify.toml to use Node 20
3. ✅ **Environment Variable**: Added VITE_API_URL to netlify.toml

### ⚠️ Production Deployment Required

**The frontend is currently configured to call `localhost:5000/api`, which will only work for local development.**

## Next Steps for Production:

### Option 1: Deploy Backend First (Recommended)

1. Deploy your backend (project-management-system-backend) to a cloud service:

   - **Heroku**: Simple deployment with git
   - **Railway**: Modern alternative to Heroku
   - **Render**: Free tier available
   - **Digital Ocean App Platform**: Easy deployment
   - **AWS/GCP/Azure**: More complex but scalable

2. Once deployed, update the API URL in Netlify:
   - Go to your Netlify site dashboard
   - Navigate to **Site settings > Environment variables**
   - Update `VITE_API_URL` to your deployed backend URL:
     ```
     VITE_API_URL=https://your-backend-app.herokuapp.com/api
     ```

### Option 2: Use ngrok for Quick Testing

For temporary testing, you can expose your local backend:

```bash
# Install ngrok
npm install -g ngrok

# Expose local backend (run this when your backend is running)
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update Netlify environment variable:
# VITE_API_URL=https://abc123.ngrok.io/api
```

## Current Frontend Status:

- ✅ Node version fixed (20)
- ✅ Package conflicts resolved
- ✅ Local API calls fixed (localhost:5000)
- ⚠️ **Still needs backend deployment URL for production**

## Backend Deployment Required:

Your `project-management-system-backend` needs to be deployed to a cloud service. Once deployed, update the `VITE_API_URL` environment variable in Netlify with the production backend URL.
