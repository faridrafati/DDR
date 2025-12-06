import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './AdminPanel.css';

const RigManagement = () => {
  const [rigs, setRigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRig, setEditingRig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contractor: '',
    rig_type: '',
    status: 'active'
  });

  useEffect(() => {
    fetchRigs();
  }, []);

  const fetchRigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rigs')
        .select('*')
        .order('name');

      if (error) throw error;
      setRigs(data || []);
    } catch (error) {
      console.error('Error fetching rigs:', error);
      alert('Failed to fetch rigs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRig) {
        // Update existing rig
        const { error } = await supabase
          .from('rigs')
          .update(formData)
          .eq('id', editingRig.id);

        if (error) throw error;
        alert('Rig updated successfully!');
      } else {
        // Create new rig
        const { error } = await supabase
          .from('rigs')
          .insert([formData]);

        if (error) throw error;
        alert('Rig created successfully!');
      }

      // Reset form and refresh list
      setFormData({ name: '', contractor: '', rig_type: '', status: 'active' });
      setEditingRig(null);
      fetchRigs();
    } catch (error) {
      console.error('Error saving rig:', error);
      alert('Failed to save rig: ' + error.message);
    }
  };

  const handleEdit = (rig) => {
    setEditingRig(rig);
    setFormData({
      name: rig.name,
      contractor: rig.contractor || '',
      rig_type: rig.rig_type || '',
      status: rig.status
    });
  };

  const handleDelete = async (rigId, rigName) => {
    if (!confirm(`Are you sure you want to delete rig "${rigName}"? This will unassign all wells from this rig.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rigs')
        .delete()
        .eq('id', rigId);

      if (error) throw error;
      alert('Rig deleted successfully!');
      fetchRigs();
    } catch (error) {
      console.error('Error deleting rig:', error);
      alert('Failed to delete rig: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditingRig(null);
    setFormData({ name: '', contractor: '', rig_type: '', status: 'active' });
  };

  if (loading) {
    return <div className="loading">Loading rigs...</div>;
  }

  return (
    <div className="admin-section">
      <h2>Rig Management</h2>

      <div className="admin-form-container">
        <h3>{editingRig ? 'Edit Rig' : 'Add New Rig'}</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="rig_name">Rig Name *</label>
            <input
              id="rig_name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Rig-42"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contractor">Contractor</label>
            <input
              id="contractor"
              type="text"
              value={formData.contractor}
              onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
              placeholder="Drilling contractor name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rig_type">Rig Type</label>
            <input
              id="rig_type"
              type="text"
              value={formData.rig_type}
              onChange={(e) => setFormData({ ...formData, rig_type: e.target.value })}
              placeholder="e.g., Land Rig, Offshore Platform"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingRig ? 'Update Rig' : 'Add Rig'}
            </button>
            {editingRig && (
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-table-container">
        <h3>Existing Rigs ({rigs.length})</h3>
        {rigs.length === 0 ? (
          <p>No rigs found. Add one above to get started.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contractor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rigs.map((rig) => (
                <tr key={rig.id}>
                  <td>{rig.name}</td>
                  <td>{rig.contractor || '-'}</td>
                  <td>{rig.rig_type || '-'}</td>
                  <td>
                    <span className={`status-badge status-${rig.status}`}>
                      {rig.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button onClick={() => handleEdit(rig)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(rig.id, rig.name)} className="btn-delete">
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

export default RigManagement;
