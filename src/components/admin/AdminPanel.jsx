import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RigManagement from './RigManagement';
import WellManagement from './WellManagement';
import CompanymanAssignments from './CompanymanAssignments';
import './AdminPanel.css';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('rigs');

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You must be an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>Administration Panel</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        Manage rigs, wells, and companyman assignments
      </p>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'rigs' ? 'active' : ''}`}
          onClick={() => setActiveTab('rigs')}
        >
          Rigs
        </button>
        <button
          className={`admin-tab ${activeTab === 'wells' ? 'active' : ''}`}
          onClick={() => setActiveTab('wells')}
        >
          Wells
        </button>
        <button
          className={`admin-tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>

      {activeTab === 'rigs' && <RigManagement />}
      {activeTab === 'wells' && <WellManagement />}
      {activeTab === 'assignments' && <CompanymanAssignments />}
    </div>
  );
};

export default AdminPanel;
