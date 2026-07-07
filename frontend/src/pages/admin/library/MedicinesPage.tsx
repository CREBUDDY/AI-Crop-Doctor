import { AdminTable } from '@/components/ui/admin-table';

const MOCK_MEDICINES = [
  { id: 1, name: 'Mancozeb 75% WP', type: 'Fungicide', dosage: '2.0 g/L', toxicity: 'Yellow (Highly Toxic)', status: 'Active' },
  { id: 2, name: 'Imidacloprid 17.8% SL', type: 'Insecticide', dosage: '0.5 ml/L', toxicity: 'Blue (Moderately Toxic)', status: 'Active' },
  { id: 3, name: 'Carbendazim 50% WP', type: 'Fungicide', dosage: '1.0 g/L', toxicity: 'Green (Slightly Toxic)', status: 'Deprecated' },
];

export default function MedicinesPage() {
  const columns = [
    { key: 'name', label: 'Medicine Name' },
    { key: 'type', label: 'Category' },
    { key: 'dosage', label: 'Standard Dosage' },
    { key: 'toxicity', label: 'Toxicity Class' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <AdminTable
      title="Medicines & Treatments"
      description="Manage the verified database of pesticides, fungicides, and organic treatments."
      columns={columns}
      data={MOCK_MEDICINES}
      onAdd={() => alert('Add medicine modal opened')}
      renderRow={(med) => (
        <tr key={med.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.type}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.toxicity}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${med.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {med.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button className="text-emerald-600 hover:text-emerald-900 mr-4">Edit</button>
            <button className="text-red-600 hover:text-red-900">Disable</button>
          </td>
        </tr>
      )}
    />
  );
}
