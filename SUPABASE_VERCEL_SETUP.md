# 🚀 QuickFlip AI - Supabase + Vercel Setup Guide

## Overview
This guide will help you migrate from the complex Firebase/Google Cloud setup to a simple Supabase + Vercel deployment in under 30 minutes.

## 🎯 Why This Approach is Better

### **Supabase Advantages:**
- ✅ **Instant setup** - No complex configuration
- ✅ **PostgreSQL database** - Production-ready
- ✅ **Built-in auth** - User management included
- ✅ **Real-time subscriptions** - Live updates
- ✅ **Row Level Security** - Built-in security
- ✅ **Auto-generated APIs** - REST and GraphQL

### **Vercel Advantages:**
- ✅ **Zero-config deployment** - Connect GitHub repo
- ✅ **Automatic deployments** - Every push deploys
- ✅ **Edge functions** - Serverless API
- ✅ **Global CDN** - Fast worldwide access
- ✅ **Free tier** - Perfect for MVP

## 📋 Step-by-Step Setup

### Step 1: Set up Supabase (5 minutes)

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `quickflip-ai`
   - Set database password
   - Choose region closest to you
   - Click "Create new project"

2. **Get Connection Details:**
   - Go to Settings → API
   - Copy the following:
     - Project URL
     - Anon public key
     - Service role key (keep secret)

3. **Create Database Tables:**
   ```sql
   -- Users table (handled by Supabase Auth)
   
   -- Car Listings table
   CREATE TABLE car_listings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     title TEXT NOT NULL,
     description TEXT,
     price DECIMAL(10,2),
     make TEXT,
     model TEXT,
     year INTEGER,
     mileage INTEGER,
     condition TEXT,
     images TEXT[],
     status TEXT DEFAULT 'active',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Car Analyses table
   CREATE TABLE car_analyses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     listing_id UUID REFERENCES car_listings(id),
     analysis_data JSONB,
     ai_recommendations JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Enable Row Level Security
   ALTER TABLE car_listings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE car_analyses ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view their own listings" ON car_listings
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert their own listings" ON car_listings
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update their own listings" ON car_listings
     FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete their own listings" ON car_listings
     FOR DELETE USING (auth.uid() = user_id);
   ```

### Step 2: Update Environment Variables

Create a `.env` file in the backend directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
ALLOWED_ORIGINS=["http://localhost:3000", "https://your-app.vercel.app"]

# AI API Keys (Optional for MVP)
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Platform Integration (Content Generation Only)
# Note: Facebook Marketplace, Craigslist, and OfferUp don't have official APIs
# We focus on generating optimized content for manual posting

# Debug mode
DEBUG=true
```

### Step 3: Deploy to Vercel (15 minutes)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Migrate to Supabase + Vercel"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings:
     - Framework Preset: Other
     - Root Directory: ./
     - Build Command: `pip install -r backend/requirements.txt`
     - Output Directory: backend
     - Install Command: `pip install -r backend/requirements.txt`

3. **Set Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file
   - Make sure to set them for Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your API will be available at: `https://your-project.vercel.app`

### Step 4: Update Frontend (5 minutes)

1. **Update API URL:**
   In `frontend/src/utils/api.ts`, update the base URL:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-project.vercel.app';
   ```

2. **Deploy Frontend:**
   - Push frontend changes to GitHub
   - Vercel will automatically deploy the frontend
   - Your app will be live at: `https://your-project.vercel.app`

## 🎉 What You Get

### **Backend Features:**
- ✅ User authentication (Supabase Auth)
- ✅ Car listing CRUD operations
- ✅ Car analysis storage
- ✅ Real-time updates
- ✅ Row-level security
- ✅ Auto-generated REST API

### **Frontend Features:**
- ✅ Modern React/Next.js UI
- ✅ Real-time data sync
- ✅ User authentication flow
- ✅ Car listing management
- ✅ Responsive design

### **Deployment Benefits:**
- ✅ Global CDN for fast loading
- ✅ Automatic deployments
- ✅ SSL certificates included
- ✅ Custom domain support
- ✅ Analytics and monitoring

## 🔧 Testing Your Setup

1. **Test Backend:**
   ```bash
   curl https://your-project.vercel.app/docs
   ```

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try creating an account
   - Test car listing features

3. **Test Database:**
   - Go to Supabase Dashboard
   - Check Tables section
   - Verify data is being created

## 🚀 Next Steps

Once this is working, you can add:
- AI car analysis integration
- Platform posting features
- Email notifications
- Advanced analytics
- Mobile app

## 💡 Tips

- **Start Simple:** Focus on core features first
- **Use Supabase Auth:** Don't build custom auth
- **Leverage RLS:** Let Supabase handle security
- **Monitor Usage:** Stay within free tier limits
- **Backup Data:** Export data regularly

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors:** Check ALLOWED_ORIGINS in environment
2. **Database Connection:** Verify Supabase credentials
3. **Build Failures:** Check Python dependencies
4. **Auth Issues:** Ensure Supabase Auth is enabled

### Support:
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- QuickFlip Issues: Create GitHub issue

---

**Time to Complete:** ~30 minutes
**Cost:** Free tier (Supabase + Vercel)
**Complexity:** Low
**Maintenance:** Minimal
