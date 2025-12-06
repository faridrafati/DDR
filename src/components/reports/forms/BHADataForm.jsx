import { useState } from 'react';

const BHADataForm = ({ records, setRecords }) => {
  const [currentBHA, setCurrentBHA] = useState({
    bha_number: '',
    run_number: '',
    components: [],
    total_length: '',
    total_weight: '',
    purpose: '',
    notes: '',
  });

  const [currentComponent, setCurrentComponent] = useState({
    order: '',
    component: '',
    description: '',
    length: '',
    od: '',
    id: '',
  });

  const handleBHAChange = (e) => {
    const { name, value } = e.target;
    setCurrentBHA(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (e) => {
    const { name, value } = e.target;
    setCurrentComponent(prev => ({ ...prev, [name]: value }));
  };

  const addComponent = () => {
    if (!currentComponent.component) {
      alert('Please enter component type');
      return;
    }
    setCurrentBHA(prev => ({
      ...prev,
      components: [...prev.components, currentComponent]
    }));
    setCurrentComponent({
      order: '',
      component: '',
      description: '',
      length: '',
      od: '',
      id: '',
    });
  };

  const removeComponent = (index) => {
    setCurrentBHA(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  const addBHARecord = () => {
    if (!currentBHA.bha_number) {
      alert('Please enter BHA number');
      return;
    }
    setRecords([...records, currentBHA]);
    setCurrentBHA({
      bha_number: '',
      run_number: '',
      components: [],
      total_length: '',
      total_weight: '',
      purpose: '',
      notes: '',
    });
  };

  const removeBHARecord = (index) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  return (
    <div className="form-section">
      <h2>BHA (Bottom Hole Assembly) & Tools</h2>

      <div className="records-list">
        {records.map((bha, index) => (
          <div key={index} className="record-item">
            <div className="record-header">
              <h4>BHA #{bha.bha_number} - Run #{bha.run_number}</h4>
              <button
                type="button"
                onClick={() => removeBHARecord(index)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
            <div className="record-summary">
              <span>Components: {bha.components.length}</span>
              <span>Length: {bha.total_length} ft</span>
              <span>Weight: {bha.total_weight} lbs</span>
              <span>Purpose: {bha.purpose}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="add-record-form">
        <h3>Add BHA Record</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="bha_number">BHA Number</label>
            <input
              id="bha_number"
              name="bha_number"
              type="number"
              value={currentBHA.bha_number}
              onChange={handleBHAChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="run_number">Run Number</label>
            <input
              id="run_number"
              name="run_number"
              type="number"
              value={currentBHA.run_number}
              onChange={handleBHAChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="total_length">Total Length (ft)</label>
            <input
              id="total_length"
              name="total_length"
              type="number"
              step="0.01"
              value={currentBHA.total_length}
              onChange={handleBHAChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="total_weight">Total Weight (lbs)</label>
            <input
              id="total_weight"
              name="total_weight"
              type="number"
              step="0.01"
              value={currentBHA.total_weight}
              onChange={handleBHAChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose</label>
            <input
              id="purpose"
              name="purpose"
              type="text"
              value={currentBHA.purpose}
              onChange={handleBHAChange}
              placeholder="e.g., Drilling, Reaming, Logging"
            />
          </div>
        </div>

        <h4>BHA Components</h4>
        <div className="components-list">
          {currentBHA.components.map((comp, index) => (
            <div key={index} className="component-item">
              <span>#{comp.order} - {comp.component} - {comp.description}</span>
              <button
                type="button"
                onClick={() => removeComponent(index)}
                className="btn-remove-small"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="component-form">
          <h5>Add Component</h5>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="comp_order">Order</label>
              <input
                id="comp_order"
                name="order"
                type="number"
                value={currentComponent.order}
                onChange={handleComponentChange}
                placeholder="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="comp_component">Component</label>
              <select
                id="comp_component"
                name="component"
                value={currentComponent.component}
                onChange={handleComponentChange}
              >
                <option value="">Select Component</option>
                <option value="Bit">Bit</option>
                <option value="Motor">Motor (PDM)</option>
                <option value="MWD">MWD</option>
                <option value="LWD">LWD</option>
                <option value="Stabilizer">Stabilizer</option>
                <option value="Drill Collar">Drill Collar</option>
                <option value="HWDP">HWDP</option>
                <option value="Jar">Jar</option>
                <option value="Shock Sub">Shock Sub</option>
                <option value="Float Sub">Float Sub</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="comp_description">Description</label>
              <input
                id="comp_description"
                name="description"
                type="text"
                value={currentComponent.description}
                onChange={handleComponentChange}
                placeholder='e.g., 12-1/4" PDC'
              />
            </div>

            <div className="form-group">
              <label htmlFor="comp_length">Length (ft)</label>
              <input
                id="comp_length"
                name="length"
                type="number"
                step="0.01"
                value={currentComponent.length}
                onChange={handleComponentChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="comp_od">OD (in)</label>
              <input
                id="comp_od"
                name="od"
                type="number"
                step="0.01"
                value={currentComponent.od}
                onChange={handleComponentChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="comp_id">ID (in)</label>
              <input
                id="comp_id"
                name="id"
                type="number"
                step="0.01"
                value={currentComponent.id}
                onChange={handleComponentChange}
              />
            </div>
          </div>
          <button type="button" onClick={addComponent} className="btn-add-small">
            Add Component
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={currentBHA.notes}
            onChange={handleBHAChange}
            rows="3"
            placeholder="Additional notes about this BHA..."
          />
        </div>

        <button type="button" onClick={addBHARecord} className="btn-add">
          Add BHA Record
        </button>
      </div>
    </div>
  );
};

export default BHADataForm;
