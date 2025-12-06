import { useState } from 'react';

const BitDataForm = ({ records, setRecords }) => {
  const [currentBit, setCurrentBit] = useState({
    bit_number: '',
    bit_size: '',
    bit_type: '',
    bit_manufacturer: '',
    bit_serial_number: '',
    depth_in: '',
    depth_out: '',
    footage: '',
    hours_run: '',
    inner_rows: '',
    outer_rows: '',
    dull_grade: '',
    location: '',
    bearing_seals: '',
    gauge: '',
    reason_pulled: '',
    nozzle_sizes: '',
    jets_configuration: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentBit(prev => ({ ...prev, [name]: value }));
  };

  const addBitRecord = () => {
    if (!currentBit.bit_number) {
      alert('Please enter bit number');
      return;
    }
    setRecords([...records, currentBit]);
    setCurrentBit({
      bit_number: '',
      bit_size: '',
      bit_type: '',
      bit_manufacturer: '',
      bit_serial_number: '',
      depth_in: '',
      depth_out: '',
      footage: '',
      hours_run: '',
      inner_rows: '',
      outer_rows: '',
      dull_grade: '',
      location: '',
      bearing_seals: '',
      gauge: '',
      reason_pulled: '',
      nozzle_sizes: '',
      jets_configuration: '',
    });
  };

  const removeBitRecord = (index) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  return (
    <div className="form-section">
      <h2>Bit Data</h2>

      <div className="records-list">
        {records.map((bit, index) => (
          <div key={index} className="record-item">
            <div className="record-header">
              <h4>Bit #{bit.bit_number} - {bit.bit_size}" {bit.bit_type}</h4>
              <button
                type="button"
                onClick={() => removeBitRecord(index)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
            <div className="record-summary">
              <span>Depth: {bit.depth_in} - {bit.depth_out} ft</span>
              <span>Footage: {bit.footage} ft</span>
              <span>Hours: {bit.hours_run} hrs</span>
            </div>
          </div>
        ))}
      </div>

      <div className="add-record-form">
        <h3>Add Bit Record</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="bit_number">Bit Number</label>
            <input
              id="bit_number"
              name="bit_number"
              type="number"
              value={currentBit.bit_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bit_size">Bit Size (in)</label>
            <input
              id="bit_size"
              name="bit_size"
              type="number"
              step="0.01"
              value={currentBit.bit_size}
              onChange={handleChange}
              placeholder="e.g., 12.25"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bit_type">Bit Type</label>
            <select
              id="bit_type"
              name="bit_type"
              value={currentBit.bit_type}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="PDC">PDC</option>
              <option value="Roller Cone">Roller Cone</option>
              <option value="Diamond">Diamond</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bit_manufacturer">Manufacturer</label>
            <input
              id="bit_manufacturer"
              name="bit_manufacturer"
              type="text"
              value={currentBit.bit_manufacturer}
              onChange={handleChange}
              placeholder="e.g., Baker Hughes, Halliburton"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bit_serial_number">Serial Number</label>
            <input
              id="bit_serial_number"
              name="bit_serial_number"
              type="text"
              value={currentBit.bit_serial_number}
              onChange={handleChange}
            />
          </div>
        </div>

        <h4>Depth & Performance</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="depth_in">Depth In (ft)</label>
            <input
              id="depth_in"
              name="depth_in"
              type="number"
              step="0.01"
              value={currentBit.depth_in}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="depth_out">Depth Out (ft)</label>
            <input
              id="depth_out"
              name="depth_out"
              type="number"
              step="0.01"
              value={currentBit.depth_out}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="footage">Footage (ft)</label>
            <input
              id="footage"
              name="footage"
              type="number"
              step="0.01"
              value={currentBit.footage}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="hours_run">Hours Run</label>
            <input
              id="hours_run"
              name="hours_run"
              type="number"
              step="0.01"
              value={currentBit.hours_run}
              onChange={handleChange}
            />
          </div>
        </div>

        <h4>IADC Bit Grading</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="inner_rows">Inner Rows</label>
            <input
              id="inner_rows"
              name="inner_rows"
              type="text"
              value={currentBit.inner_rows}
              onChange={handleChange}
              placeholder="e.g., 3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="outer_rows">Outer Rows</label>
            <input
              id="outer_rows"
              name="outer_rows"
              type="text"
              value={currentBit.outer_rows}
              onChange={handleChange}
              placeholder="e.g., 4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dull_grade">Dull Grade</label>
            <input
              id="dull_grade"
              name="dull_grade"
              type="text"
              value={currentBit.dull_grade}
              onChange={handleChange}
              placeholder="e.g., T-3-1/8-I-X-I-BT-TD"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              value={currentBit.location}
              onChange={handleChange}
              placeholder="Dull location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bearing_seals">Bearing/Seals</label>
            <input
              id="bearing_seals"
              name="bearing_seals"
              type="text"
              value={currentBit.bearing_seals}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gauge">Gauge</label>
            <input
              id="gauge"
              name="gauge"
              type="text"
              value={currentBit.gauge}
              onChange={handleChange}
              placeholder='e.g., In gauge, 1/16" under'
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason_pulled">Reason Pulled</label>
            <input
              id="reason_pulled"
              name="reason_pulled"
              type="text"
              value={currentBit.reason_pulled}
              onChange={handleChange}
              placeholder="e.g., TD, Dull, RIH new bit"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nozzle_sizes">Nozzle Sizes</label>
            <input
              id="nozzle_sizes"
              name="nozzle_sizes"
              type="text"
              value={currentBit.nozzle_sizes}
              onChange={handleChange}
              placeholder="e.g., 12-13-13"
            />
          </div>
        </div>

        <button type="button" onClick={addBitRecord} className="btn-add">
          Add Bit Record
        </button>
      </div>
    </div>
  );
};

export default BitDataForm;
