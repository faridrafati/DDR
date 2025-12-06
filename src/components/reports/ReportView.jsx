import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { exportToPDF } from '../../utils/pdfExport';
import { exportToExcel } from '../../utils/excelExport';
import './ReportView.css';

const ReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [bitRecords, setBitRecords] = useState([]);
  const [ropRecords, setRopRecords] = useState([]);
  const [mudRecords, setMudRecords] = useState([]);
  const [directionalRecords, setDirectionalRecords] = useState([]);
  const [bhaRecords, setBhaRecords] = useState([]);
  const [casingRecords, setCasingRecords] = useState([]);
  const [formationTops, setFormationTops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [id]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch main report
      const { data: reportData, error: reportError } = await supabase
        .from('daily_reports')
        .select('*, profiles:user_id(full_name)')
        .eq('id', id)
        .single();

      if (reportError) throw reportError;
      setReport(reportData);

      // Fetch all related data
      const [bits, rop, mud, directional, bha, casing, formations] = await Promise.all([
        supabase.from('bit_records').select('*').eq('report_id', id),
        supabase.from('rop_records').select('*').eq('report_id', id),
        supabase.from('mud_records').select('*').eq('report_id', id),
        supabase.from('directional_records').select('*').eq('report_id', id),
        supabase.from('bha_records').select('*').eq('report_id', id),
        supabase.from('casing_records').select('*').eq('report_id', id),
        supabase.from('formation_tops').select('*').eq('report_id', id),
      ]);

      setBitRecords(bits.data || []);
      setRopRecords(rop.data || []);
      setMudRecords(mud.data || []);
      setDirectionalRecords(directional.data || []);
      setBhaRecords(bha.data || []);
      setCasingRecords(casing.data || []);
      setFormationTops(formations.data || []);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Error loading report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(id);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error exporting to PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportToExcel(id);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading report...</div>;
  }

  if (!report) {
    return <div className="error-container">Report not found</div>;
  }

  return (
    <div className="report-view-container">
      <div className="report-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
          <h1>Daily Drilling Report</h1>
          <p>{new Date(report.report_date).toLocaleDateString()} - {report.well_name}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleExportPDF} className="btn-export">
            Export PDF
          </button>
          <button onClick={handleExportExcel} className="btn-export">
            Export Excel
          </button>
        </div>
      </div>

      <div className="report-content">
        {/* General Information */}
        <section className="report-section">
          <h2>General Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Report Date:</label>
              <span>{new Date(report.report_date).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Well Name:</label>
              <span>{report.well_name}</span>
            </div>
            <div className="info-item">
              <label>Rig Name:</label>
              <span>{report.rig_name || '-'}</span>
            </div>
            <div className="info-item">
              <label>Operator:</label>
              <span>{report.operator || '-'}</span>
            </div>
            <div className="info-item">
              <label>Contractor:</label>
              <span>{report.contractor || '-'}</span>
            </div>
            <div className="info-item">
              <label>Field:</label>
              <span>{report.field || '-'}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{report.location || '-'}</span>
            </div>
            <div className="info-item">
              <label>Days Since Spud:</label>
              <span>{report.days_since_spud || '-'}</span>
            </div>
          </div>

          <h3>Depth Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Hole Depth Start:</label>
              <span>{report.hole_depth_start} ft</span>
            </div>
            <div className="info-item">
              <label>Hole Depth End:</label>
              <span>{report.hole_depth_end} ft</span>
            </div>
            <div className="info-item">
              <label>24hr Progress:</label>
              <span>{report.progress_24hr} ft</span>
            </div>
          </div>

          <h3>Time Breakdown</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Drilling:</label>
              <span>{report.drilling_time || 0} hrs</span>
            </div>
            <div className="info-item">
              <label>Tripping:</label>
              <span>{report.tripping_time || 0} hrs</span>
            </div>
            <div className="info-item">
              <label>Casing:</label>
              <span>{report.casing_time || 0} hrs</span>
            </div>
            <div className="info-item">
              <label>Rig Repair:</label>
              <span>{report.rig_repair_time || 0} hrs</span>
            </div>
            <div className="info-item">
              <label>Wait on Cement:</label>
              <span>{report.wait_on_cement_time || 0} hrs</span>
            </div>
            <div className="info-item">
              <label>Other:</label>
              <span>{report.other_time || 0} hrs</span>
            </div>
          </div>

          {report.operations_summary && (
            <>
              <h3>Operations Summary</h3>
              <p className="text-content">{report.operations_summary}</p>
            </>
          )}

          {report.next_operations && (
            <>
              <h3>Next Operations</h3>
              <p className="text-content">{report.next_operations}</p>
            </>
          )}

          {report.safety_incidents && (
            <>
              <h3>Safety Incidents / Notes</h3>
              <p className="text-content">{report.safety_incidents}</p>
            </>
          )}
        </section>

        {/* Bit Records */}
        {bitRecords.length > 0 && (
          <section className="report-section">
            <h2>Bit Records</h2>
            {bitRecords.map((bit, index) => (
              <div key={index} className="sub-record">
                <h4>Bit #{bit.bit_number}</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Size:</label>
                    <span>{bit.bit_size}"</span>
                  </div>
                  <div className="info-item">
                    <label>Type:</label>
                    <span>{bit.bit_type}</span>
                  </div>
                  <div className="info-item">
                    <label>Manufacturer:</label>
                    <span>{bit.bit_manufacturer}</span>
                  </div>
                  <div className="info-item">
                    <label>Serial:</label>
                    <span>{bit.bit_serial_number}</span>
                  </div>
                  <div className="info-item">
                    <label>Depth In:</label>
                    <span>{bit.depth_in} ft</span>
                  </div>
                  <div className="info-item">
                    <label>Depth Out:</label>
                    <span>{bit.depth_out} ft</span>
                  </div>
                  <div className="info-item">
                    <label>Footage:</label>
                    <span>{bit.footage} ft</span>
                  </div>
                  <div className="info-item">
                    <label>Hours Run:</label>
                    <span>{bit.hours_run} hrs</span>
                  </div>
                  {bit.dull_grade && (
                    <div className="info-item full-width">
                      <label>Dull Grade:</label>
                      <span>{bit.dull_grade}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ROP Records */}
        {ropRecords.length > 0 && (
          <section className="report-section">
            <h2>ROP Data</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Depth From</th>
                    <th>Depth To</th>
                    <th>Formation</th>
                    <th>Avg ROP</th>
                    <th>Max ROP</th>
                    <th>WOB</th>
                    <th>RPM</th>
                    <th>SPP</th>
                  </tr>
                </thead>
                <tbody>
                  {ropRecords.map((rop, index) => (
                    <tr key={index}>
                      <td>{rop.depth_from} ft</td>
                      <td>{rop.depth_to} ft</td>
                      <td>{rop.formation}</td>
                      <td>{rop.rop_avg} ft/hr</td>
                      <td>{rop.rop_max} ft/hr</td>
                      <td>{rop.wob} klbs</td>
                      <td>{rop.rpm}</td>
                      <td>{rop.spp} psi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mud Records */}
        {mudRecords.length > 0 && (
          <section className="report-section">
            <h2>Mud Data</h2>
            {mudRecords.map((mud, index) => (
              <div key={index}>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Mud Type:</label>
                    <span>{mud.mud_type}</span>
                  </div>
                  <div className="info-item">
                    <label>Weight In:</label>
                    <span>{mud.mud_weight_in} ppg</span>
                  </div>
                  <div className="info-item">
                    <label>Weight Out:</label>
                    <span>{mud.mud_weight_out} ppg</span>
                  </div>
                  <div className="info-item">
                    <label>Volume:</label>
                    <span>{mud.mud_volume} bbls</span>
                  </div>
                  <div className="info-item">
                    <label>PV:</label>
                    <span>{mud.plastic_viscosity} cp</span>
                  </div>
                  <div className="info-item">
                    <label>YP:</label>
                    <span>{mud.yield_point} lbs/100ft²</span>
                  </div>
                  <div className="info-item">
                    <label>pH:</label>
                    <span>{mud.ph}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Directional Records */}
        {directionalRecords.length > 0 && (
          <section className="report-section">
            <h2>Directional Survey</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MD</th>
                    <th>Inc</th>
                    <th>Azi</th>
                    <th>TVD</th>
                    <th>N/S</th>
                    <th>E/W</th>
                    <th>DLS</th>
                  </tr>
                </thead>
                <tbody>
                  {directionalRecords.map((survey, index) => (
                    <tr key={index}>
                      <td>{survey.measured_depth} ft</td>
                      <td>{survey.inclination}°</td>
                      <td>{survey.azimuth}°</td>
                      <td>{survey.true_vertical_depth} ft</td>
                      <td>{survey.north_south} ft</td>
                      <td>{survey.east_west} ft</td>
                      <td>{survey.dogleg_severity}°/100ft</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Created by */}
        <section className="report-footer">
          <p>Created by: {report.profiles?.full_name}</p>
          <p>Report created: {new Date(report.created_at).toLocaleString()}</p>
        </section>
      </div>
    </div>
  );
};

export default ReportView;
