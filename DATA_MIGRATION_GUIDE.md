# Access Database → Supabase Migration Guide

## Overview

This guide provides step-by-step instructions to migrate data from the Delphi Access databases (DB.mdb and new.mdb) to the Supabase PostgreSQL database.

---

## Prerequisites

### Required Tools

1. **mdb-tools** (Linux/Mac) or **Access Database Engine** (Windows)
2. **Python 3.7+** with pandas
3. **Supabase CLI** or access to Supabase Studio
4. **psql** (PostgreSQL client)

### Installation

#### Option 1: Linux with mdb-tools (Recommended)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mdb-tools

# Fedora/RHEL
sudo dnf install mdb-tools

# Verify installation
mdb-tables --version
```

#### Option 2: Windows with Access Database Engine
```powershell
# Download and install Access Database Engine
# https://www.microsoft.com/en-us/download/details.aspx?id=54920

# Or use Microsoft Access if installed
```

#### Option 3: Docker (if no sudo access)
```bash
# Use Docker container with mdb-tools
docker run -it --rm -v /home/faridrafati/MyProject:/data \
  python:3.11-slim bash

# Inside container:
apt-get update && apt-get install -y mdb-tools
```

---

## Step 1: Explore Access Database Structure

### List all tables in Access databases

```bash
cd "/home/faridrafati/MyProject/Drilling Project/Dreport"

# List tables in DB.mdb
mdb-tables DB.mdb

# List tables in new.mdb
mdb-tables new.mdb
```

### View table schema

```bash
# Get schema for a specific table
mdb-schema DB.mdb

# Get schema for all tables
mdb-schema new.mdb > new_mdb_schema.sql
```

---

## Step 2: Export Access Tables to CSV

### Create export directory

```bash
mkdir -p /home/faridrafati/MyProject/access_export
cd /home/faridrafati/MyProject/access_export
```

### Export all tables from DB.mdb

```bash
#!/bin/bash
# export_db_mdb.sh

DB_PATH="/home/faridrafati/MyProject/Drilling Project/Dreport/DB.mdb"
OUTPUT_DIR="/home/faridrafati/MyProject/access_export/db_mdb"

mkdir -p "$OUTPUT_DIR"

# Get list of tables
TABLES=$(mdb-tables -1 "$DB_PATH")

# Export each table to CSV
for TABLE in $TABLES; do
    echo "Exporting $TABLE..."
    mdb-export "$DB_PATH" "$TABLE" > "$OUTPUT_DIR/${TABLE}.csv"
done

echo "Export from DB.mdb complete!"
```

### Export all tables from new.mdb

```bash
#!/bin/bash
# export_new_mdb.sh

DB_PATH="/home/faridrafati/MyProject/Drilling Project/Dreport/new.mdb"
OUTPUT_DIR="/home/faridrafati/MyProject/access_export/new_mdb"

mkdir -p "$OUTPUT_DIR"

# Get list of tables
TABLES=$(mdb-tables -1 "$DB_PATH")

# Export each table to CSV
for TABLE in $TABLES; do
    echo "Exporting $TABLE..."
    mdb-export "$DB_PATH" "$TABLE" > "$OUTPUT_DIR/${TABLE}.csv"
done

