import React from 'react';

export default function AdvancedEquipmentForm({ motor, mwd, jar, bop, onMotorChange, onMwdChange, onJarChange, onBopChange }) {
  const handleMotorChange = (field, value) => {
    onMotorChange({ ...motor, [field]: value });
  };

  const handleMwdChange = (field, value) => {
    onMwdChange({ ...mwd, [field]: value });
  };

  const handleJarChange = (field, value) => {
    onJarChange({ ...jar, [field]: value });
  };

  const handleBopChange = (field, value) => {
    onBopChange({ ...bop, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Downhole Motor Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Downhole Motor (PDM)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Motor Type</label>
            <input
              type="text"
              value={motor.motor_type_code || ''}
              onChange={(e) => handleMotorChange('motor_type_code', e.target.value)}
              placeholder="e.g., 6 3/4 PDM"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Size (in)</label>
            <input
              type="number"
              step="0.01"
              value={motor.motor_size || ''}
              onChange={(e) => handleMotorChange('motor_size', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              type="text"
              value={motor.motor_serial_no || ''}
              onChange={(e) => handleMotorChange('motor_serial_no', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hours Run</label>
            <input
              type="number"
              step="0.1"
              value={motor.motor_hours || ''}
              onChange={(e) => handleMotorChange('motor_hours', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Service Company</label>
            <input
              type="text"
              value={motor.motor_company_code || ''}
              onChange={(e) => handleMotorChange('motor_company_code', e.target.value)}
              placeholder="e.g., Schlumberger, Halliburton"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* MWD Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">MWD/LWD (Measurement While Drilling)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">MWD Type</label>
            <input
              type="text"
              value={mwd.mwd_type_code || ''}
              onChange={(e) => handleMwdChange('mwd_type_code', e.target.value)}
              placeholder="e.g., EM MWD, Mud Pulse"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Size (in)</label>
            <input
              type="number"
              step="0.01"
              value={mwd.mwd_size || ''}
              onChange={(e) => handleMwdChange('mwd_size', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              type="text"
              value={mwd.mwd_serial_no || ''}
              onChange={(e) => handleMwdChange('mwd_serial_no', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hours Run</label>
            <input
              type="number"
              step="0.1"
              value={mwd.mwd_hours || ''}
              onChange={(e) => handleMwdChange('mwd_hours', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Jar Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Jar (Drilling Jar)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jar Type</label>
            <input
              type="text"
              value={jar.jar_type_code || ''}
              onChange={(e) => handleJarChange('jar_type_code', e.target.value)}
              placeholder="e.g., Hydraulic, Mechanical"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Size (in)</label>
            <input
              type="number"
              step="0.01"
              value={jar.jar_size || ''}
              onChange={(e) => handleJarChange('jar_size', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              type="text"
              value={jar.jar_serial_no || ''}
              onChange={(e) => handleJarChange('jar_serial_no', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hours Run</label>
            <input
              type="number"
              step="0.1"
              value={jar.jar_hours || ''}
              onChange={(e) => handleJarChange('jar_hours', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* BOP Test Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">BOP (Blowout Preventer) Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Well Control Type</label>
            <select
              value={bop.well_control_type_code || ''}
              onChange={(e) => handleBopChange('well_control_type_code', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Type</option>
              <option value="Annular">Annular BOP</option>
              <option value="Ram">Ram BOP</option>
              <option value="Subsea">Subsea BOP</option>
              <option value="Surface">Surface BOP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Accumulator Pressure (psi)</label>
            <input
              type="number"
              step="1"
              value={bop.accumulator_pressure || ''}
              onChange={(e) => handleBopChange('accumulator_pressure', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Recharge Time (min)</label>
            <input
              type="number"
              step="0.1"
              value={bop.recharge_time || ''}
              onChange={(e) => handleBopChange('recharge_time', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Recharge At</label>
            <input
              type="text"
              value={bop.recharge_at || ''}
              onChange={(e) => handleBopChange('recharge_at', e.target.value)}
              placeholder="e.g., 3000 psi"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Test Before Trip (psi)</label>
            <input
              type="number"
              step="1"
              value={bop.last_test_before_trip || ''}
              onChange={(e) => handleBopChange('last_test_before_trip', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Integrity/Kick Test (psi)</label>
            <input
              type="number"
              step="1"
              value={bop.last_integrity_kick_test || ''}
              onChange={(e) => handleBopChange('last_integrity_kick_test', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
