import { useState } from 'react';

const CasingDataForm = ({ records, setRecords }) => {
  const [currentCasing, setCurrentCasing] = useState({
    casing_string: '',
    casing_size: '',
    casing_weight: '',
    casing_grade: '',
    setting_depth: '',
    top_of_cement: '',
    cement_type: '',
    cement_volume: '',
    cement_density: '',
    cement_company: '',
    plug_bumped_pressure: '',
    wait_on_cement: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCasing(prev => ({ ...prev, [name]: value }));
  };

  const addCasingRecord = () => {
    if (!currentCasing.casing_string) {
      alert('Please enter casing string name');
      return;
    }
    setRecords([...records, currentCasing]);
    setCurrentCasing({
      casing_string: '',
      casing_size: '',
      casing_weight: '',
      casing_grade: '',
      setting_depth: '',
      top_of_cement: '',
      cement_type: '',
      cement_volume: '',
      cement_density: '',
      cement_company: '',
      plug_bumped_pressure: '',
      wait_on_cement: '',
    });
  };

  const removeCasingRecord = (index) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  return (
    <div className="form-section">
      <h2>Casing & Cement Data</h2>

      <div className="records-list">
        {records.map((casing, index) => (
          <div key={index} className="record-item">
            <div className="record-header">
              <h4>{casing.casing_string} - {casing.casing_size}" @ {casing.setting_depth} ft</h4>
              <button
                type="button"
                onClick={() => removeCasingRecord(index)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
            <div className="record-summary">
              <span>Grade: {casing.casing_grade}</span>
              <span>Weight: {casing.casing_weight} lbs/ft</span>
              <span>TOC: {casing.top_of_cement} ft</span>
            </div>
          </div>
        ))}
      </div>

      <div className="add-record-form">
        <h3>Add Casing Record</h3>

        <h4>Casing Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="casing_string">Casing String</label>
            <select
              id="casing_string"
              name="casing_string"
              value={currentCasing.casing_string}
              onChange={handleChange}
            >
              <option value="">Select String</option>
              <option value="Conductor">Conductor</option>
              <option value="Surface">Surface</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Production">Production</option>
              <option value="Liner">Liner</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="casing_size">Casing Size (in)</label>
            <input
              id="casing_size"
              name="casing_size"
              type="number"
              step="0.01"
              value={currentCasing.casing_size}
              onChange={handleChange}
              placeholder="e.g., 13.375"
            />
          </div>

          <div className="form-group">
            <label htmlFor="casing_weight">Casing Weight (lbs/ft)</label>
            <input
              id="casing_weight"
              name="casing_weight"
              type="number"
              step="0.01"
              value={currentCasing.casing_weight}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="casing_grade">Casing Grade</label>
            <input
              id="casing_grade"
              name="casing_grade"
              type="text"
              value={currentCasing.casing_grade}
              onChange={handleChange}
              placeholder="e.g., K55, L80, P110"
            />
          </div>

          <div className="form-group">
            <label htmlFor="setting_depth">Setting Depth (ft)</label>
            <input
              id="setting_depth"
              name="setting_depth"
              type="number"
              step="0.01"
              value={currentCasing.setting_depth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="top_of_cement">Top of Cement (ft)</label>
            <input
              id="top_of_cement"
              name="top_of_cement"
              type="number"
              step="0.01"
              value={currentCasing.top_of_cement}
              onChange={handleChange}
            />
          </div>
        </div>

        <h4>Cement Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="cement_type">Cement Type</label>
            <input
              id="cement_type"
              name="cement_type"
              type="text"
              value={currentCasing.cement_type}
              onChange={handleChange}
              placeholder="e.g., Class G, Class H"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cement_volume">Cement Volume (sacks/bbls)</label>
            <input
              id="cement_volume"
              name="cement_volume"
              type="number"
              step="0.01"
              value={currentCasing.cement_volume}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cement_density">Cement Density (ppg)</label>
            <input
              id="cement_density"
              name="cement_density"
              type="number"
              step="0.01"
              value={currentCasing.cement_density}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cement_company">Cement Company</label>
            <input
              id="cement_company"
              name="cement_company"
              type="text"
              value={currentCasing.cement_company}
              onChange={handleChange}
              placeholder="Service company"
            />
          </div>

          <div className="form-group">
            <label htmlFor="plug_bumped_pressure">Plug Bumped Pressure (psi)</label>
            <input
              id="plug_bumped_pressure"
              name="plug_bumped_pressure"
              type="number"
              step="0.01"
              value={currentCasing.plug_bumped_pressure}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="wait_on_cement">Wait on Cement (hours)</label>
            <input
              id="wait_on_cement"
              name="wait_on_cement"
              type="number"
              step="0.01"
              value={currentCasing.wait_on_cement}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="button" onClick={addCasingRecord} className="btn-add">
          Add Casing Record
        </button>
      </div>
    </div>
  );
};

export default CasingDataForm;
