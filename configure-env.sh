#!/bin/bash

# Script to automatically configure .env file with local Supabase credentials

echo "🔧 Configuring environment variables for local Supabase..."

# Check if Supabase is running
if ! npx supabase status > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Please start it first with: npx supabase start"
    exit 1
fi

# Get Supabase credentials
API_URL=$(npx supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(npx supabase status | grep "anon key" | awk '{print $3}')

if [ -z "$API_URL" ] || [ -z "$ANON_KEY" ]; then
    echo "❌ Could not retrieve Supabase credentials"
    exit 1
fi

# Create .env file
cat > .env <<EOF
# Local Supabase Configuration
# Generated automatically on $(date)

VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Configuration:"
echo "   API URL: $API_URL"
echo "   Anon Key: ${ANON_KEY:0:20}..."
echo ""
echo "🎯 You can now run: npm run dev"
