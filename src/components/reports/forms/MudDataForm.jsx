const MudDataForm = ({ data, setData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-section">
      <h2>Mud Data</h2>

      <h3>Mud Type & Weight</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="mud_type">Mud Type</label>
          <select
            id="mud_type"
            name="mud_type"
            value={data.mud_type || ''}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="Water-based">Water-based</option>
            <option value="Oil-based">Oil-based</option>
            <option value="Synthetic-based">Synthetic-based</option>
            <option value="Air/Gas">Air/Gas</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mud_weight_in">Mud Weight In (ppg)</label>
          <input
            id="mud_weight_in"
            name="mud_weight_in"
            type="number"
            step="0.01"
            value={data.mud_weight_in || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mud_weight_out">Mud Weight Out (ppg)</label>
          <input
            id="mud_weight_out"
            name="mud_weight_out"
            type="number"
            step="0.01"
            value={data.mud_weight_out || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mud_volume">Mud Volume (bbls)</label>
          <input
            id="mud_volume"
            name="mud_volume"
            type="number"
            step="0.01"
            value={data.mud_volume || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Rheology</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="plastic_viscosity">Plastic Viscosity (cp)</label>
          <input
            id="plastic_viscosity"
            name="plastic_viscosity"
            type="number"
            step="0.01"
            value={data.plastic_viscosity || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="yield_point">Yield Point (lbs/100ft²)</label>
          <input
            id="yield_point"
            name="yield_point"
            type="number"
            step="0.01"
            value={data.yield_point || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gel_10sec">Gel 10 sec</label>
          <input
            id="gel_10sec"
            name="gel_10sec"
            type="number"
            step="0.01"
            value={data.gel_10sec || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gel_10min">Gel 10 min</label>
          <input
            id="gel_10min"
            name="gel_10min"
            type="number"
            step="0.01"
            value={data.gel_10min || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Filtration</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="api_filtrate">API Filtrate (ml/30min)</label>
          <input
            id="api_filtrate"
            name="api_filtrate"
            type="number"
            step="0.01"
            value={data.api_filtrate || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hthp_filtrate">HTHP Filtrate (ml/30min)</label>
          <input
            id="hthp_filtrate"
            name="hthp_filtrate"
            type="number"
            step="0.01"
            value={data.hthp_filtrate || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="filter_cake">Filter Cake (1/32")</label>
          <input
            id="filter_cake"
            name="filter_cake"
            type="number"
            step="0.01"
            value={data.filter_cake || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Chemistry</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="ph">pH</label>
          <input
            id="ph"
            name="ph"
            type="number"
            step="0.01"
            value={data.ph || ''}
            onChange={handleChange}
            min="0"
            max="14"
          />
        </div>

        <div className="form-group">
          <label htmlFor="alkalinity_pf">Alkalinity Pf</label>
          <input
            id="alkalinity_pf"
            name="alkalinity_pf"
            type="number"
            step="0.01"
            value={data.alkalinity_pf || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="alkalinity_mf">Alkalinity Mf</label>
          <input
            id="alkalinity_mf"
            name="alkalinity_mf"
            type="number"
            step="0.01"
            value={data.alkalinity_mf || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="chlorides">Chlorides (ppm)</label>
          <input
            id="chlorides"
            name="chlorides"
            type="number"
            step="0.01"
            value={data.chlorides || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="calcium">Calcium (ppm)</label>
          <input
            id="calcium"
            name="calcium"
            type="number"
            step="0.01"
            value={data.calcium || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Solids</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="oil_water_ratio">Oil/Water Ratio</label>
          <input
            id="oil_water_ratio"
            name="oil_water_ratio"
            type="text"
            value={data.oil_water_ratio || ''}
            onChange={handleChange}
            placeholder="e.g., 80/20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="total_solids">Total Solids (%)</label>
          <input
            id="total_solids"
            name="total_solids"
            type="number"
            step="0.01"
            value={data.total_solids || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sand_content">Sand Content (%)</label>
          <input
            id="sand_content"
            name="sand_content"
            type="number"
            step="0.01"
            value={data.sand_content || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Mud Additions</h3>
      <div className="form-group">
        <label htmlFor="mud_additions">Mud Additions & Treatments</label>
        <textarea
          id="mud_additions"
          name="mud_additions"
          value={data.mud_additions || ''}
          onChange={handleChange}
          rows="4"
          placeholder="List all mud additives and treatments..."
        />
      </div>
    </div>
  );
};

export default MudDataForm;
