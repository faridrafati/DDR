// Test script to verify mud type matching logic
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testMudTypeMatching() {
  console.log('=== TESTING MUD TYPE MATCHING ===\n');

  // Step 1: Fetch all mud types
  console.log('Step 1: Fetching mud_types from database...');
  const { data: mudTypes, error: typesError } = await supabase
    .from('mud_types')
    .select('*')
    .order('mud_name');

  if (typesError) {
    console.error('Error fetching mud types:', typesError);
    return;
  }

  console.log(`Loaded ${mudTypes.length} mud types from database`);
  mudTypes.forEach(t => console.log(`  - ${t.mud_code}: ${t.mud_name}`));

  // Step 2: Fetch available mud type codes for AB-003
  console.log('\nStep 2: Fetching mud type codes from mud_records for AB-003...');
  const { data: mudRecordsData, error: recordsError } = await supabase
    .from('mud_records')
    .select('mud_type')
    .in('well_code', ['AB-003'])
    .not('mud_type', 'is', null);

  if (recordsError) {
    console.error('Error fetching mud records:', recordsError);
    return;
  }

  const uniqueMudTypeCodes = [...new Set(mudRecordsData.map(r => r.mud_type))].filter(Boolean);
  console.log(`Found ${uniqueMudTypeCodes.length} unique mud type codes:`, uniqueMudTypeCodes);

  // Step 3: Convert codes to names
  console.log('\nStep 3: Converting codes to names...');
  const uniqueMudTypeNames = uniqueMudTypeCodes.map(code => {
    console.log(`\nProcessing code: "${code}" (type: ${typeof code})`);

    // Try exact match
    let mudType = mudTypes.find(t => t.mud_code === code);
    console.log(`  Exact match (mud_code === code): ${mudType ? 'FOUND' : 'NOT FOUND'}`);

    // If not found, try by name
    if (!mudType) {
      mudType = mudTypes.find(t => t.mud_name === code);
      console.log(`  Name match (mud_name === code): ${mudType ? 'FOUND' : 'NOT FOUND'}`);
    }

    // If still not found, try trimming
    if (!mudType) {
      const trimmedCode = code.toString().trim();
      console.log(`  Trying trimmed code: "${trimmedCode}"`);
      mudType = mudTypes.find(t =>
        t.mud_code?.toString().trim() === trimmedCode ||
        t.mud_code?.toString().padStart(2, '0') === trimmedCode.padStart(2, '0')
      );
      console.log(`  Trim/pad match: ${mudType ? 'FOUND' : 'NOT FOUND'}`);
    }

    const result = mudType ? (mudType.mud_name?.trim() || code) : code;
    console.log(`  Final result for code "${code}": "${result}"`);
    return result;
  }).filter(Boolean);

  console.log('\nStep 4: Final unique mud type names:', uniqueMudTypeNames);

  // Step 4: Filter mudTypes to only include available ones
  console.log('\nStep 5: Filtering mudTypes to show only available ones...');
  const availableMudTypes = mudTypes.filter(t => {
    const normalizedMudName = t.mud_name?.trim();
    const isAvailable = uniqueMudTypeNames.some(availName =>
      availName?.trim() === normalizedMudName
    );
    console.log(`  Checking ${t.mud_code} (${normalizedMudName}): ${isAvailable ? 'INCLUDED' : 'EXCLUDED'}`);
    return isAvailable;
  });

  console.log(`\nFinal result: ${availableMudTypes.length} mud types should appear in filter:`);
  availableMudTypes.forEach(t => console.log(`  ✓ ${t.mud_code}: ${t.mud_name}`));

  if (availableMudTypes.length !== 5) {
    console.log('\n❌ ERROR: Expected 5 mud types but got', availableMudTypes.length);
  } else {
    console.log('\n✓ SUCCESS: All 5 mud types matched correctly');
  }
}

testMudTypeMatching().catch(console.error);