echo "Export from new.mdb complete!"
```

### Make scripts executable and run

```bash
chmod +x export_db_mdb.sh export_new_mdb.sh
./export_db_mdb.sh
./export_new_mdb.sh
```

---

## Step 3: Map Access Tables to Supabase Schema

### Table Mapping

Based on the Delphi code analysis, here's the mapping:

| Access Table | Supabase Table | Notes |
|-------------|----------------|-------|
| **a01** | wells | Main well data |
| **GRP** | (reference - manual) | Field groups |
| **FIELDDATA** | (reference - manual) | Field data descriptions |
| **Fields** | fields | Oil/gas fields |
| **contractor** | contractors | Contractor data |
| **Welltype** | well_types | Well types |
| **WellProfiles** | well_profiles | Well profiles |
| **companies** | contractors | Service companies |
| **n01** | mud_records | Mud properties |
| **n05** | mud_storage_parameters | Mud storage data |
| **l04** | daily_reports | Daily report main data |
| **l05** | bit_records | Bit data |
| **l06** | casing_records | Liner data |
| **l08** | casing_records | Casing data |
| **m04** | directional_records | Directional survey |
| **BottomHoleAssembly** | bha_records | BHA data |
| **DrillString** | drill_string_components | Drill string |
| **Stabilizers** | stabilizers | Stabilizer data |
| **DHmotor** | downhole_motor | Downhole motor |
| **MWD** | mwd_equipment | MWD data |
| **jar** | jar_equipment | Jar data |
| **ChemicalMaterials** | chemical_materials_usage | Materials usage |
| **Equipmentused** | equipment_used | Equipment usage |
| **DailyDrillingCost** | daily_drilling_cost | Cost data |
| **MudParameter** | mud_storage_parameters | Mud parameters |
| **SolidControlParameter** | solid_control_parameters | Solid control |
| **ToolsFailure** | tools_failure | Failed tools |
| **PERSONELS** | personnel_on_location | Personnel |
| **BlowOutPreventor** | bop_test | BOP test data |
| **DailyProblem** | daily_problems | Daily problems |
| **TIMEANALYSIS** | time_analysis | Time analysis |
| **OperationAnalysis** | operation_analysis | Operations log |
| **FORMATION** | formation_tops | Formation data (master) |
| **d07** | formation_tops | Formation tops (data) |
| **KICKOFPOINT** | daily_reports | KOP data (merge) |
| **Materials** | materials | Materials catalog |
| **Equipments** | equipment_catalog | Equipment catalog |
| **[bit]** | bit_catalog | Bit catalog |
| **casing** | casing_catalog | Casing catalog |
| **MudType** | mud_types | Mud types |
| **MudPumpTypes** | (extend bit_records) | Pump types |
| **WellControls** | (reference) | Well control types |
| **Operations** | (reference) | Operation codes |

---

## Step 4: Create Data Transformation Script

Create a Python script to transform and load data:

```python
# data_migration.py
import csv
import os
import sys
from datetime import datetime
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "your_supabase_url"
SUPABASE_KEY = "your_supabase_service_role_key"  # Use service role for migration

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def read_csv(file_path):
    """Read CSV file and return list of dictionaries"""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        return list(reader)

def clean_value(value):
    """Clean and convert values"""
    if value == '' or value is None:
        return None
    if value.lower() in ['null', 'none', 'n/a']:
        return None
    return value

def migrate_fields():
    """Migrate Fields table"""
    print("Migrating Fields...")
    data = read_csv('/home/faridrafati/MyProject/access_export/new_mdb/Fields.csv')

    for row in data:
        record = {
            'field_code': clean_value(row.get('Fieldcode')),
            'field_name': clean_value(row.get('FieldName')),
            'region': clean_value(row.get('Region')),
            'country': clean_value(row.get('Country'))
        }

        try:
            supabase.table('fields').insert(record).execute()
            print(f"  Inserted field: {record['field_name']}")
        except Exception as e:
            print(f"  Error inserting {record['field_code']}: {e}")

def migrate_contractors():
    """Migrate contractors table"""
    print("Migrating Contractors...")
    data = read_csv('/home/faridrafati/MyProject/access_export/new_mdb/contractor.csv')

    for row in data:
        record = {
            'contractor_code': clean_value(row.get('ContractorCode')),
            'contractor_name': clean_value(row.get('contractor')),
            'contractor_type': 'drilling'
        }

        try:
            supabase.table('contractors').insert(record).execute()
            print(f"  Inserted contractor: {record['contractor_name']}")
        except Exception as e:
            print(f"  Error: {e}")

