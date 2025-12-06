import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './AdminPanel.css';

const CompanymanAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [companymans, setCompanymans] = useState([]);
  const [rigs, setRigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyman_id: '',
    rig_id: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assignments with companyman and rig details
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('companyman_rig_assignments')
        .select(`
          *,
          companyman:profiles!companyman_id(id, full_name, email),
          rig:rigs(id, name, contractor)
        `)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Fetch all companymans
      const { data: companymansData, error: companymansError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'companyman')
        .order('full_name');

      if (companymansError) throw companymansError;

      // Fetch all rigs
      const { data: rigsData, error: rigsError } = await supabase
        .from('rigs')
        .select('*')
        .order('name');

      if (rigsError) throw rigsError;

      setAssignments(assignmentsData || []);
      setCompanymans(companymansData || []);
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
      const { error } = await supabase
        .from('companyman_rig_assignments')
        .insert([{
          companyman_id: formData.companyman_id,
          rig_id: formData.rig_id,
          is_active: formData.is_active
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          alert('This companyman is already assigned to this rig!');
        } else {
          throw error;
        }
        return;
      }

      alert('Assignment created successfully!');
      setFormData({ companyman_id: '', rig_id: '', is_active: true });
      fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment: ' + error.message);
    }
  };

  const toggleActive = async (assignmentId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('companyman_rig_assignments')
        .update({ is_active: !currentStatus })
        .eq('id', assignmentId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Failed to update assignment: ' + error.message);
    }
  };

  const handleDelete = async (assignmentId, companymanName, rigName) => {
    if (!confirm(`Are you sure you want to remove the assignment of "${companymanName}" from "${rigName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('companyman_rig_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      alert('Assignment deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading assignments...</div>;
  }

  // Group assignments by rig
  const assignmentsByRig = rigs.map(rig => ({
    rig,
    assignments: assignments.filter(a => a.rig_id === rig.id)
  }));

  return (
    <div className="admin-section">
      <h2>Companyman-Rig Assignments</h2>

      <div className="admin-form-container">
        <h3>Assign Companyman to Rig</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="companyman_id">Companyman *</label>
            <select
              id="companyman_id"
              value={formData.companyman_id}
              onChange={(e) => setFormData({ ...formData, companyman_id: e.target.value })}
              required
            >
              <option value="">Select a companyman...</option>
              {companymans.map((cm) => (
                <option key={cm.id} value={cm.id}>
                  {cm.full_name} ({cm.email})
                </option>
              ))}
            </select>
            {companymans.length === 0 && (
              <small style={{ color: '#e74c3c' }}>
                No companymans found. Users need to sign up with the companyman role.
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rig_id">Rig *</label>
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
                No rigs available. Please add a rig first.
              </small>
            )}
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Active Assignment
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Create Assignment
            </button>
          </div>
        </form>
      </div>

      <div className="admin-table-container">
        <h3>Current Assignments</h3>
        {assignmentsByRig.map(({ rig, assignments }) => (
          <div key={rig.id} className="rig-assignments-section">
            <h4>
              {rig.name}
              {rig.contractor && ` (${rig.contractor})`}
              <span className={`status-badge status-${rig.status}`}>{rig.status}</span>
            </h4>

            {assignments.length === 0 ? (
              <p className="no-assignments">No companymans assigned to this rig</p>
            ) : (
              <table className="admin-table compact">
                <thead>
                  <tr>
                    <th>Companyman</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Assigned Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>{assignment.companyman?.full_name || 'Unknown'}</td>
                      <td>{assignment.companyman?.email || '-'}</td>
                      <td>
                        <span className={`status-badge ${assignment.is_active ? 'status-active' : 'status-inactive'}`}>
                          {assignment.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                      <td className="actions">
                        <button
                          onClick={() => toggleActive(assignment.id, assignment.is_active)}
                          className={assignment.is_active ? 'btn-secondary' : 'btn-primary'}
                        >
                          {assignment.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(
                            assignment.id,
                            assignment.companyman?.full_name,
                            rig.name
                          )}
                          className="btn-delete"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}

        {assignments.length === 0 && (
          <p>No assignments found. Create one above to get started.</p>
        )}
      </div>
    </div>
  );
};

export default CompanymanAssignments;
