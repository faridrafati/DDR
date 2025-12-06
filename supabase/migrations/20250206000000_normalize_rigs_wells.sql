-- Migration: Normalize rigs, wells, and companyman assignments
-- Purpose: Fix the relationship between rigs, wells, and companymans
-- Requirements:
--   - Each well is permanently assigned to one rig
--   - Each rig can have multiple companymans
--   - Companymans can only create reports for their assigned rigs/wells

-- Step 1: Create rigs table
CREATE TABLE rigs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    contractor TEXT,
    rig_type TEXT,
    status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 2: Create wells table with rig assignment
CREATE TABLE wells (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    rig_id UUID REFERENCES rigs(id) ON DELETE SET NULL,
    operator TEXT,
    field TEXT,
    location TEXT,
    spud_date DATE,
    status TEXT CHECK (status IN ('planning', 'drilling', 'completed', 'suspended')) DEFAULT 'drilling',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 3: Create companyman-rig assignments (many-to-many)
CREATE TABLE companyman_rig_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    companyman_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    rig_id UUID REFERENCES rigs(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(companyman_id, rig_id)
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_wells_rig_id ON wells(rig_id);
CREATE INDEX idx_wells_name ON wells(name);
CREATE INDEX idx_rigs_name ON rigs(name);
CREATE INDEX idx_companyman_rig_assignments_companyman ON companyman_rig_assignments(companyman_id);
CREATE INDEX idx_companyman_rig_assignments_rig ON companyman_rig_assignments(rig_id);
CREATE INDEX idx_companyman_rig_assignments_active ON companyman_rig_assignments(is_active);

-- Step 5: Migrate existing data from daily_reports to rigs
INSERT INTO rigs (name, contractor)
SELECT DISTINCT
    COALESCE(rig_name, 'Unknown Rig') as name,
    contractor
FROM daily_reports
WHERE rig_name IS NOT NULL AND rig_name != ''
ON CONFLICT (name) DO NOTHING;

-- Insert a default rig for reports with no rig name
INSERT INTO rigs (name, contractor, status)
VALUES ('Unknown Rig', NULL, 'inactive')
ON CONFLICT (name) DO NOTHING;

-- Step 6: Migrate existing wells from daily_reports
-- First, create a temporary mapping of well_name to rig_id
WITH well_rig_mapping AS (
    SELECT DISTINCT ON (well_name)
        well_name,
        COALESCE(rig_name, 'Unknown Rig') as rig_name,
        operator,
        field,
        location
    FROM daily_reports
    WHERE well_name IS NOT NULL AND well_name != ''
    ORDER BY well_name, created_at DESC
)
INSERT INTO wells (name, rig_id, operator, field, location)
SELECT
    wrm.well_name,
    r.id as rig_id,
    wrm.operator,
    wrm.field,
    wrm.location
FROM well_rig_mapping wrm
LEFT JOIN rigs r ON r.name = wrm.rig_name
ON CONFLICT (name) DO NOTHING;

-- Step 7: Add well_id column to daily_reports
ALTER TABLE daily_reports ADD COLUMN well_id UUID REFERENCES wells(id) ON DELETE SET NULL;

-- Step 8: Update daily_reports to link to wells
UPDATE daily_reports dr
SET well_id = w.id
FROM wells w
WHERE dr.well_name = w.name;

-- Step 9: Create index on well_id
CREATE INDEX idx_daily_reports_well_id ON daily_reports(well_id);

-- Step 10: Enable RLS on new tables
ALTER TABLE rigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wells ENABLE ROW LEVEL SECURITY;
ALTER TABLE companyman_rig_assignments ENABLE ROW LEVEL SECURITY;

-- Step 11: RLS Policies for rigs
-- All authenticated users can view rigs
CREATE POLICY "Authenticated users can view rigs" ON rigs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage rigs
CREATE POLICY "Admins can insert rigs" ON rigs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update rigs" ON rigs
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete rigs" ON rigs
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Step 12: RLS Policies for wells
-- All authenticated users can view wells
CREATE POLICY "Authenticated users can view wells" ON wells
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage wells
CREATE POLICY "Admins can insert wells" ON wells
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update wells" ON wells
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete wells" ON wells
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Step 13: RLS Policies for companyman_rig_assignments
-- Users can view their own assignments
CREATE POLICY "Users can view own rig assignments" ON companyman_rig_assignments
    FOR SELECT USING (
        auth.uid() = companyman_id OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'engineer'))
    );

-- Only admins can create/modify assignments
CREATE POLICY "Admins can insert rig assignments" ON companyman_rig_assignments
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update rig assignments" ON companyman_rig_assignments
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete rig assignments" ON companyman_rig_assignments
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Step 14: Update daily_reports RLS policy to enforce rig/well assignments
-- Drop old insert policy
DROP POLICY IF EXISTS "Companyman can insert reports" ON daily_reports;

-- Create new policy that checks rig assignments
CREATE POLICY "Companyman can insert reports for assigned rigs" ON daily_reports
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('companyman', 'admin')) AND
        (
            -- Admins can create reports for any well
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
            OR
            -- Companymans can only create reports for wells on their assigned rigs
            EXISTS (
                SELECT 1
                FROM companyman_rig_assignments cra
                JOIN wells w ON w.rig_id = cra.rig_id
                WHERE cra.companyman_id = auth.uid()
                  AND cra.is_active = true
                  AND w.id = well_id
            )
        )
    );

-- Step 15: Add triggers for updated_at
CREATE TRIGGER update_rigs_updated_at BEFORE UPDATE ON rigs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wells_updated_at BEFORE UPDATE ON wells
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 16: Create helper function to get wells for a companyman
CREATE OR REPLACE FUNCTION get_companyman_wells(companyman_uuid UUID)
RETURNS TABLE (
    well_id UUID,
    well_name TEXT,
    rig_id UUID,
    rig_name TEXT,
    operator TEXT,
    field TEXT,
    location TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.id as well_id,
        w.name as well_name,
        r.id as rig_id,
        r.name as rig_name,
        w.operator,
        w.field,
        w.location
    FROM wells w
    JOIN rigs r ON w.rig_id = r.id
    JOIN companyman_rig_assignments cra ON cra.rig_id = r.id
    WHERE cra.companyman_id = companyman_uuid
      AND cra.is_active = true
    ORDER BY w.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 17: Create helper function to get rigs for a companyman
CREATE OR REPLACE FUNCTION get_companyman_rigs(companyman_uuid UUID)
RETURNS TABLE (
    rig_id UUID,
    rig_name TEXT,
    contractor TEXT,
    rig_type TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id as rig_id,
        r.name as rig_name,
        r.contractor,
        r.rig_type,
        r.status
    FROM rigs r
    JOIN companyman_rig_assignments cra ON cra.rig_id = r.id
    WHERE cra.companyman_id = companyman_uuid
      AND cra.is_active = true
    ORDER BY r.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration complete!
-- Note: well_name and rig_name columns are kept for backward compatibility
-- They can be removed in a future migration after frontend is updated
