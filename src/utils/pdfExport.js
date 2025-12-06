import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../lib/supabase';

export const exportToPDF = async (reportId) => {
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

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Daily Drilling Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${new Date(report.report_date).toLocaleDateString()} - ${report.well_name}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // General Information
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('General Information', 14, yPos);
    yPos += 8;

    doc.autoTable({
      startY: yPos,
      head: [['Field', 'Value']],
      body: [
        ['Well Name', report.well_name || '-'],
        ['Rig Name', report.rig_name || '-'],
        ['Operator', report.operator || '-'],
        ['Contractor', report.contractor || '-'],
        ['Field', report.field || '-'],
        ['Location', report.location || '-'],
        ['Days Since Spud', report.days_since_spud || '-'],
        ['Hole Depth Start', `${report.hole_depth_start || '-'} ft`],
        ['Hole Depth End', `${report.hole_depth_end || '-'} ft`],
        ['24hr Progress', `${report.progress_24hr || '-'} ft`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234] },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Time Breakdown
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Time Breakdown (hours)', 14, yPos);
    yPos += 8;

    doc.autoTable({
      startY: yPos,
      head: [['Activity', 'Hours']],
      body: [
        ['Drilling', report.drilling_time || '0'],
        ['Tripping', report.tripping_time || '0'],
        ['Casing', report.casing_time || '0'],
        ['Rig Repair', report.rig_repair_time || '0'],
        ['Wait on Cement', report.wait_on_cement_time || '0'],
        ['Other', report.other_time || '0'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234] },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Operations Summary
    if (report.operations_summary) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Operations Summary', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const splitText = doc.splitTextToSize(report.operations_summary, pageWidth - 28);
      doc.text(splitText, 14, yPos);
      yPos += splitText.length * 5 + 10;
    }

    // Bit Records
    if (bits.data && bits.data.length > 0) {
      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Bit Records', 14, yPos);
      yPos += 8;

      doc.autoTable({
        startY: yPos,
        head: [['Bit #', 'Size', 'Type', 'Depth In', 'Depth Out', 'Footage', 'Hours']],
        body: bits.data.map(bit => [
          bit.bit_number || '-',
          `${bit.bit_size || '-'}"`,
          bit.bit_type || '-',
          `${bit.depth_in || '-'} ft`,
          `${bit.depth_out || '-'} ft`,
          `${bit.footage || '-'} ft`,
          `${bit.hours_run || '-'} hrs`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // ROP Data
    if (rop.data && rop.data.length > 0) {
      if (doc.lastAutoTable.finalY > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('ROP Data', 14, yPos);
      yPos += 8;

      doc.autoTable({
        startY: yPos,
        head: [['From', 'To', 'Formation', 'Avg ROP', 'Max ROP', 'WOB', 'RPM']],
        body: rop.data.map(r => [
          `${r.depth_from} ft`,
          `${r.depth_to} ft`,
          r.formation || '-',
          `${r.rop_avg || '-'} ft/hr`,
          `${r.rop_max || '-'} ft/hr`,
          `${r.wob || '-'} klbs`,
          r.rpm || '-',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
        margin: { left: 14, right: 14 },
      });
    }

    // Directional Survey
    if (directional.data && directional.data.length > 0) {
      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Directional Survey', 14, yPos);
      yPos += 8;

      doc.autoTable({
        startY: yPos,
        head: [['MD', 'Inc', 'Azi', 'TVD', 'N/S', 'E/W', 'DLS']],
        body: directional.data.map(d => [
          `${d.measured_depth} ft`,
          `${d.inclination}°`,
          `${d.azimuth}°`,
          `${d.true_vertical_depth} ft`,
          `${d.north_south} ft`,
          `${d.east_west} ft`,
          `${d.dogleg_severity}°/100ft`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Created by: ${report.profiles?.full_name || 'Unknown'} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `DDR_${report.well_name}_${new Date(report.report_date).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
