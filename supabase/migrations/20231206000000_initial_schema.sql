-- Daily Drilling Report (DDR) Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT CHECK (role IN ('companyman', 'engineer', 'admin')) DEFAULT 'companyman',
    company TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Daily Drilling Reports main table
CREATE TABLE daily_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    report_date DATE NOT NULL,
    well_name TEXT NOT NULL,
    rig_name TEXT,

    -- General Data
    operator TEXT,
    contractor TEXT,
    field TEXT,
    location TEXT,
    report_number INTEGER,
    days_since_spud NUMERIC(10,2),

    -- Depth Information
    hole_depth_start NUMERIC(10,2),
    hole_depth_end NUMERIC(10,2),
    progress_24hr NUMERIC(10,2),

    -- Time breakdown (hours)
    drilling_time NUMERIC(5,2),
    tripping_time NUMERIC(5,2),
    casing_time NUMERIC(5,2),
    rig_repair_time NUMERIC(5,2),
    wait_on_cement_time NUMERIC(5,2),
    other_time NUMERIC(5,2),

    -- Operations summary
    operations_summary TEXT,
    next_operations TEXT,
    safety_incidents TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Bit Data table
CREATE TABLE bit_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    bit_number INTEGER,
    bit_size NUMERIC(5,2),
    bit_type TEXT,
    bit_manufacturer TEXT,
    bit_serial_number TEXT,

    depth_in NUMERIC(10,2),
    depth_out NUMERIC(10,2),
    footage NUMERIC(10,2),
    hours_run NUMERIC(5,2),

    -- Bit condition (IADC grading)
    inner_rows TEXT,
    outer_rows TEXT,
    dull_grade TEXT,
    location TEXT,
    bearing_seals TEXT,
    gauge TEXT,
    reason_pulled TEXT,

    nozzle_sizes TEXT,
    jets_configuration TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Rate of Penetration (ROP) data table
CREATE TABLE rop_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    depth_from NUMERIC(10,2),
    depth_to NUMERIC(10,2),
    formation TEXT,
    rop_avg NUMERIC(10,2),
    rop_max NUMERIC(10,2),

    -- Drilling parameters
    wob NUMERIC(10,2), -- Weight on Bit (klbs)
    rpm NUMERIC(10,2),
    torque NUMERIC(10,2),
    spp NUMERIC(10,2), -- Standpipe Pressure (psi)
    flow_rate NUMERIC(10,2), -- gpm

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Mud Data table
CREATE TABLE mud_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    mud_type TEXT,
    mud_weight_in NUMERIC(5,2), -- ppg
    mud_weight_out NUMERIC(5,2), -- ppg

    -- Rheology
    plastic_viscosity NUMERIC(5,2), -- cp
    yield_point NUMERIC(5,2), -- lbs/100ft2
    gel_10sec NUMERIC(5,2),
    gel_10min NUMERIC(5,2),

    -- Filtration
    api_filtrate NUMERIC(5,2), -- ml/30min
    hthp_filtrate NUMERIC(5,2), -- ml/30min
    filter_cake NUMERIC(5,2), -- 1/32"

    -- Chemistry
    ph NUMERIC(4,2),
    alkalinity_pf NUMERIC(5,2),
    alkalinity_mf NUMERIC(5,2),
    chlorides NUMERIC(10,2), -- ppm
    calcium NUMERIC(10,2), -- ppm

    -- Solids
    oil_water_ratio TEXT,
    total_solids NUMERIC(5,2), -- %
    sand_content NUMERIC(5,2), -- %

    mud_volume NUMERIC(10,2), -- bbls
    mud_additions TEXT, -- JSON or text description

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Directional Drilling Data table
CREATE TABLE directional_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    measured_depth NUMERIC(10,2),
    inclination NUMERIC(5,2), -- degrees
    azimuth NUMERIC(5,2), -- degrees
    true_vertical_depth NUMERIC(10,2),

    -- Position
    north_south NUMERIC(10,2),
    east_west NUMERIC(10,2),
    vertical_section NUMERIC(10,2),
    dogleg_severity NUMERIC(5,2), -- deg/100ft

    -- Survey tool info
    survey_type TEXT,
    tool_type TEXT,
    survey_company TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- BHA (Bottom Hole Assembly) and Tools table
CREATE TABLE bha_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    bha_number INTEGER,
    run_number INTEGER,

    -- BHA components (stored as JSON array)
    components JSONB,
    -- Example: [{"order": 1, "component": "Bit", "description": "12-1/4\" PDC", "length": 1.2, "od": 12.25, "id": 3.0}]

    total_length NUMERIC(10,2),
    total_weight NUMERIC(10,2),

    purpose TEXT,
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Casing and Cement Data table
CREATE TABLE casing_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    casing_string TEXT,
    casing_size NUMERIC(5,2),
    casing_weight NUMERIC(5,2), -- lbs/ft
    casing_grade TEXT,

    setting_depth NUMERIC(10,2),
    top_of_cement NUMERIC(10,2),

    cement_type TEXT,
    cement_volume NUMERIC(10,2), -- sacks or bbls
    cement_density NUMERIC(5,2), -- ppg

    cement_company TEXT,
    plug_bumped_pressure NUMERIC(10,2), -- psi
    wait_on_cement NUMERIC(5,2), -- hours

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Formation tops table
CREATE TABLE formation_tops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    formation_name TEXT,
    measured_depth NUMERIC(10,2),
    true_vertical_depth NUMERIC(10,2),

    lithology TEXT,
    description TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Comments and remarks table
CREATE TABLE report_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    comment TEXT NOT NULL,
    comment_type TEXT CHECK (comment_type IN ('general', 'safety', 'technical', 'operational')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_well_name ON daily_reports(well_name);
CREATE INDEX idx_bit_records_report_id ON bit_records(report_id);
CREATE INDEX idx_rop_records_report_id ON rop_records(report_id);
CREATE INDEX idx_mud_records_report_id ON mud_records(report_id);
CREATE INDEX idx_directional_records_report_id ON directional_records(report_id);
CREATE INDEX idx_bha_records_report_id ON bha_records(report_id);
CREATE INDEX idx_casing_records_report_id ON casing_records(report_id);
CREATE INDEX idx_formation_tops_report_id ON formation_tops(report_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE rop_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mud_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE directional_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bha_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE casing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_tops ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Daily Reports: Companyman can create, engineers can read all
CREATE POLICY "Authenticated users can view all reports" ON daily_reports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Companyman can insert reports" ON daily_reports
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('companyman', 'admin'))
    );

CREATE POLICY "Users can update own reports" ON daily_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for related tables (bit, rop, mud, etc.)
-- These allow access based on the parent daily_report access
CREATE POLICY "Users can view bit records" ON bit_records
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
    );

CREATE POLICY "Users can insert bit records" ON bit_records
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view rop records" ON rop_records
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
    );

CREATE POLICY "Users can insert rop records" ON rop_records
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view mud records" ON mud_records
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
    );

CREATE POLICY "Users can insert mud records" ON mud_records
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view directional records" ON directional_records
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
    );

CREATE POLICY "Users can insert directional records" ON directional_records
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view bha records" ON bha_records
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
    );

CREATE POLICY "Users can insert bha records" ON bha_records
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view casing records" ON casing_records
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
    );

CREATE POLICY "Users can insert casing records" ON casing_records
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view formation tops" ON formation_tops
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
    );

CREATE POLICY "Users can insert formation tops" ON formation_tops
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view comments" ON report_comments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
    );

CREATE POLICY "Authenticated users can insert comments" ON report_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'companyman'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
