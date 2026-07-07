import { AdminTable } from '@/components/ui/admin-table';

const MOCK_DISEASES = [
  { id: 1, name: 'Early Blight', category: 'Fungal', crops: 'Tomato, Potato', is_active: true },
  { id: 2, name: 'Leaf Curl Virus', category: 'Viral', crops: 'Cotton, Tomato', is_active: true },
  { id: 3, name: 'Powdery Mildew', category: 'Fungal', crops: 'Wheat, Grapes', is_active: true },
];

export default function DiseasesPage() {
  const columns = [
    { key: 'name', label: 'Disease Name' },
    { key: 'category', label: 'Category' },
    { key: 'crops', label: 'Affected Crops' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <AdminTable
      title="Disease Library"
      description="Manage the verified database of crop diseases."
      columns={columns}
      data={MOCK_DISEASES}
      onAdd={() => alert('Add disease modal opened')}
      renderRow={(disease) => (
        <tr key={disease.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{disease.name}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{disease.category}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{disease.crops}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${disease.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {disease.is_active ? 'Active' : 'Inactive'}
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
