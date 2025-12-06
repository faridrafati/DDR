# Running Supabase Locally

This guide will help you set up and run Supabase locally for development.

## Prerequisites

- Docker Desktop installed and running
- Node.js and npm installed
- Supabase CLI

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Or using homebrew (Mac/Linux):
```bash
brew install supabase/tap/supabase
```

## Step 2: Initialize Supabase in Your Project

Navigate to your project directory and initialize Supabase:

```bash
cd ddr-app
supabase init
```

This creates a `supabase` folder in your project with configuration files.

## Step 3: Start Supabase Locally

Start all Supabase services (PostgreSQL, Auth, Storage, etc.):

```bash
supabase start
```

This will:
- Download the necessary Docker images
- Start PostgreSQL database
- Start Supabase Studio (local dashboard)
- Start authentication services
- Start other required services

After it starts, you'll see output like:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Apply Database Schema

Copy the schema from the root directory and apply it:

```bash
# Copy the schema
cp ../supabase-schema.sql ./supabase/migrations/001_initial_schema.sql

# Or apply it directly to the local database
supabase db reset
```

Alternatively, you can use the Supabase Studio SQL editor:
1. Open http://localhost:54323 (Supabase Studio)
2. Go to SQL Editor
3. Paste the contents of `supabase-schema.sql`
4. Run the query

## Step 5: Configure Environment Variables

Create a `.env` file in the ddr-app directory:

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_anon_key_from_supabase_start_output
```

Replace `your_anon_key_from_supabase_start_output` with the actual anon key from the `supabase start` output.

## Step 6: Start the React Application

```bash
npm run dev
```

Your application will be available at http://localhost:5173

## Useful Supabase CLI Commands

### Check Status
```bash
supabase status
```

### Stop Supabase
```bash
supabase stop
```

### Reset Database (clears all data and reapplies migrations)
```bash
supabase db reset
```

### Access Supabase Studio
Open http://localhost:54323 in your browser to access the local Supabase dashboard where you can:
- View and edit data in tables
- Run SQL queries
- Manage authentication users
- View API logs
- Test authentication flows

### View Database Logs
```bash
supabase db logs
```

### Access PostgreSQL Directly
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres
```

## Creating Test Users

You can create test users in two ways:

### 1. Through the Application
- Navigate to http://localhost:5173/signup
- Fill in the signup form
- Check Inbucket (http://localhost:54324) for the confirmation email

### 2. Through Supabase Studio
1. Open http://localhost:54323
2. Go to Authentication → Users
3. Click "Add user"
4. Fill in email and password
5. Set the user metadata (role: companyman, engineer, or admin)

## Development Workflow

1. Start Supabase: `supabase start`
2. Start the app: `npm run dev`
3. Make changes to your code
4. Test locally
5. When ready, push schema changes to migrations

## Migrating to Production

When you're ready to deploy:

1. Link to your production Supabase project:
```bash
supabase link --project-ref your-project-ref
```

2. Push your local migrations:
```bash
supabase db push
```

3. Update your `.env` with production keys:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## Troubleshooting

### Port Already in Use
If you get port conflicts, you can stop other services or configure different ports in `supabase/config.toml`

### Docker Issues
Make sure Docker Desktop is running before starting Supabase

### Reset Everything
```bash
supabase stop
supabase start
supabase db reset
```

## Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
