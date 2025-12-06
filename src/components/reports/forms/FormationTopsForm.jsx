import { useState } from 'react';

const FormationTopsForm = ({ records, setRecords }) => {
  const [currentFormation, setCurrentFormation] = useState({
    formation_name: '',
    measured_depth: '',
    true_vertical_depth: '',
    lithology: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentFormation(prev => ({ ...prev, [name]: value }));
  };

  const addFormationRecord = () => {
    if (!currentFormation.formation_name) {
      alert('Please enter formation name');
      return;
    }
    setRecords([...records, currentFormation]);
    setCurrentFormation({
      formation_name: '',
      measured_depth: '',
      true_vertical_depth: '',
      lithology: '',
      description: '',
    });
  };

  const removeFormationRecord = (index) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  return (
    <div className="form-section">
      <h2>Formation Tops</h2>

      <div className="records-list">
        {records.map((formation, index) => (
          <div key={index} className="record-item">
            <div className="record-header">
              <h4>{formation.formation_name} @ {formation.measured_depth} ft MD</h4>
              <button
                type="button"
                onClick={() => removeFormationRecord(index)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
            <div className="record-summary">
              <span>TVD: {formation.true_vertical_depth} ft</span>
              <span>Lithology: {formation.lithology}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="add-record-form">
        <h3>Add Formation Top</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="formation_name">Formation Name</label>
            <input
              id="formation_name"
              name="formation_name"
              type="text"
              value={currentFormation.formation_name}
              onChange={handleChange}
              placeholder="e.g., Upper Bakken, Niobrara"
            />
          </div>

          <div className="form-group">
            <label htmlFor="measured_depth">Measured Depth (ft)</label>
            <input
              id="measured_depth"
              name="measured_depth"
              type="number"
              step="0.01"
              value={currentFormation.measured_depth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="true_vertical_depth">True Vertical Depth (ft)</label>
            <input
              id="true_vertical_depth"
              name="true_vertical_depth"
              type="number"
              step="0.01"
              value={currentFormation.true_vertical_depth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lithology">Lithology</label>
            <select
              id="lithology"
              name="lithology"
              value={currentFormation.lithology}
              onChange={handleChange}
            >
              <option value="">Select Lithology</option>
              <option value="Sandstone">Sandstone</option>
              <option value="Shale">Shale</option>
              <option value="Limestone">Limestone</option>
              <option value="Dolomite">Dolomite</option>
              <option value="Coal">Coal</option>
              <option value="Salt">Salt</option>
              <option value="Granite">Granite</option>
              <option value="Chalk">Chalk</option>
              <option value="Conglomerate">Conglomerate</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={currentFormation.description}
            onChange={handleChange}
            rows="3"
            placeholder="Detailed description of the formation, color, porosity, etc..."
          />
        </div>

        <button type="button" onClick={addFormationRecord} className="btn-add">
          Add Formation Top
        </button>
      </div>
    </div>
  );
};

export default FormationTopsForm;
