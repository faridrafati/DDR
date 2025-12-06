#!/bin/bash

# Daily Drilling Report - Local Supabase Setup Script

echo "🚀 Setting up local Supabase for DDR App..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if Supabase is installed
if ! npx supabase --version > /dev/null 2>&1; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install supabase --save-dev
fi

echo "✅ Supabase CLI is installed"

# Check if already initialized
if [ ! -d "supabase" ]; then
    echo "📦 Initializing Supabase..."
    npx supabase init
fi

echo "✅ Supabase initialized"

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Copy schema if it exists
if [ -f "supabase-schema.sql" ]; then
    echo "📋 Copying database schema to migrations..."
    cp supabase-schema.sql supabase/migrations/20231206000000_initial_schema.sql
    echo "✅ Schema copied"
fi

# Start Supabase
echo "🔄 Starting Supabase services (this may take a few minutes on first run)..."
npx supabase start

# Get the status and save credentials
echo ""
echo "📊 Getting Supabase status..."
npx supabase status

echo ""
echo "✅ Local Supabase is ready!"
echo ""
echo "📝 Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Update .env with the API URL and anon key from above"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "🎯 Important URLs:"
echo "   - Supabase Studio: http://localhost:54323"
echo "   - API URL: http://localhost:54321"
echo ""
