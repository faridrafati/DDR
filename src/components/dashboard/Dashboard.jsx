import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { exportToPDF } from '../../utils/pdfExport';
import { exportToExcel } from '../../utils/excelExport';
import './Dashboard.css';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ wellName: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('daily_reports')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('report_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const filteredReports = reports.filter(report => {
    if (filter.wellName && !report.well_name.toLowerCase().includes(filter.wellName.toLowerCase())) {
      return false;
    }
    if (filter.startDate && report.report_date < filter.startDate) {
      return false;
    }
    if (filter.endDate && report.report_date > filter.endDate) {
      return false;
    }
    return true;
  });

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const handleExportPDF = async (report) => {
    try {
      await exportToPDF(report.id);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error exporting to PDF');
    }
  };

  const handleExportExcel = async (report) => {
    try {
      await exportToExcel(report.id);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(reports.filter(r => r.id !== reportId));
      alert('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Daily Drilling Reports</h1>
            <p>Welcome, {profile?.full_name} ({profile?.role})</p>
          </div>
          <div className="header-actions">
            {(profile?.role === 'companyman' || profile?.role === 'admin') && (
              <button
                onClick={() => navigate('/reports/new')}
                className="btn-primary"
              >
                + New Report
              </button>
            )}
            {profile?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="btn-admin"
              >
                Admin Panel
              </button>
            )}
            <button onClick={signOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="filters-section">
          <h2>Filters</h2>
          <div className="filters-grid">
            <div className="form-group">
              <label htmlFor="wellName">Well Name</label>
              <input
                id="wellName"
                name="wellName"
                type="text"
                value={filter.wellName}
                onChange={handleFilterChange}
                placeholder="Search by well name..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={filter.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={filter.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        <div className="reports-section">
          <div className="section-header">
            <h2>Reports ({filteredReports.length})</h2>
          </div>

          {loading ? (
            <div className="loading-state">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="empty-state">
              <p>No reports found</p>
              {(profile?.role === 'companyman' || profile?.role === 'admin') && (
                <button onClick={() => navigate('/reports/new')} className="btn-primary">
                  Create First Report
                </button>
              )}
            </div>
          ) : (
            <div className="reports-table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Well Name</th>
                    <th>Rig</th>
                    <th>Depth</th>
                    <th>24hr Progress</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report.id}>
                      <td>{new Date(report.report_date).toLocaleDateString()}</td>
                      <td className="well-name">{report.well_name}</td>
                      <td>{report.rig_name || '-'}</td>
                      <td>{report.hole_depth_end || '-'} ft</td>
                      <td>{report.progress_24hr || '-'} ft</td>
                      <td>{report.profiles?.full_name || 'Unknown'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewReport(report.id)}
                            className="btn-view"
                            title="View Report"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleExportPDF(report)}
                            className="btn-export"
                            title="Export to PDF"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => handleExportExcel(report)}
                            className="btn-export"
                            title="Export to Excel"
                          >
                            Excel
                          </button>
                          {(profile?.role === 'companyman' || profile?.role === 'admin') &&
                           report.user_id === user.id && (
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="btn-delete"
                              title="Delete Report"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
