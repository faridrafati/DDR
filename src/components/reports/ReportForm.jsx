import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import GeneralDataForm from './forms/GeneralDataForm';
import BitDataForm from './forms/BitDataForm';
import RopDataForm from './forms/RopDataForm';
import MudDataForm from './forms/MudDataForm';
import DirectionalDataForm from './forms/DirectionalDataForm';
import BHADataForm from './forms/BHADataForm';
import CasingDataForm from './forms/CasingDataForm';
import FormationTopsForm from './forms/FormationTopsForm';
import './ReportForm.css';

const ReportForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Main report data
  const [generalData, setGeneralData] = useState({
    report_date: new Date().toISOString().split('T')[0],
    well_name: '',
    rig_name: '',
    operator: '',
    contractor: '',
    field: '',
    location: '',
    report_number: '',
    days_since_spud: '',
    hole_depth_start: '',
    hole_depth_end: '',
    progress_24hr: '',
    drilling_time: '',
    tripping_time: '',
    casing_time: '',
    rig_repair_time: '',
    wait_on_cement_time: '',
    other_time: '',
    operations_summary: '',
    next_operations: '',
    safety_incidents: '',
  });

  const [bitRecords, setBitRecords] = useState([]);
  const [ropRecords, setRopRecords] = useState([]);
  const [mudRecord, setMudRecord] = useState({});
  const [directionalRecords, setDirectionalRecords] = useState([]);
  const [bhaRecords, setBhaRecords] = useState([]);
  const [casingRecords, setCasingRecords] = useState([]);
  const [formationTops, setFormationTops] = useState([]);

  const tabs = [
    { id: 'general', label: 'General Data' },
    { id: 'bit', label: 'Bit Data' },
    { id: 'rop', label: 'ROP Data' },
    { id: 'mud', label: 'Mud Data' },
    { id: 'directional', label: 'Directional' },
    { id: 'bha', label: 'BHA & Tools' },
    { id: 'casing', label: 'Casing' },
    { id: 'formations', label: 'Formations' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Insert main daily report
      const { data: reportData, error: reportError } = await supabase
        .from('daily_reports')
        .insert([{ ...generalData, user_id: user.id }])
        .select()
        .single();

      if (reportError) throw reportError;

      const reportId = reportData.id;

      // Insert bit records
      if (bitRecords.length > 0) {
        const bitData = bitRecords.map(record => ({ ...record, report_id: reportId }));
        const { error: bitError } = await supabase.from('bit_records').insert(bitData);
        if (bitError) throw bitError;
      }

      // Insert ROP records
      if (ropRecords.length > 0) {
        const ropData = ropRecords.map(record => ({ ...record, report_id: reportId }));
        const { error: ropError } = await supabase.from('rop_records').insert(ropData);
        if (ropError) throw ropError;
      }

      // Insert mud record
      if (Object.keys(mudRecord).length > 0) {
        const { error: mudError } = await supabase
          .from('mud_records')
          .insert([{ ...mudRecord, report_id: reportId }]);
        if (mudError) throw mudError;
      }

      // Insert directional records
      if (directionalRecords.length > 0) {
        const dirData = directionalRecords.map(record => ({ ...record, report_id: reportId }));
        const { error: dirError } = await supabase.from('directional_records').insert(dirData);
        if (dirError) throw dirError;
      }

      // Insert BHA records
      if (bhaRecords.length > 0) {
        const bhaData = bhaRecords.map(record => ({ ...record, report_id: reportId }));
        const { error: bhaError } = await supabase.from('bha_records').insert(bhaData);
        if (bhaError) throw bhaError;
      }

      // Insert casing records
      if (casingRecords.length > 0) {
        const casingData = casingRecords.map(record => ({ ...record, report_id: reportId }));
        const { error: casingError } = await supabase.from('casing_records').insert(casingData);
        if (casingError) throw casingError;
      }

      // Insert formation tops
      if (formationTops.length > 0) {
        const formationData = formationTops.map(record => ({ ...record, report_id: reportId }));
        const { error: formationError } = await supabase.from('formation_tops').insert(formationData);
        if (formationError) throw formationError;
      }

      alert('Daily report submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralDataForm data={generalData} setData={setGeneralData} />;
      case 'bit':
        return <BitDataForm records={bitRecords} setRecords={setBitRecords} />;
      case 'rop':
        return <RopDataForm records={ropRecords} setRecords={setRopRecords} />;
      case 'mud':
        return <MudDataForm data={mudRecord} setData={setMudRecord} />;
      case 'directional':
        return <DirectionalDataForm records={directionalRecords} setRecords={setDirectionalRecords} />;
      case 'bha':
        return <BHADataForm records={bhaRecords} setRecords={setBhaRecords} />;
      case 'casing':
        return <CasingDataForm records={casingRecords} setRecords={setCasingRecords} />;
      case 'formations':
        return <FormationTopsForm records={formationTops} setRecords={setFormationTops} />;
      default:
        return null;
    }
  };

  return (
    <div className="report-form-container">
      <div className="report-form-header">
        <h1>New Daily Drilling Report</h1>
        <p>Fill in the drilling data for the day</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="tab-content">
          {renderTabContent()}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
