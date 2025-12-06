import { useState } from 'react';

const DirectionalDataForm = ({ records, setRecords }) => {
  const [currentSurvey, setCurrentSurvey] = useState({
    measured_depth: '',
    inclination: '',
    azimuth: '',
    true_vertical_depth: '',
    north_south: '',
    east_west: '',
    vertical_section: '',
    dogleg_severity: '',
    survey_type: '',
    tool_type: '',
    survey_company: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSurvey(prev => ({ ...prev, [name]: value }));
  };

  const addSurveyRecord = () => {
    if (!currentSurvey.measured_depth) {
      alert('Please enter measured depth');
      return;
    }
    setRecords([...records, currentSurvey]);
    setCurrentSurvey({
      measured_depth: '',
      inclination: '',
      azimuth: '',
      true_vertical_depth: '',
      north_south: '',
      east_west: '',
      vertical_section: '',
      dogleg_severity: '',
      survey_type: '',
      tool_type: '',
      survey_company: '',
    });
  };

  const removeSurveyRecord = (index) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  return (
    <div className="form-section">
      <h2>Directional Drilling Data</h2>

      <div className="records-list">
        {records.map((survey, index) => (
          <div key={index} className="record-item">
            <div className="record-header">
              <h4>MD: {survey.measured_depth} ft | Inc: {survey.inclination}° | Azi: {survey.azimuth}°</h4>
              <button
                type="button"
                onClick={() => removeSurveyRecord(index)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
            <div className="record-summary">
              <span>TVD: {survey.true_vertical_depth} ft</span>
              <span>DLS: {survey.dogleg_severity}°/100ft</span>
              <span>Tool: {survey.tool_type}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="add-record-form">
        <h3>Add Survey Point</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="measured_depth">Measured Depth (ft)</label>
            <input
              id="measured_depth"
              name="measured_depth"
              type="number"
              step="0.01"
              value={currentSurvey.measured_depth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inclination">Inclination (°)</label>
            <input
              id="inclination"
              name="inclination"
              type="number"
              step="0.01"
              value={currentSurvey.inclination}
              onChange={handleChange}
              min="0"
              max="180"
            />
          </div>

          <div className="form-group">
            <label htmlFor="azimuth">Azimuth (°)</label>
            <input
              id="azimuth"
              name="azimuth"
              type="number"
              step="0.01"
              value={currentSurvey.azimuth}
              onChange={handleChange}
              min="0"
              max="360"
            />
          </div>

          <div className="form-group">
            <label htmlFor="true_vertical_depth">True Vertical Depth (ft)</label>
            <input
              id="true_vertical_depth"
              name="true_vertical_depth"
              type="number"
              step="0.01"
              value={currentSurvey.true_vertical_depth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="north_south">North/South (ft)</label>
            <input
              id="north_south"
              name="north_south"
              type="number"
              step="0.01"
              value={currentSurvey.north_south}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="east_west">East/West (ft)</label>
            <input
              id="east_west"
              name="east_west"
              type="number"
              step="0.01"
              value={currentSurvey.east_west}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="vertical_section">Vertical Section (ft)</label>
            <input
              id="vertical_section"
              name="vertical_section"
              type="number"
              step="0.01"
              value={currentSurvey.vertical_section}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dogleg_severity">Dogleg Severity (°/100ft)</label>
            <input
              id="dogleg_severity"
              name="dogleg_severity"
              type="number"
              step="0.01"
              value={currentSurvey.dogleg_severity}
              onChange={handleChange}
            />
          </div>
        </div>

        <h4>Survey Tool Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="survey_type">Survey Type</label>
            <select
              id="survey_type"
              name="survey_type"
              value={currentSurvey.survey_type}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="MWD">MWD (Measurement While Drilling)</option>
              <option value="Gyro">Gyro</option>
              <option value="Magnetic">Magnetic</option>
              <option value="Steering Tool">Steering Tool</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tool_type">Tool Type</label>
            <input
              id="tool_type"
              name="tool_type"
              type="text"
              value={currentSurvey.tool_type}
              onChange={handleChange}
              placeholder="e.g., PowerDrive, GyroData"
            />
          </div>

          <div className="form-group">
            <label htmlFor="survey_company">Survey Company</label>
            <input
              id="survey_company"
              name="survey_company"
              type="text"
              value={currentSurvey.survey_company}
              onChange={handleChange}
              placeholder="Service company name"
            />
          </div>
        </div>

        <button type="button" onClick={addSurveyRecord} className="btn-add">
          Add Survey Point
        </button>
      </div>
    </div>
  );
};

export default DirectionalDataForm;
