# Environment Configuration Guide

## API URL Configuration

The frontend uses the `VITE_API_URL` environment variable to determine which backend to connect to.

### Setup Instructions:

1. **Local Development:**
   Create `.env.local` file with:

   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Production Deployment:**
   Set environment variable in Netlify:

   ```
   VITE_API_URL=https://project-management-system-backend-mxy8b4tqc.vercel.app/api
   ```

3. **Staging Environment:**
   ```
   VITE_API_URL=https://your-staging-backend-url.vercel.app/api
   ```

### Current Fallback:

If no `VITE_API_URL` is set, the app defaults to the production backend URL.

### Backend URLs:

- **Local**: `http://localhost:5000/api`
- **Production**: `https://project-management-system-backend-mxy8b4tqc.vercel.app/api`
