import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import ShamsiDatePicker from '../common/ShamsiDatePicker';
import {
  formatShamsiDate,
  compareShamsiDates,
  isShamsiDateInRange,
  getCurrentShamsiDateStr,
  isSameShamsiMonth
} from '../../utils/persianDate';
import './Analytics.css';
import RemarksAndSummary from './RemarksAndSummary';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('remarks');
  const [loading, setLoading] = useState(true);

  // Fields filter (above wells)
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);

  // Wells filter (filtered by selected fields)
  const [allWells, setAllWells] = useState([]); // All wells with field info
  const [wells, setWells] = useState([]); // Filtered wells based on selected fields
  const [selectedWells, setSelectedWells] = useState([]);

  // Initialize endDate with today's date, startDate will be set from DB
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: getCurrentShamsiDateStr('short')
  });

  // Data states
  const [reports, setReports] = useState([]);
  const [ropData, setRopData] = useState([]);
  const [mudData, setMudData] = useState([]);
  const [directionalData, setDirectionalData] = useState([]);
  const [formationData, setFormationData] = useState([]);
  const [bitData, setBitData] = useState([]);
  const [timeAnalysisData, setTimeAnalysisData] = useState([]);

  const tabs = [
    { id: 'remarks', label: 'Remarks & Summary', icon: '📝' },
    { id: 'operations', label: 'Operations Analysis', icon: '📊' },
    { id: 'time', label: 'Time Analysis', icon: '⏱️' },
    { id: 'mud', label: 'Mud Properties', icon: '🧪' },
    { id: 'directional', label: 'Directional Drilling', icon: '🧭' },
    { id: 'formation', label: 'Formation/Lithology', icon: '🪨' },
    { id: 'equipment', label: 'Equipment/Tools', icon: '🔧' },
  ];

  useEffect(() => {
    fetchFieldsAndWells();
  }, []);

  // Filter wells when selected fields change
  useEffect(() => {
    if (selectedFields.length === 0) {
      // Show all wells when no field is selected
      const wellNames = allWells.map(w => w.name).filter(Boolean);
      setWells(wellNames);
    } else {
      // Filter wells by selected fields
      const filteredWells = allWells
        .filter(w => selectedFields.includes(w.field_code))
        .map(w => w.name)
        .filter(Boolean);
      setWells(filteredWells);
      // Also remove selected wells that are no longer in the filtered list
      setSelectedWells(prev => prev.filter(w => filteredWells.includes(w)));
    }
  }, [selectedFields, allWells]);

  useEffect(() => {
    if (selectedWells.length > 0 || dateRange.startDate || dateRange.endDate) {
      fetchAllData();
    } else {
      fetchAllData(); // Fetch all data initially
    }
  }, [selectedWells, dateRange]);

  const fetchFieldsAndWells = async () => {
    try {
      // Fetch fields first
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('fields')
        .select('field_code, field_name')
        .order('field_name');

      console.log('Fields fetch result:', { fieldsData, fieldsError });

      if (!fieldsError && fieldsData) {
        setFields(fieldsData);
      }

      // Fetch wells with field_code
      const { data, error } = await supabase
        .from('wells')
        .select('name, field_code')
        .order('name');

      console.log('Wells fetch result:', { data, error });

      if (!error && data) {
        // Filter out wells with invalid names (only dashes, empty, etc.)
        const validWells = data.filter(w => {
          const name = w.name?.trim();
          return name && name.length > 0 && !/^-+$/.test(name);
        });
        setAllWells(validWells);
        const wellNames = validWells.map(w => w.name).filter(Boolean);
        setWells(wellNames);
      }

      // Fetch minimum date from daily_reports (but not before 1300/01/01)
      const MIN_ALLOWED_DATE = '1300-01-01';
      const { data: minDateData, error: minDateError } = await supabase
        .from('daily_reports')
        .select('report_date')
        .gte('report_date', MIN_ALLOWED_DATE)
        .order('report_date', { ascending: true })
        .limit(1);

      if (!minDateError && minDateData && minDateData.length > 0) {
        const minDate = minDateData[0].report_date;
        console.log('Minimum date from DB:', minDate);
        setDateRange(prev => ({
          ...prev,
          startDate: minDate || MIN_ALLOWED_DATE
        }));
      } else {
        // If no data found, use minimum allowed date
        setDateRange(prev => ({
          ...prev,
          startDate: MIN_ALLOWED_DATE
        }));
      }
    } catch (error) {
      console.error('Error fetching wells:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Build base query filter
      let reportQuery = supabase.from('daily_reports').select('*');

      if (selectedWells.length > 0) {
        reportQuery = reportQuery.in('well_name', selectedWells);
      }
      if (dateRange.startDate) {
        reportQuery = reportQuery.gte('report_date', dateRange.startDate);
      }
      if (dateRange.endDate) {
        reportQuery = reportQuery.lte('report_date', dateRange.endDate);
      }

      const { data: reportsData, error: reportsError } = await reportQuery.order('report_date');
      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      const reportIds = reportsData?.map(r => r.id) || [];

      if (reportIds.length > 0) {
        // Fetch related data in parallel
        const [ropResult, mudResult, directionalResult, formationResult, bitResult, timeResult] = await Promise.all([
          supabase.from('rop_records').select('*').in('report_id', reportIds),
          supabase.from('mud_records').select('*').in('report_id', reportIds),
          supabase.from('directional_records').select('*').in('report_id', reportIds),
          supabase.from('formation_tops').select('*').in('report_id', reportIds),
          supabase.from('bit_records').select('*').in('report_id', reportIds),
          supabase.from('time_analysis').select('*').in('report_id', reportIds).catch(() => ({ data: [] }))
        ]);

        setRopData(ropResult.data || []);
        setMudData(mudResult.data || []);
        setDirectionalData(directionalResult.data || []);
        setFormationData(formationResult.data || []);
        setBitData(bitResult.data || []);
        setTimeAnalysisData(timeResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWellToggle = (wellName) => {
    setSelectedWells(prev =>
      prev.includes(wellName)
        ? prev.filter(w => w !== wellName)
        : [...prev, wellName]
    );
  };

  const handleSelectAllWells = () => {
    if (selectedWells.length === wells.length) {
      setSelectedWells([]);
    } else {
      setSelectedWells([...wells]);
    }
  };

  const handleFieldToggle = (fieldCode) => {
    setSelectedFields(prev =>
      prev.includes(fieldCode)
        ? prev.filter(f => f !== fieldCode)
        : [...prev, fieldCode]
    );
  };

  const handleSelectAllFields = () => {
    if (selectedFields.length === fields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(fields.map(f => f.field_code));
    }
  };

  // Operations Analysis Charts
  const renderOperationsAnalysis = () => {
    // Depth Progress Chart
    const depthChartData = {
      labels: reports.map(r => formatShamsiDate(r.report_date, 'numeric')),
      datasets: [
        {
          label: 'Hole Depth (ft)',
          data: reports.map(r => r.hole_depth_end || 0),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: '24hr Progress (ft)',
          data: reports.map(r => r.progress_24hr || 0),
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };

    // ROP by Formation Chart
    const ropByFormation = ropData.reduce((acc, r) => {
      const formation = r.formation || 'Unknown';
      if (!acc[formation]) {
        acc[formation] = { total: 0, count: 0 };
      }
      acc[formation].total += r.rop_avg || 0;
      acc[formation].count += 1;
      return acc;
    }, {});

    const ropFormationData = {
      labels: Object.keys(ropByFormation),
      datasets: [{
        label: 'Avg ROP (ft/hr)',
        data: Object.values(ropByFormation).map(v => v.count > 0 ? (v.total / v.count).toFixed(2) : 0),
        backgroundColor: [
          '#667eea', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea',
          '#38b2ac', '#f56565', '#4299e1', '#ed64a6', '#ecc94b'
        ],
      }]
    };

    // Drilling Parameters Chart
    const drillingParamsData = {
      labels: ropData.map((r, i) => `${r.depth_from || 0}-${r.depth_to || 0} ft`).slice(0, 20),
      datasets: [
        {
          label: 'WOB (klbs)',
          data: ropData.map(r => r.wob || 0).slice(0, 20),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'RPM',
          data: ropData.map(r => r.rpm || 0).slice(0, 20),
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.5)',
          yAxisID: 'y1',
        }
      ]
    };

    return (
      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Depth Progress Over Time</h3>
          <div className="chart-container">
            <Line
              data={depthChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Depth (ft)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Average ROP by Formation</h3>
          <div className="chart-container">
            <Bar
              data={ropFormationData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'ROP (ft/hr)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Drilling Parameters</h3>
          <div className="chart-container">
            <Bar
              data={drillingParamsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'WOB (klbs)' }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'RPM' },
                    grid: { drawOnChartArea: false }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="stats-card">
          <h3>Operations Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{reports.length}</span>
              <span className="stat-label">Total Reports</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {reports.length > 0 ? Math.max(...reports.map(r => r.hole_depth_end || 0)).toLocaleString() : 0}
              </span>
              <span className="stat-label">Max Depth (ft)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {reports.length > 0 ? (reports.reduce((sum, r) => sum + (r.progress_24hr || 0), 0) / reports.length).toFixed(1) : 0}
              </span>
              <span className="stat-label">Avg 24hr Progress (ft)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {ropData.length > 0 ? (ropData.reduce((sum, r) => sum + (r.rop_avg || 0), 0) / ropData.length).toFixed(2) : 0}
              </span>
              <span className="stat-label">Avg ROP (ft/hr)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Time Analysis Charts
  const renderTimeAnalysis = () => {
    // Aggregate time breakdown from reports
    const timeBreakdown = reports.reduce((acc, r) => {
      acc.drilling += r.drilling_time || 0;
      acc.tripping += r.tripping_time || 0;
      acc.casing += r.casing_time || 0;
      acc.rigRepair += r.rig_repair_time || 0;
      acc.waitOnCement += r.wait_on_cement_time || 0;
      acc.other += r.other_time || 0;
      return acc;
    }, { drilling: 0, tripping: 0, casing: 0, rigRepair: 0, waitOnCement: 0, other: 0 });

    const totalTime = Object.values(timeBreakdown).reduce((a, b) => a + b, 0);

    const timeDistributionData = {
      labels: ['Drilling', 'Tripping', 'Casing', 'Rig Repair', 'Wait on Cement', 'Other'],
      datasets: [{
        data: [
          timeBreakdown.drilling,
          timeBreakdown.tripping,
          timeBreakdown.casing,
          timeBreakdown.rigRepair,
          timeBreakdown.waitOnCement,
          timeBreakdown.other
        ],
        backgroundColor: [
          '#48bb78', // Drilling - green (productive)
          '#667eea', // Tripping - blue
          '#ed8936', // Casing - orange
          '#e53e3e', // Rig Repair - red (non-productive)
          '#9f7aea', // Wait on Cement - purple
          '#718096', // Other - gray
        ],
      }]
    };

    // Daily time trend
    const dailyTimeData = {
      labels: reports.map(r => formatShamsiDate(r.report_date, 'numeric')),
      datasets: [
        {
          label: 'Drilling Time (hrs)',
          data: reports.map(r => r.drilling_time || 0),
          backgroundColor: '#48bb78',
          stack: 'stack0',
        },
        {
          label: 'Non-Productive Time (hrs)',
          data: reports.map(r => (r.rig_repair_time || 0) + (r.wait_on_cement_time || 0)),
          backgroundColor: '#e53e3e',
          stack: 'stack0',
        },
        {
          label: 'Other Operations (hrs)',
          data: reports.map(r => (r.tripping_time || 0) + (r.casing_time || 0) + (r.other_time || 0)),
          backgroundColor: '#667eea',
          stack: 'stack0',
        }
      ]
    };

    // Productive vs Non-Productive
    const productiveTime = timeBreakdown.drilling;
    const nonProductiveTime = timeBreakdown.rigRepair + timeBreakdown.waitOnCement;
    const otherTime = timeBreakdown.tripping + timeBreakdown.casing + timeBreakdown.other;

    const productivityData = {
      labels: ['Productive (Drilling)', 'Non-Productive', 'Support Operations'],
      datasets: [{
        data: [productiveTime, nonProductiveTime, otherTime],
        backgroundColor: ['#48bb78', '#e53e3e', '#667eea'],
      }]
    };

    return (
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Time Distribution</h3>
          <div className="chart-container pie-chart">
            <Pie
              data={timeDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        const percentage = totalTime > 0 ? ((value / totalTime) * 100).toFixed(1) : 0;
                        return `${context.label}: ${value.toFixed(1)} hrs (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Productivity Analysis</h3>
          <div className="chart-container pie-chart">
            <Doughnut
              data={productivityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        const total = productiveTime + nonProductiveTime + otherTime;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${context.label}: ${value.toFixed(1)} hrs (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Daily Time Breakdown</h3>
          <div className="chart-container">
            <Bar
              data={dailyTimeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  x: { stacked: true },
                  y: {
                    stacked: true,
                    title: { display: true, text: 'Hours' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="stats-card">
          <h3>Time Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{totalTime.toFixed(1)}</span>
              <span className="stat-label">Total Hours</span>
            </div>
            <div className="stat-item success">
              <span className="stat-value">{timeBreakdown.drilling.toFixed(1)}</span>
              <span className="stat-label">Drilling Hours</span>
            </div>
            <div className="stat-item danger">
              <span className="stat-value">{(timeBreakdown.rigRepair + timeBreakdown.waitOnCement).toFixed(1)}</span>
              <span className="stat-label">NPT Hours</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {totalTime > 0 ? ((productiveTime / totalTime) * 100).toFixed(1) : 0}%
              </span>
              <span className="stat-label">Drilling Efficiency</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mud Properties Charts
  const renderMudProperties = () => {
    // Mud Weight Trend
    const mudWeightData = {
      labels: mudData.map((m, i) => `Record ${i + 1}`),
      datasets: [
        {
          label: 'Mud Weight In (ppg)',
          data: mudData.map(m => m.mud_weight_in || 0),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Mud Weight Out (ppg)',
          data: mudData.map(m => m.mud_weight_out || 0),
          borderColor: '#e53e3e',
          backgroundColor: 'rgba(229, 62, 62, 0.1)',
          fill: false,
          tension: 0.4,
        }
      ]
    };

    // Rheology Parameters
    const rheologyData = {
      labels: mudData.map((m, i) => `Record ${i + 1}`).slice(0, 15),
      datasets: [
        {
          label: 'Plastic Viscosity (cP)',
          data: mudData.map(m => m.plastic_viscosity || 0).slice(0, 15),
          backgroundColor: '#667eea',
        },
        {
          label: 'Yield Point (lb/100ft²)',
          data: mudData.map(m => m.yield_point || 0).slice(0, 15),
          backgroundColor: '#48bb78',
        }
      ]
    };

    // Mud Type Distribution
    const mudTypes = mudData.reduce((acc, m) => {
      const type = m.mud_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const mudTypeData = {
      labels: Object.keys(mudTypes),
      datasets: [{
        data: Object.values(mudTypes),
        backgroundColor: ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea'],
      }]
    };

    // Chemistry Parameters
    const chemistryData = {
      labels: mudData.map((m, i) => `Record ${i + 1}`).slice(0, 10),
      datasets: [
        {
          label: 'pH',
          data: mudData.map(m => m.ph || 0).slice(0, 10),
          borderColor: '#667eea',
          yAxisID: 'y',
        },
        {
          label: 'Chlorides (mg/L)',
          data: mudData.map(m => m.chlorides || 0).slice(0, 10),
          borderColor: '#48bb78',
          yAxisID: 'y1',
        }
      ]
    };

    return (
      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Mud Weight Trend</h3>
          <div className="chart-container">
            <Line
              data={mudWeightData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Weight (ppg)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Rheology Parameters</h3>
          <div className="chart-container">
            <Bar
              data={rheologyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Mud Type Distribution</h3>
          <div className="chart-container pie-chart">
            <Pie
              data={mudTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Chemistry Parameters</h3>
          <div className="chart-container">
            <Line
              data={chemistryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'pH' }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Chlorides (mg/L)' },
                    grid: { drawOnChartArea: false }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="stats-card">
          <h3>Mud Properties Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{mudData.length}</span>
              <span className="stat-label">Total Records</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {mudData.length > 0 ? (mudData.reduce((sum, m) => sum + (m.mud_weight_in || 0), 0) / mudData.length).toFixed(2) : 0}
              </span>
              <span className="stat-label">Avg Mud Weight (ppg)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {mudData.length > 0 ? (mudData.reduce((sum, m) => sum + (m.plastic_viscosity || 0), 0) / mudData.length).toFixed(1) : 0}
              </span>
              <span className="stat-label">Avg PV (cP)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {mudData.length > 0 ? (mudData.reduce((sum, m) => sum + (m.yield_point || 0), 0) / mudData.length).toFixed(1) : 0}
              </span>
              <span className="stat-label">Avg YP</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Directional Drilling Charts
  const renderDirectionalDrilling = () => {
    // Sort directional data by measured depth
    const sortedDirectional = [...directionalData].sort((a, b) => (a.measured_depth || 0) - (b.measured_depth || 0));

    // Well Profile - Inclination vs Depth
    const inclinationData = {
      labels: sortedDirectional.map(d => d.measured_depth || 0),
      datasets: [{
        label: 'Inclination (°)',
        data: sortedDirectional.map(d => d.inclination || 0),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };

    // TVD vs MD
    const tvdMdData = {
      labels: sortedDirectional.map(d => d.measured_depth || 0),
      datasets: [{
        label: 'True Vertical Depth (ft)',
        data: sortedDirectional.map(d => d.true_vertical_depth || 0),
        borderColor: '#48bb78',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };

    // Dogleg Severity
    const doglegData = {
      labels: sortedDirectional.map(d => d.measured_depth || 0),
      datasets: [{
        label: 'Dogleg Severity (°/100ft)',
        data: sortedDirectional.map(d => d.dogleg_severity || 0),
        borderColor: '#ed8936',
        backgroundColor: 'rgba(237, 137, 54, 0.5)',
        type: 'bar',
      }]
    };

    // Horizontal Displacement (Plan View)
    const planViewData = {
      datasets: [{
        label: 'Well Path',
        data: sortedDirectional.map(d => ({
          x: d.east_west || 0,
          y: d.north_south || 0
        })),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.5)',
        pointRadius: 4,
        showLine: true,
        tension: 0.4,
      }]
    };

    return (
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Inclination vs Depth</h3>
          <div className="chart-container">
            <Line
              data={inclinationData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Measured Depth (ft)' }
                  },
                  y: {
                    title: { display: true, text: 'Inclination (°)' },
                    min: 0,
                    max: 90
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>TVD vs Measured Depth</h3>
          <div className="chart-container">
            <Line
              data={tvdMdData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Measured Depth (ft)' }
                  },
                  y: {
                    reverse: true,
                    title: { display: true, text: 'TVD (ft)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Dogleg Severity</h3>
          <div className="chart-container">
            <Bar
              data={doglegData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Measured Depth (ft)' }
                  },
                  y: {
                    title: { display: true, text: 'DLS (°/100ft)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Plan View (N/S vs E/W)</h3>
          <div className="chart-container">
            <Line
              data={planViewData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: {
                    type: 'linear',
                    title: { display: true, text: 'East/West (ft)' }
                  },
                  y: {
                    type: 'linear',
                    title: { display: true, text: 'North/South (ft)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="stats-card full-width">
          <h3>Directional Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{directionalData.length}</span>
              <span className="stat-label">Survey Points</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {sortedDirectional.length > 0 ? Math.max(...sortedDirectional.map(d => d.inclination || 0)).toFixed(1) : 0}°
              </span>
              <span className="stat-label">Max Inclination</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {sortedDirectional.length > 0 ? Math.max(...sortedDirectional.map(d => d.dogleg_severity || 0)).toFixed(2) : 0}
              </span>
              <span className="stat-label">Max DLS (°/100ft)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {sortedDirectional.length > 0 ? Math.max(...sortedDirectional.map(d => d.measured_depth || 0)).toLocaleString() : 0}
              </span>
              <span className="stat-label">Max MD (ft)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Formation/Lithology Charts
  const renderFormationLithology = () => {
    // Sort formation data by depth
    const sortedFormation = [...formationData].sort((a, b) => (a.measured_depth || 0) - (b.measured_depth || 0));

    // Formation Tops by Depth
    const formationDepthData = {
      labels: sortedFormation.map(f => f.formation_name || 'Unknown'),
      datasets: [{
        label: 'Formation Top Depth (ft)',
        data: sortedFormation.map(f => f.measured_depth || 0),
        backgroundColor: sortedFormation.map((f, i) => {
          const colors = ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea', '#38b2ac', '#f56565', '#4299e1'];
          return colors[i % colors.length];
        }),
      }]
    };

    // Lithology Distribution
    const lithologyCount = formationData.reduce((acc, f) => {
      const lith = f.lithology || 'Unknown';
      acc[lith] = (acc[lith] || 0) + 1;
      return acc;
    }, {});

    const lithologyData = {
      labels: Object.keys(lithologyCount),
      datasets: [{
        data: Object.values(lithologyCount),
        backgroundColor: ['#ecc94b', '#718096', '#4299e1', '#9f7aea', '#ed8936', '#48bb78', '#e53e3e', '#667eea'],
      }]
    };

    // Formation Thickness (calculated from consecutive tops)
    const thicknessData = sortedFormation.slice(0, -1).map((f, i) => ({
      name: f.formation_name,
      thickness: (sortedFormation[i + 1]?.measured_depth || f.measured_depth) - (f.measured_depth || 0)
    }));

    const formationThicknessData = {
      labels: thicknessData.map(t => t.name),
      datasets: [{
        label: 'Thickness (ft)',
        data: thicknessData.map(t => t.thickness),
        backgroundColor: '#667eea',
      }]
    };

    return (
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Formation Tops (Depth)</h3>
          <div className="chart-container">
            <Bar
              data={formationDepthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Depth (ft)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Lithology Distribution</h3>
          <div className="chart-container pie-chart">
            <Doughnut
              data={lithologyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Formation Thickness</h3>
          <div className="chart-container">
            <Bar
              data={formationThicknessData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    title: { display: true, text: 'Thickness (ft)' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Formation Table */}
        <div className="data-table-card full-width">
          <h3>Formation Tops Table</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>MD (ft)</th>
                  <th>TVD (ft)</th>
                  <th>Lithology</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {sortedFormation.map((f, i) => (
                  <tr key={i}>
                    <td>{f.formation_name || '-'}</td>
                    <td>{f.measured_depth?.toLocaleString() || '-'}</td>
                    <td>{f.true_vertical_depth?.toLocaleString() || '-'}</td>
                    <td>{f.lithology || '-'}</td>
                    <td>{f.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Equipment/Tools Charts
  const renderEquipmentTools = () => {
    // Bit Performance Analysis
    const bitPerformanceData = {
      labels: bitData.map(b => `Bit #${b.bit_number || 'N/A'}`),
      datasets: [
        {
          label: 'Footage (ft)',
          data: bitData.map(b => b.footage || 0),
          backgroundColor: '#667eea',
        },
        {
          label: 'Hours Run',
          data: bitData.map(b => b.hours_run || 0),
          backgroundColor: '#48bb78',
        }
      ]
    };

    // ROP by Bit
    const ropByBitData = {
      labels: bitData.map(b => `Bit #${b.bit_number || 'N/A'}`),
      datasets: [{
        label: 'Avg ROP (ft/hr)',
        data: bitData.map(b => b.hours_run > 0 ? (b.footage / b.hours_run).toFixed(2) : 0),
        backgroundColor: '#ed8936',
      }]
    };

    // Bit Type Distribution
    const bitTypes = bitData.reduce((acc, b) => {
      const type = b.bit_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const bitTypeData = {
      labels: Object.keys(bitTypes),
      datasets: [{
        data: Object.values(bitTypes),
        backgroundColor: ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea'],
      }]
    };

    return (
      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Bit Performance</h3>
          <div className="chart-container">
            <Bar
              data={bitPerformanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  y: {
                    title: { display: true, text: 'Value' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>ROP by Bit</h3>
          <div className="chart-container">
            <Bar
              data={ropByBitData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    title: { display: true, text: 'ROP (ft/hr)' }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Bit Type Distribution</h3>
          <div className="chart-container pie-chart">
            <Pie
              data={bitTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' }
                }
              }}
            />
          </div>
        </div>

        {/* Bit Records Table */}
        <div className="data-table-card full-width">
          <h3>Bit Records</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bit #</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Manufacturer</th>
                  <th>Depth In (ft)</th>
                  <th>Depth Out (ft)</th>
                  <th>Footage (ft)</th>
                  <th>Hours</th>
                  <th>ROP (ft/hr)</th>
                  <th>Dull Grade</th>
                </tr>
              </thead>
              <tbody>
                {bitData.map((b, i) => (
                  <tr key={i}>
                    <td>{b.bit_number || '-'}</td>
                    <td>{b.bit_size || '-'}</td>
                    <td>{b.bit_type || '-'}</td>
                    <td>{b.manufacturer || '-'}</td>
                    <td>{b.depth_in?.toLocaleString() || '-'}</td>
                    <td>{b.depth_out?.toLocaleString() || '-'}</td>
                    <td>{b.footage?.toLocaleString() || '-'}</td>
                    <td>{b.hours_run?.toFixed(1) || '-'}</td>
                    <td>{b.hours_run > 0 ? (b.footage / b.hours_run).toFixed(2) : '-'}</td>
                    <td>{b.dull_grade || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="stats-card">
          <h3>Equipment Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{bitData.length}</span>
              <span className="stat-label">Total Bits Used</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {bitData.reduce((sum, b) => sum + (b.footage || 0), 0).toLocaleString()}
              </span>
              <span className="stat-label">Total Footage (ft)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {bitData.reduce((sum, b) => sum + (b.hours_run || 0), 0).toFixed(1)}
              </span>
              <span className="stat-label">Total Bit Hours</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {bitData.length > 0 && bitData.reduce((sum, b) => sum + (b.hours_run || 0), 0) > 0
                  ? (bitData.reduce((sum, b) => sum + (b.footage || 0), 0) / bitData.reduce((sum, b) => sum + (b.hours_run || 0), 0)).toFixed(2)
                  : 0}
              </span>
              <span className="stat-label">Overall ROP (ft/hr)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    // Remarks tab has its own data loading
    if (activeTab === 'remarks') {
      return (
        <RemarksAndSummary
          wells={wells}
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedWells={selectedWells}
          setSelectedWells={setSelectedWells}
          fields={fields}
          selectedFields={selectedFields}
        />
      );
    }

    if (loading) {
      return <div className="loading-state">Loading data...</div>;
    }

    if (reports.length === 0) {
      return (
        <div className="empty-state">
          <p>No data available for the selected filters.</p>
          <p>Try adjusting your well selection or date range.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'operations':
        return renderOperationsAnalysis();
      case 'time':
        return renderTimeAnalysis();
      case 'mud':
        return renderMudProperties();
      case 'directional':
        return renderDirectionalDrilling();
      case 'formation':
        return renderFormationLithology();
      case 'equipment':
        return renderEquipmentTools();
      default:
        return <div>Select a tab to view analytics</div>;
    }
  };

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <div className="header-content">
          <div>
            <h1>Drilling Analytics & Reports</h1>
            <p>Welcome, {profile?.full_name} ({profile?.role})</p>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Dashboard
            </button>
            {profile?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="btn-admin">
                Admin Panel
              </button>
            )}
            <button onClick={signOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="analytics-content">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3>Date Range (Shamsi)</h3>
            <ShamsiDatePicker
              label="Start Date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
              placeholder="Select start date"
              minYear={1300}
            />
            <div style={{ marginTop: '12px' }}>
              <ShamsiDatePicker
                label="End Date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                placeholder="Select end date"
                minYear={1300}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Fields</h3>
            <div className="well-select-header">
              <button
                className="btn-text"
                onClick={handleSelectAllFields}
              >
                {selectedFields.length === fields.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="well-count">
                {selectedFields.length} of {fields.length} selected
              </span>
            </div>
            <div className="wells-checklist">
              {fields.map(field => (
                <label key={field.field_code} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.field_code)}
                    onChange={() => handleFieldToggle(field.field_code)}
                  />
                  <span>{field.field_name || field.field_code}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Wells</h3>
            <div className="well-select-header">
              <button
                className="btn-text"
                onClick={handleSelectAllWells}
                disabled={wells.length === 0}
              >
                {selectedWells.length === wells.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="well-count">
                {selectedWells.length} of {wells.length} selected
              </span>
            </div>
            {selectedFields.length === 0 && fields.length > 0 && (
              <p className="filter-hint">Select fields above to filter wells</p>
            )}
            <div className="wells-checklist">
              {wells.length === 0 ? (
                <p className="empty-list">No wells available</p>
              ) : (
                wells.map(well => (
                  <label key={well} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedWells.includes(well)}
                      onChange={() => handleWellToggle(well)}
                    />
                    <span>{well}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <button
            className="btn-primary btn-refresh"
            onClick={fetchAllData}
          >
            Refresh Data
          </button>
        </aside>

        {/* Main Content */}
        <main className="analytics-main">
          {/* Tab Navigation */}
          <nav className="tab-navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
