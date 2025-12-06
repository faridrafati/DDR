# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: Daily Drilling Reports
   - Database Password: (choose a strong password)
   - Region: (select closest to your location)
5. Wait for the project to be created (takes ~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create all necessary tables, indexes, and security policies.

## Step 3: Get Your API Keys

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the left sidebar
3. You'll need two values:
   - **Project URL** (example: https://xxxxxxxxxxxxx.supabase.co)
   - **anon/public key** (starts with "eyJ...")

## Step 4: Configure Your App

1. In the project root, create a `.env` file:
   ```bash
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. Replace the values with your actual Supabase URL and anon key

## Step 5: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates if desired (optional)

## User Roles

The application supports three roles:
- **companyman**: Can create and edit their own daily reports
- **engineer**: Can view and export all reports (read-only)
- **admin**: Full access to all features

When users sign up, they default to the "companyman" role. You can change roles in the Supabase dashboard:
1. Go to **Authentication** → **Users**
2. Click on a user
3. Edit their `raw_user_meta_data` to include: `{"role": "engineer"}` or `{"role": "admin"}`

## Testing the Setup

After completing these steps, you can start the development server:
```bash
npm run dev
```

The application should connect to Supabase successfully!
