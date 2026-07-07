import { AdminTable } from '@/components/ui/admin-table';

const MOCK_CROPS = [
  { id: 1, name: 'Wheat', scientific_name: 'Triticum aestivum', season: 'Rabi', is_active: true },
  { id: 2, name: 'Rice (Paddy)', scientific_name: 'Oryza sativa', season: 'Kharif', is_active: true },
  { id: 3, name: 'Cotton', scientific_name: 'Gossypium', season: 'Kharif', is_active: true },
];

export default function CropsPage() {
  const columns = [
    { key: 'name', label: 'Crop Name' },
    { key: 'scientific', label: 'Scientific Name' },
    { key: 'season', label: 'Growing Season' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <AdminTable
      title="Crop Library"
      description="Manage verified crops supported by the AI prediction engine."
      columns={columns}
      data={MOCK_CROPS}
      onAdd={() => alert('Add crop modal opened')}
      renderRow={(crop) => (
        <tr key={crop.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{crop.name}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">{crop.scientific_name}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.season}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${crop.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {crop.is_active ? 'Active' : 'Inactive'}
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