def migrate_wells():
    """Migrate wells from a01 table"""
    print("Migrating Wells...")
    data = read_csv('/home/faridrafati/MyProject/access_export/new_mdb/a01.csv')

    for row in data:
        # First ensure rig exists
        rig_name = clean_value(row.get('RIG'))
        if rig_name:
            try:
                rig = supabase.table('rigs').select('id').eq('name', rig_name).execute()
                if not rig.data:
                    # Create rig
                    rig_data = {'name': rig_name, 'status': 'active'}
                    rig = supabase.table('rigs').insert(rig_data).execute()
                rig_id = rig.data[0]['id']
            except Exception as e:
                print(f"  Error with rig {rig_name}: {e}")
                rig_id = None
        else:
            rig_id = None

        # Create well
        record = {
            'name': clean_value(row.get('wellcode')),
            'rig_id': rig_id,
            'operator': clean_value(row.get('operator')),
            'field': clean_value(row.get('field')),
            'location': clean_value(row.get('location')),
            'spud_date': clean_value(row.get('SpuddedInDate')),
            'well_type_code': clean_value(row.get('WellTypeCode')),
            'well_profile_code': clean_value(row.get('WellProfileCode')),
            'final_forecasted_depth': clean_value(row.get('FinalForecastedDepth')),
            'estimated_total_rig_days': clean_value(row.get('EstTTLRigDays')),
            'reservoir': clean_value(row.get('Reservoir')),
            'rt_elevation': clean_value(row.get('RTLevelSea')),
            'water_depth': clean_value(row.get('WaterDepth'))
        }

        try:
            supabase.table('wells').insert(record).execute()
            print(f"  Inserted well: {record['name']}")
        except Exception as e:
            print(f"  Error inserting {record['name']}: {e}")

def migrate_daily_reports():
    """Migrate daily reports from l04 table"""
    print("Migrating Daily Reports...")
    data = read_csv('/home/faridrafati/MyProject/access_export/new_mdb/l04.csv')

    # You'll need to map to a valid user_id
    # For now, we'll use the first admin user
    admin_user = supabase.table('profiles').select('id').eq('role', 'admin').limit(1).execute()
    if not admin_user.data:
        print("  Error: No admin user found. Create an admin user first.")
        return
    user_id = admin_user.data[0]['id']

    for row in data:
        # Get well_id from well_name
        well_name = clean_value(row.get('wellcode'))
        well = supabase.table('wells').select('id').eq('name', well_name).execute()
        if not well.data:
            print(f"  Warning: Well {well_name} not found, skipping report")
            continue
        well_id = well.data[0]['id']

        record = {
            'user_id': user_id,
            'well_id': well_id,
            'well_name': well_name,
            'report_date': clean_value(row.get('drillingdate')),
            'hole_depth_start': clean_value(row.get('MorningDepth')),
            'hole_depth_end': clean_value(row.get('ToPoint')),
            'progress_24hr': clean_value(row.get('FromPoint')),  # Calculate if needed
            'drilling_time': clean_value(row.get('DrillingTime')),
            'operations_summary': clean_value(row.get('Description')),
            'lithology': clean_value(row.get('Lithology')),
            'well_site_superintendent': clean_value(row.get('WellSiteSupt')),
            'operation_superintendent': clean_value(row.get('OPNSupt')),
            'program_engineer': clean_value(row.get('ProgEng')),
            'geologist': clean_value(row.get('Geologist')),
            'weather_conditions': clean_value(row.get('mv')),
            'wind_speed_direction': clean_value(row.get('WindSpeed_Dir')),
            'wave_visibility': clean_value(row.get('WaveVisible')),
            'fresh_water_used': clean_value(row.get('FWater')),
            'fuel_consumed': clean_value(row.get('Fuel'))
        }

        try:
            result = supabase.table('daily_reports').insert(record).execute()
            report_id = result.data[0]['id']
            print(f"  Inserted report for {well_name} on {record['report_date']}")

            # Migrate related data (bit, mud, etc.) for this report
            # This will be done in separate functions

        except Exception as e:
            print(f"  Error: {e}")

# Add more migration functions for other tables...

def main():
    """Main migration function"""
    print("Starting Access to Supabase Migration")
    print("=" * 50)

    # Migrate in order (reference data first)
    migrate_fields()
    migrate_contractors()
    migrate_wells()
    migrate_daily_reports()
    # Add more migration calls...

    print("=" * 50)
    print("Migration Complete!")

