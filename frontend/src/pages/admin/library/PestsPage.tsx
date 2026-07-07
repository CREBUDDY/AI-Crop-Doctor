import { AdminTable } from '@/components/ui/admin-table';

const MOCK_PESTS = [
  { id: 1, name: 'Aphids', category: 'Sucking Pest', crops: 'Cotton, Tomato, Wheat', is_active: true },
  { id: 2, name: 'Fall Armyworm', category: 'Chewing Pest', crops: 'Maize, Sorghum', is_active: true },
  { id: 3, name: 'Whitefly', category: 'Sucking Pest', crops: 'Cotton, Vegetables', is_active: true },
];

export default function PestsPage() {
  const columns = [
    { key: 'name', label: 'Pest Name' },
    { key: 'category', label: 'Category' },
    { key: 'crops', label: 'Affected Crops' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <AdminTable
      title="Pest Library"
      description="Manage the verified database of agricultural pests."
      columns={columns}
      data={MOCK_PESTS}
      onAdd={() => alert('Add pest modal opened')}
      renderRow={(pest) => (
        <tr key={pest.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pest.name}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pest.category}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pest.crops}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pest.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {pest.is_active ? 'Active' : 'Inactive'}
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
