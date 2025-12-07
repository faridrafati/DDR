-- Migration: Add additional features from Delphi Drilling Project
-- Purpose: Merge comprehensive drilling reporting features from legacy Delphi application
-- Date: 2025-12-07

-- ============================================================================
-- REFERENCE DATA TABLES (Master Data from Delphi)
-- ============================================================================

-- Fields table (oil/gas fields)
CREATE TABLE fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    field_code TEXT NOT NULL UNIQUE,
    field_name TEXT NOT NULL,
    region TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Contractors table
CREATE TABLE contractors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contractor_code TEXT NOT NULL UNIQUE,
    contractor_name TEXT NOT NULL,
    contractor_type TEXT, -- drilling, cementing, mud, directional, etc.
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Well Types table
CREATE TABLE well_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    well_type_code TEXT NOT NULL UNIQUE,
    well_type_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Well Profiles table (Vertical, Directional, Horizontal, etc.)
CREATE TABLE well_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_code TEXT NOT NULL UNIQUE,
    profile_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Mud Types master table
CREATE TABLE mud_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mud_code TEXT NOT NULL UNIQUE,
    mud_name TEXT NOT NULL,
    mud_category TEXT, -- WBM, OBM, SBM, Air, Foam
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Formation Lithology table
CREATE TABLE lithology_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lithology_code TEXT NOT NULL UNIQUE,
    lithology_name TEXT NOT NULL,
    color_code TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Materials table (chemicals, additives)
CREATE TABLE materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    material_code TEXT NOT NULL UNIQUE,
    material_name TEXT NOT NULL,
    material_type TEXT, -- barite, bentonite, cement, polymer, etc.
    unit_of_measure TEXT,
    supplier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Equipment catalog
CREATE TABLE equipment_catalog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_code TEXT NOT NULL UNIQUE,
    equipment_name TEXT NOT NULL,
    equipment_type TEXT,
    unit_of_measure TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Bit catalog
CREATE TABLE bit_catalog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bit_code TEXT NOT NULL UNIQUE,
    bit_size NUMERIC(5,2),
    bit_type TEXT, -- PDC, Roller Cone, Diamond, etc.
    iadc_code TEXT,
    manufacturer TEXT,
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Casing catalog
CREATE TABLE casing_catalog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    casing_code TEXT NOT NULL UNIQUE,
    casing_name TEXT NOT NULL,
    size NUMERIC(5,2),
    grade TEXT,
    weight_per_foot NUMERIC(5,2),
    thread_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- ENHANCED WELL DATA
-- ============================================================================

-- Enhance wells table with more details from Delphi
ALTER TABLE wells ADD COLUMN IF NOT EXISTS well_type_code TEXT;
ALTER TABLE wells ADD COLUMN IF NOT EXISTS well_profile_code TEXT;
ALTER TABLE wells ADD COLUMN IF NOT EXISTS field_code TEXT;
ALTER TABLE wells ADD COLUMN IF NOT EXISTS final_forecasted_depth NUMERIC(10,2);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS estimated_total_rig_days INTEGER;
ALTER TABLE wells ADD COLUMN IF NOT EXISTS spudded_in_date DATE;
ALTER TABLE wells ADD COLUMN IF NOT EXISTS released_date DATE;
ALTER TABLE wells ADD COLUMN IF NOT EXISTS rig_released_date DATE;
ALTER TABLE wells ADD COLUMN IF NOT EXISTS reservoir TEXT;
ALTER TABLE wells ADD COLUMN IF NOT EXISTS rt_elevation NUMERIC(10,2); -- Rotary Table Elevation
ALTER TABLE wells ADD COLUMN IF NOT EXISTS water_depth NUMERIC(10,2);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS company_code TEXT;

-- ============================================================================
-- ENHANCED DAILY REPORT TABLES
-- ============================================================================

