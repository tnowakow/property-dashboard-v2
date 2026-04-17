# Railway Deployment Guide

## Option 1: Deploy via Railway Dashboard (Recommended)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select the repository containing this project
4. Railway will auto-detect it as a Vite/React app
5. Add environment variables:
   - `VITE_SUPABASE_URL=https://jmkwrxtxfkvydjmlrmya.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
6. Click "Deploy"

## Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to project directory
cd dashboard-v2

# Initialize Railway (if not already done)
railway init

# Add environment variables
railway variables set VITE_SUPABASE_URL=https://jmkwrxtxfkvydjmlrmya.supabase.co
railway variables set VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Deploy
railway up
```

## After Deployment

Railway will provide you with a URL like:
`https://your-project-name.up.railway.app`

The dashboard will be live and accessible at that URL.

## Updating the Deployment

After making changes locally:

```bash
# Commit your changes
git add .
git commit -m "Your changes"
git push origin main

# Railway auto-deploys on git push!
```
