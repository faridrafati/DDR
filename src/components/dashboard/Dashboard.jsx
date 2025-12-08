import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { exportToPDF } from '../../utils/pdfExport';
import { exportToExcel } from '../../utils/excelExport';
import ShamsiDatePicker from '../common/ShamsiDatePicker';
import {
  formatShamsiDate,
  compareShamsiDates,
  getCurrentShamsiDate,
  isSameShamsiMonth
} from '../../utils/persianDate';
import './Dashboard.css';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ wellName: '', startDate: '', endDate: '' });
  const [stats, setStats] = useState({
    totalReports: 0,
    totalWells: 0,
    maxDepth: 0,
    avgProgress: 0,
    totalDrillingHours: 0,
    reportsThisMonth: 0
  });

  useEffect(() => {
    fetchReports();
    fetchWellsCount();
  }, []);

  const fetchWellsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('wells')
        .select('*', { count: 'exact', head: true });

      console.log('Wells count result:', { count, error });

      if (!error && count !== null) {
        setStats(prev => ({ ...prev, totalWells: count }));
      }
    } catch (error) {
      console.error('Error fetching wells count:', error);
    }
  };

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

      // Calculate statistics
      if (data && data.length > 0) {
        const maxDepth = Math.max(...data.map(r => r.hole_depth_end || 0));
        const totalProgress = data.reduce((sum, r) => sum + (r.progress_24hr || 0), 0);
        const avgProgress = data.length > 0 ? totalProgress / data.length : 0;
        const totalDrillingHours = data.reduce((sum, r) => sum + (r.drilling_time || 0), 0);

        // Count reports from this Shamsi month
        const currentShamsi = getCurrentShamsiDate();
        const currentMonthStr = currentShamsi
          ? `${currentShamsi.jy}-${String(currentShamsi.jm).padStart(2, '0')}-01`
          : '';
        const thisMonth = data.filter(r => {
          return r.report_date && currentMonthStr && isSameShamsiMonth(r.report_date, currentMonthStr);
        }).length;

        setStats(prev => ({
          ...prev,
          totalReports: data.length,
          maxDepth,
          avgProgress: avgProgress.toFixed(1),
          totalDrillingHours: totalDrillingHours.toFixed(1),
          reportsThisMonth: thisMonth
        }));
      }
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
    if (filter.wellName && !report.well_name?.toLowerCase().includes(filter.wellName.toLowerCase())) {
      return false;
    }
    if (filter.startDate && report.report_date && compareShamsiDates(report.report_date, filter.startDate) < 0) {
      return false;
    }
    if (filter.endDate && report.report_date && compareShamsiDates(report.report_date, filter.endDate) > 0) {
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
            <button
              onClick={() => navigate('/analytics')}
              className="btn-analytics"
            >
              Analytics & Charts
            </button>
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
        {/* Summary Stats Cards */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon reports-icon">📋</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalReports}</span>
              <span className="stat-label">Total Reports</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon wells-icon">🛢️</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalWells}</span>
              <span className="stat-label">Active Wells</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon depth-icon">📏</div>
            <div className="stat-info">
              <span className="stat-value">{stats.maxDepth.toLocaleString()}</span>
              <span className="stat-label">Max Depth (ft)</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon progress-icon">📈</div>
            <div className="stat-info">
              <span className="stat-value">{stats.avgProgress}</span>
              <span className="stat-label">Avg 24hr Progress (ft)</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon drilling-icon">⏱️</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalDrillingHours}</span>
              <span className="stat-label">Total Drilling Hours</span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon month-icon">📅</div>
            <div className="stat-info">
              <span className="stat-value">{stats.reportsThisMonth}</span>
              <span className="stat-label">Reports This Month</span>
            </div>
          </div>
        </div>

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
            <ShamsiDatePicker
              label="Start Date (Shamsi)"
              id="startDate"
              value={filter.startDate}
              onChange={(date) => setFilter(prev => ({ ...prev, startDate: date }))}
              placeholder="Select start date"
            />
            <ShamsiDatePicker
              label="End Date (Shamsi)"
              id="endDate"
              value={filter.endDate}
              onChange={(date) => setFilter(prev => ({ ...prev, endDate: date }))}
              placeholder="Select end date"
            />
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
                    <th>Date (Shamsi)</th>
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
                      <td>{formatShamsiDate(report.report_date, 'numeric')}</td>
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
