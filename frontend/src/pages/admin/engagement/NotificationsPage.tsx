import { AdminTable } from '@/components/ui/admin-table';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Severe Blight Warning', type: 'Disease Alert', audience: 'All Tomato Farmers in Punjab', date: '2023-10-20', status: 'Sent' },
  { id: 2, title: 'Heat Wave Upcoming', type: 'Weather Alert', audience: 'All Farmers', date: '2023-10-18', status: 'Sent' },
];

export default function NotificationsPage() {
  const columns = [
    { key: 'title', label: 'Message Title' },
    { key: 'type', label: 'Type' },
    { key: 'audience', label: 'Target Audience' },
    { key: 'date', label: 'Sent Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <AdminTable
      title="Push Notifications"
      description="Send and manage targeted push notifications to farmers."
      columns={columns}
      data={MOCK_NOTIFICATIONS}
      onAdd={() => alert('Compose notification modal opened')}
      renderRow={(notif) => (
        <tr key={notif.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{notif.title}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{notif.type}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{notif.audience}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{notif.date}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              {notif.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button className="text-emerald-600 hover:text-emerald-900">View Stats</button>
          </td>
        </tr>
      )}
    />
  );
}
