import React from 'react';

export default function EquipmentMaterialsForm({ materials, equipment, onMaterialsChange, onEquipmentChange }) {
  const addMaterial = () => {
    onMaterialsChange([...materials, {
      material_code: '',
      amount: '',
      received: '',
      stock: '',
      on_site: '',
      requested: '',
      sent: '',
      measure_code: ''
    }]);
  };

  const removeMaterial = (index) => {
    onMaterialsChange(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index, field, value) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    onMaterialsChange(updatedMaterials);
  };

  const addEquipment = () => {
    onEquipmentChange([...equipment, {
      equipment_code: '',
      amount: '',
      received: '',
      stock: '',
      on_site: '',
      requested: '',
      sent: '',
      measure_code: ''
    }]);
  };

  const removeEquipment = (index) => {
    onEquipmentChange(equipment.filter((_, i) => i !== index));
  };

  const updateEquipment = (index, field, value) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index] = { ...updatedEquipment[index], [field]: value };
    onEquipmentChange(updatedEquipment);
  };

  const renderTableRow = (item, index, updateFn, removeFn, type) => (
    <tr key={index} className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">
        <input
          type="text"
          value={item[`${type}_code`] || ''}
          onChange={(e) => updateFn(index, `${type}_code`, e.target.value)}
          placeholder={`${type === 'material' ? 'Material' : 'Equipment'} Code`}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={item.measure_code || ''}
          onChange={(e) => updateFn(index, 'measure_code', e.target.value)}
          placeholder="Unit"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          step="0.01"
          value={item.amount || ''}
          onChange={(e) => updateFn(index, 'amount', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          step="0.01"
          value={item.received || ''}
          onChange={(e) => updateFn(index, 'received', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          step="0.01"
          value={item.stock || ''}
          onChange={(e) => updateFn(index, 'stock', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          step="0.01"
          value={item.on_site || ''}
          onChange={(e) => updateFn(index, 'on_site', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          step="0.01"
          value={item.requested || ''}
          onChange={(e) => updateFn(index, 'requested', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          step="0.01"
          value={item.sent || ''}
          onChange={(e) => updateFn(index, 'sent', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <button
          type="button"
          onClick={() => removeFn(index)}
          className="text-red-600 hover:text-red-800 font-medium text-sm"
        >
          Remove
        </button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Chemical Materials Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chemical Materials Usage</h3>
          <button
            type="button"
            onClick={addMaterial}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition text-sm"
          >
            + Add Material
          </button>
        </div>

        {materials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Used</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((material, index) =>
                  renderTableRow(material, index, updateMaterial, removeMaterial, 'material')
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No materials added. Click "Add Material" to begin.</p>
        )}
      </div>

      {/* Equipment Used Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Equipment Used</h3>
          <button
            type="button"
            onClick={addEquipment}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition text-sm"
          >
            + Add Equipment
          </button>
        </div>

        {equipment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Used</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipment.map((item, index) =>
                  renderTableRow(item, index, updateEquipment, removeEquipment, 'equipment')
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No equipment added. Click "Add Equipment" to begin.</p>
        )}
      </div>
    </div>
  );
}
