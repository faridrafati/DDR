# DDR-App Deployment Guide

## Quick Start

### Prerequisites
- Node.js v16+ installed
- npm or yarn package manager
- Supabase account (for hosted) OR Docker (for local)

### Local Development Setup

```bash
# Clone/Navigate to project
cd /home/faridrafati/MyProject/ddr-app

# Install dependencies (already done)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Option 1: Use hosted Supabase
# - Create project at supabase.com
# - Get URL and anon key from project settings
# - Update .env file

# Option 2: Use local Supabase
./setup-local-supabase.sh

# Apply database migrations
# For local Supabase
npx supabase db reset

# For hosted Supabase
# Go to Supabase Dashboard → SQL Editor
# Run migrations in order:
# 1. supabase/migrations/20231206000000_initial_schema.sql
# 2. supabase/migrations/20250206000000_normalize_rigs_wells.sql
# 3. supabase/migrations/20251207000000_add_delphi_features.sql

# Start development server
npm run dev

# Application will be available at http://localhost:5173
```

### Database Migration

The project includes three migration files that must be applied in order:

1. **Initial Schema** (20231206000000)
   - Core tables: profiles, daily_reports, bit_records, mud_records, etc.
   - Basic RLS policies
   - Authentication triggers

2. **Rigs & Wells Normalization** (20250206000000)
   - Rigs and wells tables
   - Companyman-rig assignments
   - Enhanced access control

3. **Delphi Features** (20251207000000) ⭐ NEW
   - 18 new operational tables
   - 10 reference data tables
   - 100+ new fields across existing tables
   - Complete Delphi feature set

### First Time Setup

```bash
# After migrations are applied, create first admin user
# Visit http://localhost:5173/signup
# Sign up with email/password
# First user is automatically admin (or configure in profiles table)

# Manually set admin role via Supabase Studio:
# 1. Go to Table Editor → profiles
# 2. Find your user
# 3. Set role = 'admin'
```

---

## Production Deployment

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Dist folder will contain static files ready for deployment
```

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel

# Follow prompts
# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

#### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

#### Option 3: Traditional Hosting (Apache, Nginx)
```bash
npm run build

# Copy dist/ folder to web server
# Configure web server to serve index.html for all routes (SPA routing)

# Nginx example:
location / {
    try_files $uri $uri/ /index.html;
}

# Apache example (.htaccess):
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Environment Variables

### Required Variables

Create `.env` file in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Example for hosted Supabase:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Example for local Supabase:
# VITE_SUPABASE_URL=http://localhost:54321
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting Supabase Credentials

**Hosted Supabase:**
1. Login to supabase.com
2. Create new project
3. Go to Settings → API
4. Copy Project URL and anon/public key

**Local Supabase:**
```bash
npx supabase start
# Credentials will be displayed in terminal
```

---

## Testing the Merge

### Database Testing

```sql
-- Verify all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should include new tables:
-- - fields, contractors, well_types, mud_types, etc.
-- - personnel_on_location, daily_drilling_cost
-- - chemical_materials_usage, equipment_used
-- - downhole_motor, mwd_equipment, jar_equipment
-- - bop_test, daily_problems, time_analysis

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify enhanced columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bit_records'
  AND column_name LIKE '%pump%';

-- Should show: pump_type_1_code, pump_type_2_code, pump_pressure_1, etc.
```

### Application Testing

1. **User Registration & Login**
   - [ ] Sign up with new account
   - [ ] Login with existing account
   - [ ] Role-based redirect works

2. **Admin Panel** (Admin only)
   - [ ] Create new rig
   - [ ] Create new well assigned to rig
   - [ ] Assign companyman to rig
   - [ ] View all assignments

3. **Report Creation** (Companyman/Admin)
   - [ ] Navigate to "New Report"
   - [ ] Fill General Data tab
   - [ ] Fill Bit Data tab
   - [ ] Fill ROP Data tab
   - [ ] Fill Mud Data tab
   - [ ] Fill Directional tab
   - [ ] Fill BHA tab
   - [ ] Fill Casing tab
   - [ ] Fill Formation Tops tab
   - [ ] NEW: Fill Personnel & Cost tab
   - [ ] NEW: Fill Materials & Equipment tab
   - [ ] NEW: Fill Advanced Equipment tab
   - [ ] Submit report
   - [ ] Verify success message

