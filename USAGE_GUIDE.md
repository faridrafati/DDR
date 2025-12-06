# DDR Application - Rig/Well/Companyman Management Guide

## Overview
The application now has a properly normalized structure for managing rigs, wells, and companyman assignments.

## Database Structure

### Tables
1. **rigs** - All drilling rigs
   - Each rig can have multiple companymans assigned
   - Status: active, inactive, maintenance

2. **wells** - All wells
   - Each well is permanently assigned to ONE rig
   - Status: planning, drilling, completed, suspended

3. **companyman_rig_assignments** - Assignments
   - Many-to-many relationship between companymans and rigs
   - Each assignment can be active or inactive

4. **daily_reports** - Daily drilling reports
   - Now uses `well_id` (foreign key) instead of text field
   - Enforces that companymans can only create reports for their assigned wells

## User Roles

### Admin
- Full access to everything
- Can access Admin Panel at `/admin`
- Can create rigs, wells, and assignments
- Can create reports for any well

### Companyman
- Can only create reports for wells on their assigned rigs
- Cannot manage rigs, wells, or assignments
- Views dropdown of assigned wells when creating reports

### Engineer
- Can view all reports
- Cannot create reports or manage assignments

## How to Set Up

### Step 1: Create Rigs (Admin Only)
1. Navigate to `/admin` or click "Admin Panel" button
2. Go to "Rigs" tab
3. Add rig details:
   - Name (required, unique)
   - Contractor
   - Rig Type
   - Status

### Step 2: Create Wells (Admin Only)
1. Go to "Wells" tab in Admin Panel
2. Add well details:
   - Name (required, unique)
   - Assigned Rig (required) - Select from active rigs
   - Operator
   - Field
   - Location
   - Spud Date
   - Status

### Step 3: Assign Companymans to Rigs (Admin Only)
1. Go to "Assignments" tab in Admin Panel
2. Select a companyman from the dropdown
3. Select a rig
4. Click "Create Assignment"
5. Toggle active/inactive status as needed

### Step 4: Companymans Create Reports
1. Sign in as companyman
2. Click "New Report"
3. Select well from dropdown (shows only assigned wells)
4. Rig name auto-populates based on selected well
5. Fill in report details and submit

## Security & Access Control

### Row Level Security (RLS) Policies
- **Rigs**: All authenticated users can view, only admins can modify
- **Wells**: All authenticated users can view, only admins can modify
- **Assignments**: Users can view their own, admins can view/modify all
- **Reports**: Companymans can only create reports for wells on their assigned rigs

### Database Functions
Two helper functions are available:
- `get_companyman_wells(companyman_uuid)` - Returns all wells for a companyman's assigned rigs
- `get_companyman_rigs(companyman_uuid)` - Returns all rigs assigned to a companyman

## Migration Notes

The migration automatically:
1. Created normalized `rigs` and `wells` tables
2. Migrated existing rig names from `daily_reports` to `rigs` table
3. Migrated existing well names from `daily_reports` to `wells` table
4. Added `well_id` foreign key to `daily_reports`
5. Linked all existing reports to their wells

The old `well_name` and `rig_name` TEXT columns are kept for backward compatibility but are no longer required for new reports.

## Workflow Example

### Scenario: New Well Setup
1. **Admin** creates Rig "Rig-42" (Contractor: ABC Drilling)
2. **Admin** creates Well "Well-001" assigned to "Rig-42"
3. **Admin** assigns Companyman "John Doe" to "Rig-42"
4. **John Doe** logs in and creates a report:
   - Sees dropdown with "Well-001 (Rig: Rig-42)"
   - Selects it, rig name auto-fills
   - Completes and submits report
5. **Engineer** views all reports including John's report

### Scenario: Multiple Companymans on One Rig
1. **Admin** assigns multiple companymans to the same rig
2. All assigned companymans can create reports for all wells on that rig
3. Useful for shift work or backup coverage

## Troubleshooting

### Companyman sees "No wells assigned"
- Admin needs to:
  1. Create a rig
  2. Create a well assigned to that rig
  3. Assign the companyman to that rig

### Report creation fails with "permission denied"
- Verify the companyman is assigned to a rig
- Verify the assignment is marked as "active"
- Verify the well is on one of the companyman's assigned rigs

## API Endpoints

All operations use Supabase client with these patterns:
- `supabase.from('rigs').select(...)` - List rigs
- `supabase.from('wells').select(...)` - List wells
- `supabase.rpc('get_companyman_wells', { companyman_uuid })` - Get wells for companyman
- `supabase.from('daily_reports').insert(...)` - Create report (enforces assignments)
