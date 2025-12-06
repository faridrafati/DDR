import { useState } from 'react';

const RopDataForm = ({ records, setRecords }) => {
  const [currentRop, setCurrentRop] = useState({
    depth_from: '',
    depth_to: '',
    formation: '',
    rop_avg: '',
    rop_max: '',
    wob: '',
    rpm: '',
    torque: '',
    spp: '',
    flow_rate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentRop(prev => ({ ...prev, [name]: value }));
  };

  const addRopRecord = () => {
    if (!currentRop.depth_from || !currentRop.depth_to) {
      alert('Please enter depth range');
      return;
    }
    setRecords([...records, currentRop]);
    setCurrentRop({
      depth_from: '',
      depth_to: '',
      formation: '',
      rop_avg: '',
      rop_max: '',
      wob: '',
      rpm: '',
      torque: '',
      spp: '',
      flow_rate: '',
    });
  };

  const removeRopRecord = (index) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  return (
    <div className="form-section">
      <h2>Rate of Penetration (ROP) Data</h2>

      <div className="records-list">
        {records.map((rop, index) => (
          <div key={index} className="record-item">
            <div className="record-header">
              <h4>{rop.depth_from} - {rop.depth_to} ft | {rop.formation}</h4>
              <button
                type="button"
                onClick={() => removeRopRecord(index)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
            <div className="record-summary">
              <span>Avg ROP: {rop.rop_avg} ft/hr</span>
              <span>Max ROP: {rop.rop_max} ft/hr</span>
              <span>WOB: {rop.wob} klbs</span>
              <span>RPM: {rop.rpm}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="add-record-form">
        <h3>Add ROP Record</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="depth_from">Depth From (ft)</label>
            <input
              id="depth_from"
              name="depth_from"
              type="number"
              step="0.01"
              value={currentRop.depth_from}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="depth_to">Depth To (ft)</label>
            <input
              id="depth_to"
              name="depth_to"
              type="number"
              step="0.01"
              value={currentRop.depth_to}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="formation">Formation</label>
            <input
              id="formation"
              name="formation"
              type="text"
              value={currentRop.formation}
              onChange={handleChange}
              placeholder="Formation name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rop_avg">Average ROP (ft/hr)</label>
            <input
              id="rop_avg"
              name="rop_avg"
              type="number"
              step="0.01"
              value={currentRop.rop_avg}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rop_max">Max ROP (ft/hr)</label>
            <input
              id="rop_max"
              name="rop_max"
              type="number"
              step="0.01"
              value={currentRop.rop_max}
              onChange={handleChange}
            />
          </div>
        </div>

        <h4>Drilling Parameters</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="wob">Weight on Bit (klbs)</label>
            <input
              id="wob"
              name="wob"
              type="number"
              step="0.01"
              value={currentRop.wob}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rpm">RPM</label>
            <input
              id="rpm"
              name="rpm"
              type="number"
              step="0.01"
              value={currentRop.rpm}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="torque">Torque (ft-lbs)</label>
            <input
              id="torque"
              name="torque"
              type="number"
              step="0.01"
              value={currentRop.torque}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="spp">Standpipe Pressure (psi)</label>
            <input
              id="spp"
              name="spp"
              type="number"
              step="0.01"
              value={currentRop.spp}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="flow_rate">Flow Rate (gpm)</label>
            <input
              id="flow_rate"
              name="flow_rate"
              type="number"
              step="0.01"
              value={currentRop.flow_rate}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="button" onClick={addRopRecord} className="btn-add">
          Add ROP Record
        </button>
      </div>
    </div>
  );
};

export default RopDataForm;
