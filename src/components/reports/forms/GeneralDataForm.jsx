import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const GeneralDataForm = ({ data, setData }) => {
  const { user } = useAuth();
  const [availableWells, setAvailableWells] = useState([]);
  const [loadingWells, setLoadingWells] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAvailableWells();
    }
  }, [user]);

  const fetchAvailableWells = async () => {
    try {
      setLoadingWells(true);
      const { data: wells, error } = await supabase
        .rpc('get_companyman_wells', { companyman_uuid: user.id });

      if (error) throw error;
      setAvailableWells(wells || []);
    } catch (error) {
      console.error('Error fetching wells:', error);
      setAvailableWells([]);
    } finally {
      setLoadingWells(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleWellChange = (e) => {
    const selectedWellId = e.target.value;
    const selectedWell = availableWells.find(w => w.well_id === selectedWellId);

    if (selectedWell) {
      setData(prev => ({
        ...prev,
        well_id: selectedWell.well_id,
        well_name: selectedWell.well_name,
        rig_name: selectedWell.rig_name,
        operator: selectedWell.operator || prev.operator,
        field: selectedWell.field || prev.field,
        location: selectedWell.location || prev.location,
      }));
    }
  };

  return (
    <div className="form-section">
      <h2>General Information</h2>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="report_date">Report Date *</label>
          <input
            id="report_date"
            name="report_date"
            type="date"
            value={data.report_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="report_number">Report Number</label>
          <input
            id="report_number"
            name="report_number"
            type="number"
            value={data.report_number}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="well_id">Well Name *</label>
          {loadingWells ? (
            <select disabled>
              <option>Loading wells...</option>
            </select>
          ) : availableWells.length === 0 ? (
            <div>
              <select disabled>
                <option>No wells assigned</option>
              </select>
              <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                Contact your administrator to assign you to a rig
              </small>
            </div>
          ) : (
            <select
              id="well_id"
              name="well_id"
              value={data.well_id || ''}
              onChange={handleWellChange}
              required
            >
              <option value="">Select a well...</option>
              {availableWells.map(well => (
                <option key={well.well_id} value={well.well_id}>
                  {well.well_name} (Rig: {well.rig_name})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="rig_name">Rig Name</label>
          <input
            id="rig_name"
            name="rig_name"
            type="text"
            value={data.rig_name || ''}
            disabled
            placeholder="Auto-populated from well"
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="operator">Operator</label>
          <input
            id="operator"
            name="operator"
            type="text"
            value={data.operator || ''}
            onChange={handleChange}
            placeholder="Company name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contractor">Contractor</label>
          <input
            id="contractor"
            name="contractor"
            type="text"
            value={data.contractor || ''}
            onChange={handleChange}
            placeholder="Drilling contractor"
          />
        </div>

        <div className="form-group">
          <label htmlFor="field">Field</label>
          <input
            id="field"
            name="field"
            type="text"
            value={data.field || ''}
            onChange={handleChange}
            placeholder="Field name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={data.location || ''}
            onChange={handleChange}
            placeholder="Geographic location"
          />
        </div>

        <div className="form-group">
          <label htmlFor="days_since_spud">Days Since Spud</label>
          <input
            id="days_since_spud"
            name="days_since_spud"
            type="number"
            step="0.01"
            value={data.days_since_spud}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Depth Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="hole_depth_start">Hole Depth Start (ft)</label>
          <input
            id="hole_depth_start"
            name="hole_depth_start"
            type="number"
            step="0.01"
            value={data.hole_depth_start}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hole_depth_end">Hole Depth End (ft)</label>
          <input
            id="hole_depth_end"
            name="hole_depth_end"
            type="number"
            step="0.01"
            value={data.hole_depth_end}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="progress_24hr">24hr Progress (ft)</label>
          <input
            id="progress_24hr"
            name="progress_24hr"
            type="number"
            step="0.01"
            value={data.progress_24hr}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Time Breakdown (hours)</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="drilling_time">Drilling Time</label>
          <input
            id="drilling_time"
            name="drilling_time"
            type="number"
            step="0.01"
            value={data.drilling_time}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tripping_time">Tripping Time</label>
          <input
            id="tripping_time"
            name="tripping_time"
            type="number"
            step="0.01"
            value={data.tripping_time}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="casing_time">Casing Time</label>
          <input
            id="casing_time"
            name="casing_time"
            type="number"
            step="0.01"
            value={data.casing_time}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rig_repair_time">Rig Repair Time</label>
          <input
            id="rig_repair_time"
            name="rig_repair_time"
            type="number"
            step="0.01"
            value={data.rig_repair_time}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="wait_on_cement_time">Wait on Cement</label>
          <input
            id="wait_on_cement_time"
            name="wait_on_cement_time"
            type="number"
            step="0.01"
            value={data.wait_on_cement_time}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="other_time">Other Time</label>
          <input
            id="other_time"
            name="other_time"
            type="number"
            step="0.01"
            value={data.other_time}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Operations Summary</h3>
      <div className="form-group">
        <label htmlFor="operations_summary">Operations Summary</label>
        <textarea
          id="operations_summary"
          name="operations_summary"
          value={data.operations_summary}
          onChange={handleChange}
          rows="4"
          placeholder="Describe the operations performed during the day..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="next_operations">Next Operations</label>
        <textarea
          id="next_operations"
          name="next_operations"
          value={data.next_operations}
          onChange={handleChange}
          rows="3"
          placeholder="Planned operations for the next period..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="safety_incidents">Safety Incidents / Notes</label>
        <textarea
          id="safety_incidents"
          name="safety_incidents"
          value={data.safety_incidents}
          onChange={handleChange}
          rows="3"
          placeholder="Any safety incidents, near misses, or safety notes..."
        />
      </div>
    </div>
  );
};

export default GeneralDataForm;