if __name__ == "__main__":
    main()
```

---

## Step 5: Execute Migration

### Prepare environment

```bash
# Install Python dependencies
pip3 install --user supabase pandas

# Set environment variables
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### Run migration script

```bash
cd /home/faridrafati/MyProject/ddr-app
python3 data_migration.py
```

---

## Step 6: Verify Migration

### Check record counts

```sql
-- In Supabase SQL Editor

SELECT 'fields' as table_name, COUNT(*) as count FROM fields
UNION ALL
SELECT 'contractors', COUNT(*) FROM contractors
UNION ALL
SELECT 'wells', COUNT(*) FROM wells
UNION ALL
SELECT 'daily_reports', COUNT(*) FROM daily_reports
UNION ALL
SELECT 'bit_records', COUNT(*) FROM bit_records
UNION ALL
SELECT 'mud_records', COUNT(*) FROM mud_records
ORDER BY table_name;
```

### Spot check data

```sql
-- Check wells
SELECT * FROM wells LIMIT 10;

-- Check daily reports
SELECT * FROM daily_reports ORDER BY report_date DESC LIMIT 10;

-- Check referential integrity
SELECT
    dr.id,
    dr.report_date,
    dr.well_name,
    w.name as well_ref
FROM daily_reports dr
LEFT JOIN wells w ON dr.well_id = w.id
WHERE dr.well_id IS NOT NULL
LIMIT 10;
```

---

## Alternative: Manual Migration (Small Dataset)

If the dataset is small, you can manually migrate using Supabase Studio:

1. Export Access tables to CSV (using mdb-export or Access export feature)
2. Open Supabase Studio
3. Go to Table Editor
4. Click on table → "Insert" → "Import data from CSV"
5. Map columns and import

---

## Troubleshooting

### Issue: mdb-tools not available
**Solution**: Use Docker container or Windows with Access

### Issue: Character encoding errors
**Solution**: Use `iconv` to convert encoding:
```bash
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

### Issue: Foreign key violations
**Solution**: Migrate in correct order (reference tables first, then data tables)

### Issue: Duplicate key errors
**Solution**: Use UPSERT or check for existing records before inserting

---

## Performance Tips

1. **Batch inserts**: Insert in batches of 100-1000 records
2. **Disable triggers**: Temporarily disable RLS for faster import
3. **Use transactions**: Wrap related inserts in transactions
4. **Parallel processing**: Migrate independent tables in parallel

---

## Post-Migration Tasks

- [ ] Verify all data migrated
- [ ] Check referential integrity
- [ ] Update sequences (if using serial IDs)
- [ ] Re-enable RLS policies
- [ ] Create admin user if needed
- [ ] Test application with migrated data
- [ ] Backup Supabase database
- [ ] Update documentation

---

## Migration Checklist

### Reference Data
- [ ] fields
- [ ] contractors
- [ ] well_types
- [ ] well_profiles
- [ ] mud_types
- [ ] lithology_types
- [ ] materials
- [ ] equipment_catalog
- [ ] bit_catalog
- [ ] casing_catalog

### Master Data
- [ ] rigs
- [ ] wells

### Operational Data
- [ ] daily_reports
- [ ] bit_records
- [ ] rop_records
- [ ] mud_records
- [ ] directional_records
- [ ] bha_records
- [ ] casing_records
- [ ] formation_tops
- [ ] personnel_on_location
- [ ] daily_drilling_cost
- [ ] chemical_materials_usage
- [ ] equipment_used
- [ ] downhole_motor
- [ ] mwd_equipment
- [ ] jar_equipment
- [ ] bop_test
- [ ] tools_failure
- [ ] daily_problems
- [ ] time_analysis
- [ ] operation_analysis

---

## Estimated Time

- **Small Dataset** (<1000 reports): 2-4 hours
- **Medium Dataset** (1000-10000 reports): 4-8 hours
- **Large Dataset** (>10000 reports): 1-2 days

---

## Support Files

All necessary scripts will be created in:
- `/home/faridrafati/MyProject/migration_scripts/`

**Next**: Run the automated migration script creator below.
