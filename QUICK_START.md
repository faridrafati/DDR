# Quick Start Guide - DDR App with Local Supabase

This guide will help you get the Daily Drilling Report application running with a local Supabase instance in just a few minutes.

## Prerequisites

Make sure you have these installed:
- ✅ Node.js (v16 or higher)
- ✅ Docker Desktop (must be running)
- ✅ npm or yarn

## Option 1: Automated Setup (Recommended)

We've created scripts to automate the entire setup process:

```bash
# Make sure Docker is running first!

# 1. Run the setup script
./setup-local-supabase.sh

# 2. Configure environment variables
./configure-env.sh

# 3. Start the app
npm run dev
```

That's it! Open http://localhost:5173 in your browser.

## Option 2: Manual Setup

If you prefer to set things up manually:

### Step 1: Start Supabase

```bash
npm run supabase:start
```

**Note**: First-time startup takes 2-5 minutes as it downloads Docker images.

### Step 2: Get Credentials

After Supabase starts, you'll see output like:

```
Started supabase local development setup.

         API URL: http://localhost:54321
      Studio URL: http://localhost:54323
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Configure Environment

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_anon_key_here` with the actual anon key from Step 2.

### Step 4: Start the Application

```bash
npm run dev
```

Visit http://localhost:5173 and you're ready to go!

## Important URLs

Once everything is running:

- 📱 **Application**: http://localhost:5173
- 🎨 **Supabase Studio**: http://localhost:54323 (database admin panel)
- 🔌 **API**: http://localhost:54321
- 📧 **Mailpit** (test emails): http://localhost:54324

## Database Schema

The database schema is automatically applied from `supabase/migrations/20231206000000_initial_schema.sql`.

If you need to reset the database:

```bash
npm run supabase:reset
```

## Useful Commands

```bash
# Check Supabase status
npm run supabase:status

# Stop Supabase
npm run supabase:stop

# Start Supabase
npm run supabase:start

# Reset database (clears all data)
npm run supabase:reset

# Open Supabase Studio
npm run supabase:studio
```

## Creating Your First User

1. Open the app at http://localhost:5173
2. Click "Sign up"
3. Fill in the form:
   - Full Name: Your Name
   - Email: test@example.com
   - Role: Company Man or Engineer
   - Password: At least 6 characters
4. Click "Sign Up"
5. Check Mailpit at http://localhost:54324 for the confirmation email (in local development, emails are captured here)
6. Click the confirmation link or just log in directly (email confirmation can be disabled in Supabase settings)

## Creating a Daily Report

1. Log in as a Company Man
2. Click "New Report"
3. Fill in the form tabs:
   - General Data
   - Bit Data
   - ROP Data
   - Mud Data
   - Directional
   - BHA & Tools
   - Casing
   - Formations
4. Click "Submit Report"

## Viewing and Exporting Reports

1. Go to Dashboard
2. View all reports
3. Click "View" to see details
4. Click "PDF" or "Excel" to export

## Troubleshooting

### "Docker is not running"
- Make sure Docker Desktop is open and running
- On Windows/Mac: Check the Docker icon in your system tray
- On Linux: Run `sudo systemctl start docker`

### "Port already in use"
- Another service is using the required ports
- Stop the conflicting service or configure different ports in `supabase/config.toml`

### "Supabase won't start"
- Check Docker Desktop is running
- Try: `npm run supabase:stop` then `npm run supabase:start`
- Check Docker Desktop for any error messages

### "Can't connect to database"
- Make sure `.env` file exists with correct values
- Check `npm run supabase:status` to verify Supabase is running
- Verify the API URL and anon key match the output from `supabase status`

### Reset Everything
```bash
npm run supabase:stop
rm -rf supabase/.temp
npm run supabase:start
./configure-env.sh
```

## Development Workflow

1. Start Supabase: `npm run supabase:start`
2. Start the app: `npm run dev`
3. Open Supabase Studio: http://localhost:54323 (to view/edit data)
4. Make changes to your code
5. The app will hot-reload automatically
6. When done: `npm run supabase:stop`

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [SUPABASE_LOCAL.md](./SUPABASE_LOCAL.md) for advanced local dev features
- Explore [Supabase Studio](http://localhost:54323) to see your data

## Need Help?

- Check the [Supabase CLI docs](https://supabase.com/docs/guides/cli)
- Review [React Router docs](https://reactrouter.com)
- See [Vite documentation](https://vitejs.dev)

Enjoy building your Daily Drilling Reports! 🎉
