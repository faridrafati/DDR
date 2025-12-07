import React from 'react';

export default function PersonnelCostForm({ personnel, cost, onPersonnelChange, onCostChange }) {
  const handlePersonnelFieldChange = (field, value) => {
    onPersonnelChange({ ...personnel, [field]: value });
  };

  const handleCostFieldChange = (field, value) => {
    onCostChange({ ...cost, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Personnel Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Personnel on Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Personnel</label>
            <input
              type="number"
              value={personnel.total_personnel || ''}
              onChange={(e) => handlePersonnelFieldChange('total_personnel', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tool Pusher</label>
            <input
              type="text"
              value={personnel.tool_pusher || ''}
              onChange={(e) => handlePersonnelFieldChange('tool_pusher', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Driller</label>
            <input
              type="text"
              value={personnel.driller || ''}
              onChange={(e) => handlePersonnelFieldChange('driller', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assistant Drillers</label>
            <input
              type="number"
              value={personnel.assistant_driller || ''}
              onChange={(e) => handlePersonnelFieldChange('assistant_driller', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mud Engineers</label>
            <input
              type="number"
              value={personnel.mud_engineer || ''}
              onChange={(e) => handlePersonnelFieldChange('mud_engineer', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mechanics</label>
            <input
              type="number"
              value={personnel.mechanic || ''}
              onChange={(e) => handlePersonnelFieldChange('mechanic', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Electricians</label>
            <input
              type="number"
              value={personnel.electrician || ''}
              onChange={(e) => handlePersonnelFieldChange('electrician', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trainees</label>
            <input
              type="number"
              value={personnel.trainee || ''}
              onChange={(e) => handlePersonnelFieldChange('trainee', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contractor Labor</label>
            <input
              type="number"
              value={personnel.contractor_labor || ''}
              onChange={(e) => handlePersonnelFieldChange('contractor_labor', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Casual Labor</label>
            <input
              type="number"
              value={personnel.casual_labor || ''}
              onChange={(e) => handlePersonnelFieldChange('casual_labor', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Services Personnel</label>
            <input
              type="number"
              value={personnel.services_personnel || ''}
              onChange={(e) => handlePersonnelFieldChange('services_personnel', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company Personnel</label>
            <input
              type="number"
              value={personnel.nioc_personnel || ''}
              onChange={(e) => handlePersonnelFieldChange('nioc_personnel', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Daily Drilling Cost Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Daily Drilling Cost</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Costs */}
          <div>
            <h4 className="text-md font-medium mb-3 text-gray-800">Daily Costs (USD)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Day Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.day_rate || ''}
                  onChange={(e) => handleCostFieldChange('day_rate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mud Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.mud_cost || ''}
                  onChange={(e) => handleCostFieldChange('mud_cost', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cement Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.cement_cost || ''}
                  onChange={(e) => handleCostFieldChange('cement_cost', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Equipment Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.equipment_cost || ''}
                  onChange={(e) => handleCostFieldChange('equipment_cost', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Service Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.service_cost || ''}
                  onChange={(e) => handleCostFieldChange('service_cost', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Other Costs</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.other_cost || ''}
                  onChange={(e) => handleCostFieldChange('other_cost', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Cumulative Costs */}
          <div>
            <h4 className="text-md font-medium mb-3 text-gray-800">Cumulative Costs (USD)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Day Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.day_rate_cumulative || ''}
                  onChange={(e) => handleCostFieldChange('day_rate_cumulative', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Mud Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.mud_cost_cumulative || ''}
                  onChange={(e) => handleCostFieldChange('mud_cost_cumulative', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cement Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.cement_cost_cumulative || ''}
                  onChange={(e) => handleCostFieldChange('cement_cost_cumulative', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Equipment Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.equipment_cost_cumulative || ''}
                  onChange={(e) => handleCostFieldChange('equipment_cost_cumulative', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Service Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.service_cost_cumulative || ''}
                  onChange={(e) => handleCostFieldChange('service_cost_cumulative', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Other Costs</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost.other_cost_cumulative || ''}
                  onChange={(e) => handleCostFieldChange('other_cost_cumulative', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
