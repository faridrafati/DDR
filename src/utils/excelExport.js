import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

export const exportToExcel = async (reportId) => {
  try {
    // Fetch all report data
    const { data: report, error: reportError } = await supabase
      .from('daily_reports')
      .select('*, profiles:user_id(full_name)')
      .eq('id', reportId)
      .single();

    if (reportError) throw reportError;

    const [bits, rop, mud, directional, bha, casing, formations] = await Promise.all([
      supabase.from('bit_records').select('*').eq('report_id', reportId),
      supabase.from('rop_records').select('*').eq('report_id', reportId),
      supabase.from('mud_records').select('*').eq('report_id', reportId),
      supabase.from('directional_records').select('*').eq('report_id', reportId),
      supabase.from('bha_records').select('*').eq('report_id', reportId),
      supabase.from('casing_records').select('*').eq('report_id', reportId),
      supabase.from('formation_tops').select('*').eq('report_id', reportId),
    ]);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // General Information Sheet
    const generalData = [
      ['DAILY DRILLING REPORT'],
      [],
      ['Report Date', new Date(report.report_date).toLocaleDateString()],
      ['Well Name', report.well_name || '-'],
      ['Rig Name', report.rig_name || '-'],
      ['Operator', report.operator || '-'],
      ['Contractor', report.contractor || '-'],
      ['Field', report.field || '-'],
      ['Location', report.location || '-'],
      ['Days Since Spud', report.days_since_spud || '-'],
      [],
      ['DEPTH INFORMATION'],
      ['Hole Depth Start (ft)', report.hole_depth_start || '-'],
      ['Hole Depth End (ft)', report.hole_depth_end || '-'],
      ['24hr Progress (ft)', report.progress_24hr || '-'],
      [],
      ['TIME BREAKDOWN (hours)'],
      ['Drilling', report.drilling_time || '0'],
      ['Tripping', report.tripping_time || '0'],
      ['Casing', report.casing_time || '0'],
      ['Rig Repair', report.rig_repair_time || '0'],
      ['Wait on Cement', report.wait_on_cement_time || '0'],
      ['Other', report.other_time || '0'],
      [],
      ['OPERATIONS SUMMARY'],
      [report.operations_summary || '-'],
      [],
      ['NEXT OPERATIONS'],
      [report.next_operations || '-'],
      [],
      ['SAFETY INCIDENTS'],
      [report.safety_incidents || '-'],
      [],
      ['Created by', report.profiles?.full_name || 'Unknown'],
    ];

    const generalSheet = XLSX.utils.aoa_to_sheet(generalData);

    // Set column widths
    generalSheet['!cols'] = [
      { wch: 25 },
      { wch: 50 },
    ];

    XLSX.utils.book_append_sheet(workbook, generalSheet, 'General');

    // Bit Records Sheet
    if (bits.data && bits.data.length > 0) {
      const bitData = bits.data.map(bit => ({
        'Bit Number': bit.bit_number || '-',
        'Bit Size (in)': bit.bit_size || '-',
        'Bit Type': bit.bit_type || '-',
        'Manufacturer': bit.bit_manufacturer || '-',
        'Serial Number': bit.bit_serial_number || '-',
        'Depth In (ft)': bit.depth_in || '-',
        'Depth Out (ft)': bit.depth_out || '-',
        'Footage (ft)': bit.footage || '-',
        'Hours Run': bit.hours_run || '-',
        'Dull Grade': bit.dull_grade || '-',
        'Reason Pulled': bit.reason_pulled || '-',
      }));

      const bitSheet = XLSX.utils.json_to_sheet(bitData);
      XLSX.utils.book_append_sheet(workbook, bitSheet, 'Bit Records');
    }

    // ROP Data Sheet
    if (rop.data && rop.data.length > 0) {
      const ropData = rop.data.map(r => ({
        'Depth From (ft)': r.depth_from || '-',
        'Depth To (ft)': r.depth_to || '-',
        'Formation': r.formation || '-',
        'Avg ROP (ft/hr)': r.rop_avg || '-',
        'Max ROP (ft/hr)': r.rop_max || '-',
        'WOB (klbs)': r.wob || '-',
        'RPM': r.rpm || '-',
        'Torque (ft-lbs)': r.torque || '-',
        'SPP (psi)': r.spp || '-',
        'Flow Rate (gpm)': r.flow_rate || '-',
      }));

      const ropSheet = XLSX.utils.json_to_sheet(ropData);
      XLSX.utils.book_append_sheet(workbook, ropSheet, 'ROP Data');
    }

    // Mud Data Sheet
    if (mud.data && mud.data.length > 0) {
      const mudData = mud.data.map(m => ({
        'Mud Type': m.mud_type || '-',
        'Weight In (ppg)': m.mud_weight_in || '-',
        'Weight Out (ppg)': m.mud_weight_out || '-',
        'Volume (bbls)': m.mud_volume || '-',
        'PV (cp)': m.plastic_viscosity || '-',
        'YP (lbs/100ft²)': m.yield_point || '-',
        'Gel 10s': m.gel_10sec || '-',
        'Gel 10m': m.gel_10min || '-',
        'API Filtrate': m.api_filtrate || '-',
        'HTHP Filtrate': m.hthp_filtrate || '-',
        'pH': m.ph || '-',
        'Chlorides (ppm)': m.chlorides || '-',
        'Calcium (ppm)': m.calcium || '-',
        'Total Solids (%)': m.total_solids || '-',
        'Sand Content (%)': m.sand_content || '-',
      }));

      const mudSheet = XLSX.utils.json_to_sheet(mudData);
      XLSX.utils.book_append_sheet(workbook, mudSheet, 'Mud Data');
    }

    // Directional Survey Sheet
    if (directional.data && directional.data.length > 0) {
      const directionalData = directional.data.map(d => ({
        'MD (ft)': d.measured_depth || '-',
        'Inc (°)': d.inclination || '-',
        'Azi (°)': d.azimuth || '-',
        'TVD (ft)': d.true_vertical_depth || '-',
        'N/S (ft)': d.north_south || '-',
        'E/W (ft)': d.east_west || '-',
        'VS (ft)': d.vertical_section || '-',
        'DLS (°/100ft)': d.dogleg_severity || '-',
        'Survey Type': d.survey_type || '-',
        'Tool Type': d.tool_type || '-',
      }));

      const directionalSheet = XLSX.utils.json_to_sheet(directionalData);
      XLSX.utils.book_append_sheet(workbook, directionalSheet, 'Directional');
    }

    // BHA Records Sheet
    if (bha.data && bha.data.length > 0) {
      const bhaData = bha.data.map(b => ({
        'BHA Number': b.bha_number || '-',
        'Run Number': b.run_number || '-',
        'Total Length (ft)': b.total_length || '-',
        'Total Weight (lbs)': b.total_weight || '-',
        'Purpose': b.purpose || '-',
        'Components Count': b.components?.length || 0,
        'Notes': b.notes || '-',
      }));

      const bhaSheet = XLSX.utils.json_to_sheet(bhaData);
      XLSX.utils.book_append_sheet(workbook, bhaSheet, 'BHA Records');
    }

    // Casing Records Sheet
    if (casing.data && casing.data.length > 0) {
      const casingData = casing.data.map(c => ({
        'Casing String': c.casing_string || '-',
        'Size (in)': c.casing_size || '-',
        'Weight (lbs/ft)': c.casing_weight || '-',
        'Grade': c.casing_grade || '-',
        'Setting Depth (ft)': c.setting_depth || '-',
        'Top of Cement (ft)': c.top_of_cement || '-',
        'Cement Type': c.cement_type || '-',
        'Cement Volume': c.cement_volume || '-',
        'Cement Density (ppg)': c.cement_density || '-',
        'WOC (hrs)': c.wait_on_cement || '-',
      }));

      const casingSheet = XLSX.utils.json_to_sheet(casingData);
      XLSX.utils.book_append_sheet(workbook, casingSheet, 'Casing');
    }

    // Formation Tops Sheet
    if (formations.data && formations.data.length > 0) {
      const formationData = formations.data.map(f => ({
        'Formation Name': f.formation_name || '-',
        'MD (ft)': f.measured_depth || '-',
        'TVD (ft)': f.true_vertical_depth || '-',
        'Lithology': f.lithology || '-',
        'Description': f.description || '-',
      }));

      const formationSheet = XLSX.utils.json_to_sheet(formationData);
      XLSX.utils.book_append_sheet(workbook, formationSheet, 'Formations');
    }

    // Save Excel file
    const fileName = `DDR_${report.well_name}_${new Date(report.report_date).toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw error;
  }
};
