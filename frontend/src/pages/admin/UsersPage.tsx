import { AdminTable } from '@/components/ui/admin-table';
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    }
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'joined', label: 'Joined Date' },
  ];

  if (isLoading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <AdminTable
      title="User Management"
      description="Manage platform users, farmers, and agriculture officers."
      columns={columns}
      data={users || []}
      onAdd={() => alert('Add user modal opened')}
      renderRow={(user: any) => (
        <tr key={user.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                user.role === 'kvk_officer' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'}`}>
              {user.role}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.status}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.lastActive).toLocaleDateString()}</td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button className="text-emerald-600 hover:text-emerald-900 mr-4">Edit</button>
            <button className="text-red-600 hover:text-red-900">Delete</button>
          </td>
        </tr>
      )}
    />
  );
}