-- Enhanced General Data (extend daily_reports table)
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS actual_rig_days INTEGER;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS morning_depth NUMERIC(10,2);
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS total_drilling_hours NUMERIC(5,2);
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS lithology TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS well_site_superintendent TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS operation_superintendent TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS program_engineer TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS geologist TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS contractor_tool_pusher_1 TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS contractor_tool_pusher_2 TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS previous_drill_depth NUMERIC(10,2);
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS kick_off_point NUMERIC(10,2);
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS weather_conditions TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS wind_speed_direction TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS wave_visibility TEXT;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS fresh_water_used NUMERIC(10,2);
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS fuel_consumed NUMERIC(10,2);

-- Mud Parameter enhancements (extend mud_records)
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS max_weight NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS min_weight NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS report_time TIME;
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS viscosity NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS hpht_filtrate NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS water_loss NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS salinity NUMERIC(10,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS solid_percent NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS air_foam_cfm NUMERIC(10,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS oil_percent NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS oil_per_water_ratio TEXT;
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS stability NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS mbt NUMERIC(5,2); -- Methylene Blue Test
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS pf NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS mf NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS fan_600_rpm NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS fan_300_rpm NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS initial_gel NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS gel_10_minutes NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS return_temperature NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS kcl_percent NUMERIC(5,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS gas_oil NUMERIC(10,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS mud_system TEXT;
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS water_on_location NUMERIC(10,2);
ALTER TABLE mud_records ADD COLUMN IF NOT EXISTS losses_at_unit NUMERIC(10,2);

-- Mud Storage and Pump Parameters
CREATE TABLE mud_storage_parameters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    -- Mud Storage
    mud_storage_1_bbl NUMERIC(10,2),
    mud_storage_1_pcf NUMERIC(5,2),
    mud_storage_2_bbl NUMERIC(10,2),
    mud_storage_2_pcf NUMERIC(5,2),

    -- Slow Pump Rates
    slow_rate_pump_1_pressure NUMERIC(10,2),
    slow_rate_pump_1_stroke NUMERIC(5,2),
    slow_rate_pump_2_pressure NUMERIC(10,2),
    slow_rate_pump_2_stroke NUMERIC(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Solid Control Parameters
CREATE TABLE solid_control_parameters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    -- Clay Ejector/Desilter
    clay_ejector_hour NUMERIC(5,2),
    clay_ejector_underflow NUMERIC(5,2),
    clay_ejector_overflow NUMERIC(5,2),
    clay_ejector_feed NUMERIC(5,2),
    clay_ejector_fprs NUMERIC(5,2),

    -- Mud Cleaner/Centrifuge
    mud_cleaner_hour NUMERIC(5,2),
    mud_cleaner_underflow NUMERIC(5,2),
    mud_cleaner_overflow NUMERIC(5,2),
    mud_cleaner_feed NUMERIC(5,2),
    mud_cleaner_cons NUMERIC(5,2),
    mud_cleaner_fprs NUMERIC(5,2),

    -- Shale Shakers
    shaker_hour NUMERIC(5,2),
    shaker_size_1 TEXT,
    shaker_size_2 TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Chemical Materials Usage
CREATE TABLE chemical_materials_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
    material_code TEXT NOT NULL,

    amount NUMERIC(10,2),
    received NUMERIC(10,2),
    stock NUMERIC(10,2),
    on_site NUMERIC(10,2),
    requested NUMERIC(10,2),
    sent NUMERIC(10,2),
    measure_code TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Equipment Used
CREATE TABLE equipment_used (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
    equipment_code TEXT NOT NULL,

    amount NUMERIC(10,2),
    received NUMERIC(10,2),
    stock NUMERIC(10,2),
    on_site NUMERIC(10,2),
    requested NUMERIC(10,2),
    sent NUMERIC(10,2),
    measure_code TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Daily Drilling Cost
CREATE TABLE daily_drilling_cost (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    -- Daily Costs
    day_rate NUMERIC(12,2),
    mud_cost NUMERIC(12,2),
    cement_cost NUMERIC(12,2),
    equipment_cost NUMERIC(12,2),
    service_cost NUMERIC(12,2),
    other_cost NUMERIC(12,2),

    -- Cumulative Costs
    day_rate_cumulative NUMERIC(12,2),
    mud_cost_cumulative NUMERIC(12,2),
    cement_cost_cumulative NUMERIC(12,2),
    equipment_cost_cumulative NUMERIC(12,2),
    service_cost_cumulative NUMERIC(12,2),
    other_cost_cumulative NUMERIC(12,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Drill String Components (extends BHA concept)
CREATE TABLE drill_string_components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    component_order INTEGER,
    size TEXT,
    grade TEXT,
    length NUMERIC(10,2),
    weight NUMERIC(10,2),
    component_type TEXT, -- Drill Pipe, Heavy Weight, Drill Collar, etc.

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Stabilizers
CREATE TABLE stabilizers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    depth_point NUMERIC(10,2),
    description TEXT,
    stabilizer_type TEXT,
    size NUMERIC(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Downhole Motor (MWD/LWD Motor)
CREATE TABLE downhole_motor (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    motor_type_code TEXT,
    motor_size NUMERIC(5,2),
    motor_serial_no TEXT,
    motor_hours NUMERIC(5,2),
    motor_company_code TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- MWD (Measurement While Drilling)
CREATE TABLE mwd_equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    mwd_type_code TEXT,
    mwd_size NUMERIC(5,2),
    mwd_serial_no TEXT,
    mwd_hours NUMERIC(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Jar Equipment
CREATE TABLE jar_equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    jar_type_code TEXT,
    jar_size NUMERIC(5,2),
    jar_serial_no TEXT,
    jar_hours NUMERIC(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enhanced Bit Records (additional fields from Delphi)
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS bit_meter_total NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS min_weight_on_bit NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS max_weight_on_bit NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS min_rpm NUMERIC(5,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS max_rpm NUMERIC(5,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS torque_on_bottom NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS torque_off_bottom NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS tfa NUMERIC(5,2); -- Total Flow Area
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS bit_hsi NUMERIC(5,2); -- Hydraulic Impact

-- Pump Data
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS pump_type_1_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS pump_type_2_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS pump_liner_size_1 NUMERIC(5,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS pump_liner_size_2 NUMERIC(5,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS pump_output_1 NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS pump_output_2 NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS pump_pressure_1 NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS pump_pressure_2 NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS annular_velocity NUMERIC(10,2);

-- Trip Times
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS connection_drilling_motor_meter NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS connection_drilling_motor_hour NUMERIC(5,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS trip_in_out_meter NUMERIC(10,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS trip_in_out_hour NUMERIC(5,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS bit_change_in_time NUMERIC(5,2);
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS bit_change_out_time NUMERIC(5,2);

-- IADC Dull Grading (detailed)
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS inner_cutter_wear_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS outer_cutter_wear_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS dull_characteristic_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS wear_location_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS bearing_wear_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS gauge_wear_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS other_dull_characteristic_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS reason_pulled_code TEXT;
ALTER TABLE bit_records ADD COLUMN IF NOT EXISTS used_percent INTEGER;

-- Tools Failure Tracking
CREATE TABLE tools_failure (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    tool_description TEXT,
    make_manufacturer TEXT,
    failure_type TEXT,
    depth_of_failure NUMERIC(10,2),
    corrective_action TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Personnel on Location
CREATE TABLE personnel_on_location (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    total_personnel INTEGER,
    tool_pusher TEXT,
    driller TEXT,
    assistant_driller INTEGER,
    mud_engineer INTEGER,
    mechanic INTEGER,
    electrician INTEGER,
    trainee INTEGER,
    contractor_labor INTEGER,
    casual_labor INTEGER,
    services_personnel INTEGER,
    nioc_trainee INTEGER,
    nioc_personnel INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- BOP (Blowout Preventer) Test
CREATE TABLE bop_test (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    well_control_type_code TEXT,
    accumulator_pressure NUMERIC(10,2),
    recharge_time NUMERIC(5,2),
    recharge_at TEXT,
    last_test_before_trip NUMERIC(10,2),
    last_integrity_kick_test NUMERIC(10,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Daily Problems/Issues
CREATE TABLE daily_problems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    operation_code TEXT,
    depth_point NUMERIC(10,2),
    description TEXT,
    problem_type TEXT, -- NPT (Non-Productive Time), Lost Circulation, Stuck Pipe, etc.
    duration_hours NUMERIC(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Time Analysis (Activity Codes) - Detailed breakdown like Delphi
CREATE TABLE time_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    activity_group_code TEXT, -- 01, 02 (Drilling Operations, Moving/Waiting)
    activity_type_code TEXT, -- 01, 02, 03 (Drilling, Tripping, Circulating, etc.)
    activity_code TEXT, -- 001, 002, 003 (Specific activity)

    from_time TIME,
    to_time TIME,
    hours NUMERIC(5,2),

    description TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Operation Analysis (narrative operations log)
CREATE TABLE operation_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,

    serial_no INTEGER,
    operation_code TEXT,
    from_time TIME,
    to_time TIME,
    description TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_mud_storage_parameters_report_id ON mud_storage_parameters(report_id);
CREATE INDEX idx_solid_control_parameters_report_id ON solid_control_parameters(report_id);
CREATE INDEX idx_chemical_materials_usage_report_id ON chemical_materials_usage(report_id);
CREATE INDEX idx_equipment_used_report_id ON equipment_used(report_id);
CREATE INDEX idx_daily_drilling_cost_report_id ON daily_drilling_cost(report_id);
CREATE INDEX idx_drill_string_components_report_id ON drill_string_components(report_id);
CREATE INDEX idx_stabilizers_report_id ON stabilizers(report_id);
CREATE INDEX idx_downhole_motor_report_id ON downhole_motor(report_id);
CREATE INDEX idx_mwd_equipment_report_id ON mwd_equipment(report_id);
CREATE INDEX idx_jar_equipment_report_id ON jar_equipment(report_id);
CREATE INDEX idx_tools_failure_report_id ON tools_failure(report_id);
CREATE INDEX idx_personnel_on_location_report_id ON personnel_on_location(report_id);
CREATE INDEX idx_bop_test_report_id ON bop_test(report_id);
CREATE INDEX idx_daily_problems_report_id ON daily_problems(report_id);
CREATE INDEX idx_time_analysis_report_id ON time_analysis(report_id);
CREATE INDEX idx_operation_analysis_report_id ON operation_analysis(report_id);

CREATE INDEX idx_fields_field_code ON fields(field_code);
CREATE INDEX idx_contractors_contractor_code ON contractors(contractor_code);
CREATE INDEX idx_materials_material_code ON materials(material_code);
CREATE INDEX idx_equipment_catalog_equipment_code ON equipment_catalog(equipment_code);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mud_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE lithology_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE bit_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE casing_catalog ENABLE ROW LEVEL SECURITY;

ALTER TABLE mud_storage_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE solid_control_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemical_materials_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_drilling_cost ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_string_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE stabilizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE downhole_motor ENABLE ROW LEVEL SECURITY;
ALTER TABLE mwd_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE jar_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools_failure ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_on_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE bop_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Reference Tables (Read-only for all authenticated users)
CREATE POLICY "Authenticated users can view fields" ON fields
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view contractors" ON contractors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view well_types" ON well_types
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view well_profiles" ON well_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view mud_types" ON mud_types
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view lithology_types" ON lithology_types
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view materials" ON materials
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view equipment_catalog" ON equipment_catalog
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view bit_catalog" ON bit_catalog
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view casing_catalog" ON casing_catalog
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for Report Data Tables (based on parent report)
-- Template for all new tables linked to daily_reports
DO $$
DECLARE
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN
        SELECT unnest(ARRAY[
            'mud_storage_parameters', 'solid_control_parameters', 'chemical_materials_usage',
            'equipment_used', 'daily_drilling_cost', 'drill_string_components',
            'stabilizers', 'downhole_motor', 'mwd_equipment', 'jar_equipment',
            'tools_failure', 'personnel_on_location', 'bop_test', 'daily_problems',
            'time_analysis', 'operation_analysis'
        ])
    LOOP
        EXECUTE format('
            CREATE POLICY "Users can view %I" ON %I
                FOR SELECT USING (
                    EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id)
                )', tbl_name, tbl_name);

        EXECUTE format('
            CREATE POLICY "Users can insert %I" ON %I
                FOR INSERT WITH CHECK (
                    EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
                )', tbl_name, tbl_name);

        EXECUTE format('
            CREATE POLICY "Users can update %I" ON %I
                FOR UPDATE USING (
                    EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
                )', tbl_name, tbl_name);

        EXECUTE format('
            CREATE POLICY "Users can delete %I" ON %I
                FOR DELETE USING (
                    EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND user_id = auth.uid())
                )', tbl_name, tbl_name);
    END LOOP;
END $$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_catalog_updated_at BEFORE UPDATE ON equipment_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Example reference data)
-- ============================================================================

-- Insert some default well types
INSERT INTO well_types (well_type_code, well_type_name, description) VALUES
    ('EXPL', 'Exploration', 'Exploratory well'),
    ('APPR', 'Appraisal', 'Appraisal well'),
    ('DEV', 'Development', 'Development well'),
    ('PROD', 'Production', 'Production well'),
    ('INJ', 'Injection', 'Injection well')
ON CONFLICT (well_type_code) DO NOTHING;

-- Insert default well profiles
INSERT INTO well_profiles (profile_code, profile_name, description) VALUES
    ('VERT', 'Vertical', 'Vertical well'),
    ('DIR', 'Directional', 'Directional well'),
    ('HORIZ', 'Horizontal', 'Horizontal well'),
    ('ERD', 'Extended Reach', 'Extended reach drilling'),
    ('SLANT', 'Slant', 'Slant well')
ON CONFLICT (profile_code) DO NOTHING;

-- Insert default mud types
INSERT INTO mud_types (mud_code, mud_name, mud_category, description) VALUES
    ('WBM-STD', 'Water-Based Mud Standard', 'WBM', 'Standard water-based drilling fluid'),
    ('OBM-STD', 'Oil-Based Mud Standard', 'OBM', 'Standard oil-based drilling fluid'),
    ('SBM-STD', 'Synthetic-Based Mud', 'SBM', 'Synthetic-based drilling fluid'),
    ('AIR', 'Air/Gas', 'Air', 'Air or gas drilling'),
    ('FOAM', 'Foam', 'Foam', 'Foam drilling fluid')
ON CONFLICT (mud_code) DO NOTHING;

-- Insert common lithology types
INSERT INTO lithology_types (lithology_code, lithology_name, color_code, description) VALUES
    ('SS', 'Sandstone', '#F4E4C1', 'Sandstone'),
    ('SH', 'Shale', '#808080', 'Shale'),
    ('LS', 'Limestone', '#87CEEB', 'Limestone'),
    ('DOL', 'Dolomite', '#ADD8E6', 'Dolomite'),
    ('ANHY', 'Anhydrite', '#FFFFFF', 'Anhydrite'),
    ('SALT', 'Salt', '#FFFAFA', 'Salt'),
    ('COAL', 'Coal', '#000000', 'Coal'),
    ('CONG', 'Conglomerate', '#D2B48C', 'Conglomerate')
ON CONFLICT (lithology_code) DO NOTHING;

-- Migration complete!