4. **Report Viewing**
   - [ ] View report in dashboard
   - [ ] Click to view full report
   - [ ] All data displays correctly
   - [ ] NEW: Personnel section shows
   - [ ] NEW: Cost section shows
   - [ ] NEW: Equipment tables show

5. **Export Functions**
   - [ ] Export to PDF
   - [ ] Export to Excel
   - [ ] Downloads work
   - [ ] Files open correctly

6. **Role-Based Access**
   - [ ] Engineer can view all reports
   - [ ] Engineer cannot create reports
   - [ ] Companyman sees only assigned wells
   - [ ] Companyman can create reports
   - [ ] Admin has full access

---

## Monitoring & Maintenance

### Database Monitoring

```sql
-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Application Logs

```bash
# Development logs
npm run dev
# Watch console for errors

# Production logs
# Check hosting provider dashboard (Vercel, Netlify, etc.)
```

### Backup Strategy

**Supabase Backups:**
- Hosted: Automatic daily backups (Pro plan)
- Local: Manual pg_dump

```bash
# Local backup
npx supabase db dump > backup_$(date +%Y%m%d).sql

# Restore
npx supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres < backup_20251207.sql
```

---

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_daily_reports_date_well
ON daily_reports(report_date, well_name);

CREATE INDEX CONCURRENTLY idx_chemical_materials_code
ON chemical_materials_usage(material_code);

-- Analyze tables
ANALYZE daily_reports;
ANALYZE bit_records;
ANALYZE chemical_materials_usage;

-- Vacuum
VACUUM ANALYZE;
```

### Frontend Optimization

- Use code splitting for large forms
- Implement virtual scrolling for long tables
- Cache reference data (well types, mud types, etc.)
- Use React.memo for expensive components
- Lazy load charting libraries

```javascript
// Example: Lazy load chart component
const ChartComponent = React.lazy(() => import('./ChartComponent'));

// In component:
<Suspense fallback={<div>Loading chart...</div>}>
  <ChartComponent data={data} />
</Suspense>
```

---

## Troubleshooting

### Common Issues

**Issue**: Build fails with "Cannot find module"
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Database migration fails
```bash
# Solution: Reset database
npx supabase db reset
# Migrations will auto-apply
```

**Issue**: RLS policy blocks insert
```sql
-- Solution: Check user role
SELECT id, role FROM profiles WHERE id = auth.uid();

-- Update role if needed
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid';
```

**Issue**: New forms not appearing
```bash
# Solution: Check import paths
# Verify files exist in src/components/reports/forms/
ls -la src/components/reports/forms/

# Clear cache and rebuild
rm -rf dist .vite
npm run build
```

---

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] .env in .gitignore
- [ ] RLS policies enabled on all tables
- [ ] Supabase anon key (not service key) used in frontend
- [ ] HTTPS enabled in production
- [ ] Regular security updates (`npm audit`)
- [ ] Strong password policy enforced
- [ ] User roles properly configured

---

## Support & Resources

- **Project Documentation**: `/MERGE_GUIDE.md`
- **Usage Guide**: `/USAGE_GUIDE.md`
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

---

## Version History

### v2.0.0 (2025-12-07) - Delphi Merge
- ✨ Merged all Delphi Drilling Project features
- 🗄️ Added 28 new database tables
- 📝 Created 3 new form components
- 📊 Added charting libraries
- 📚 Comprehensive documentation

### v1.0.0 (2025-02-06) - Initial Release
- ✅ Basic drilling report functionality
- 👥 Multi-user authentication
- 🏗️ Rig and well management
- 📄 PDF/Excel export

---

**Deployment Complete** ✅

For questions or issues, check the troubleshooting section or review the MERGE_GUIDE.md for detailed feature information.
