import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './AdminPanel.css';

const WellManagement = () => {
  const [wells, setWells] = useState([]);
  const [rigs, setRigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWell, setEditingWell] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rig_id: '',
    operator: '',
    field: '',
    location: '',
    spud_date: '',
    status: 'drilling'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch wells with rig information
      const { data: wellsData, error: wellsError } = await supabase
        .from('wells')
        .select(`
          *,
          rig:rigs(id, name, contractor)
        `)
        .order('name');

      if (wellsError) throw wellsError;

      // Fetch all rigs for the dropdown
      const { data: rigsData, error: rigsError } = await supabase
        .from('rigs')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (rigsError) throw rigsError;

      setWells(wellsData || []);
      setRigs(rigsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const wellData = {
        name: formData.name,
        rig_id: formData.rig_id || null,
        operator: formData.operator || null,
        field: formData.field || null,
        location: formData.location || null,
        spud_date: formData.spud_date || null,
        status: formData.status
      };

      if (editingWell) {
        // Update existing well
        const { error } = await supabase
          .from('wells')
          .update(wellData)
          .eq('id', editingWell.id);

        if (error) throw error;
        alert('Well updated successfully!');
      } else {
        // Create new well
        const { error } = await supabase
          .from('wells')
          .insert([wellData]);

        if (error) throw error;
        alert('Well created successfully!');
      }

      // Reset form and refresh list
      setFormData({
        name: '',
        rig_id: '',
        operator: '',
        field: '',
        location: '',
        spud_date: '',
        status: 'drilling'
      });
      setEditingWell(null);
      fetchData();
    } catch (error) {
      console.error('Error saving well:', error);
      alert('Failed to save well: ' + error.message);
    }
  };

  const handleEdit = (well) => {
    setEditingWell(well);
    setFormData({
      name: well.name,
      rig_id: well.rig_id || '',
      operator: well.operator || '',
      field: well.field || '',
      location: well.location || '',
      spud_date: well.spud_date || '',
      status: well.status
    });
  };

  const handleDelete = async (wellId, wellName) => {
    if (!confirm(`Are you sure you want to delete well "${wellName}"? This will NOT delete associated reports.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('wells')
        .delete()
        .eq('id', wellId);

      if (error) throw error;
      alert('Well deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting well:', error);
      alert('Failed to delete well: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditingWell(null);
    setFormData({
      name: '',
      rig_id: '',
      operator: '',
      field: '',
      location: '',
      spud_date: '',
      status: 'drilling'
    });
  };

  if (loading) {
    return <div className="loading">Loading wells...</div>;
  }

  return (
    <div className="admin-section">
      <h2>Well Management</h2>

      <div className="admin-form-container">
        <h3>{editingWell ? 'Edit Well' : 'Add New Well'}</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="well_name">Well Name *</label>
            <input
              id="well_name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Well-001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rig_id">Assigned Rig *</label>
            <select
              id="rig_id"
              value={formData.rig_id}
              onChange={(e) => setFormData({ ...formData, rig_id: e.target.value })}
              required
            >
              <option value="">Select a rig...</option>
              {rigs.map((rig) => (
                <option key={rig.id} value={rig.id}>
                  {rig.name} {rig.contractor && `(${rig.contractor})`}
                </option>
              ))}
            </select>
            {rigs.length === 0 && (
              <small style={{ color: '#e74c3c' }}>
                No active rigs available. Please add a rig first.
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="operator">Operator</label>
            <input
              id="operator"
              type="text"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              placeholder="Operating company"
            />
          </div>

          <div className="form-group">
            <label htmlFor="field">Field</label>
            <input
              id="field"
              type="text"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              placeholder="Field name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Geographic location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="spud_date">Spud Date</label>
            <input
              id="spud_date"
              type="date"
              value={formData.spud_date}
              onChange={(e) => setFormData({ ...formData, spud_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="planning">Planning</option>
              <option value="drilling">Drilling</option>
              <option value="completed">Completed</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingWell ? 'Update Well' : 'Add Well'}
            </button>
            {editingWell && (
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-table-container">
        <h3>Existing Wells ({wells.length})</h3>
        {wells.length === 0 ? (
          <p>No wells found. Add one above to get started.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Well Name</th>
                <th>Assigned Rig</th>
                <th>Operator</th>
                <th>Field</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wells.map((well) => (
                <tr key={well.id}>
                  <td>{well.name}</td>
                  <td>{well.rig?.name || 'Not assigned'}</td>
                  <td>{well.operator || '-'}</td>
                  <td>{well.field || '-'}</td>
                  <td>{well.location || '-'}</td>
                  <td>
                    <span className={`status-badge status-${well.status}`}>
                      {well.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button onClick={() => handleEdit(well)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(well.id, well.name)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WellManagement;
