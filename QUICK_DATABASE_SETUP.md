# 🚀 Quick Database Setup for Beta Signups

## ⚡ **5-Minute Setup**

### **Step 1: Go to Supabase Dashboard**
1. Open your browser and go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your project (or create one if you don't have one)

### **Step 2: Open SQL Editor**
1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### **Step 3: Run the Database Setup**
1. Copy the entire contents of `BETA_SIGNUP_DATABASE_SETUP.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** (or press Ctrl+Enter)

### **Step 4: Verify Setup**
1. Go to **"Table Editor"** in the left sidebar
2. You should see a new table called `beta_signups`
3. The table should be empty (no rows yet)

### **Step 5: Test the System**
1. Go back to your website: `localhost:3000/beta-signup`
2. Fill out the form and submit
3. Go to: `localhost:3000/admin/beta-signups`
4. You should see the signup data!

---

## 🔧 **If You Don't Have Supabase Set Up Yet**

### **Create a New Supabase Project:**
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose your organization
4. Project name: `accorria-beta`
5. Set a database password (save this!)
6. Choose a region close to you
7. Click **"Create new project"**

### **Get Your Credentials:**
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### **Update Your Environment Variables:**
1. Open your `.env.local` file in the frontend folder
2. Add these lines:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
3. Save the file
4. Restart your development server (`npm run dev`)

---

## ✅ **What This Setup Creates**

### **Database Table: `beta_signups`**
- Stores all signup information
- Tracks email, role, source, focus area
- Records IP address, user agent, referrer
- Captures UTM parameters for marketing
- Includes timestamps and status tracking

### **Admin Dashboard Features:**
- View all signups in real-time
- Update user status (pending → invited → active)
- Export data to CSV
- View statistics and trends

### **API Endpoints:**
- `POST /api/beta-signup` - Handle new signups
- `GET /api/beta-signup` - Check existing emails
- Full error handling and validation

---

## 🎯 **After Setup - Test Everything**

### **1. Test Signup Form:**
- Go to: `localhost:3000/beta-signup`
- Fill out the form with your email
- Submit and verify success message

### **2. Check Admin Dashboard:**
- Go to: `localhost:3000/admin/beta-signups`
- You should see your test signup
- Try updating the status

### **3. Verify Data Storage:**
- Go to Supabase → Table Editor → beta_signups
- You should see your signup data

---

## 🚨 **Troubleshooting**

### **"Database table not set up yet" Error:**
- Make sure you ran the SQL setup script
- Check that the table exists in Supabase Table Editor

### **"Failed to load signups" Error:**
- Check your environment variables are correct
- Verify your Supabase project is active
- Make sure the anon key has the right permissions

### **Signup Form Not Working:**
- Check browser console for errors
- Verify the API endpoint is accessible
- Make sure Supabase credentials are correct

---

## 🎉 **You're Done!**

Once you complete this setup:
- ✅ All signups will be stored in the database
- ✅ You can view them in the admin dashboard
- ✅ You can export the data
- ✅ You can track user status and engagement

**Your early access tracking system will be fully operational!** 🚀
