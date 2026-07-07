import { AdminTable } from '@/components/ui/admin-table';
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export default function PredictionLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin_logs'],
    queryFn: async () => {
      const response = await api.get('/admin/logs');
      return response.data;
    }
  });

  const columns = [
    { key: 'id', label: 'Log ID' },
    { key: 'date', label: 'Timestamp' },
    { key: 'user', label: 'User' },
    { key: 'crop', label: 'Crop' },
    { key: 'diagnosis', label: 'Top Diagnosis (Conf)' },
    { key: 'latency', label: 'Latency' },
    { key: 'status', label: 'Status' },
  ];

  if (isLoading) {
    return <div className="p-8 text-center">Loading logs...</div>;
  }

  return (
    <AdminTable
      title="AI Prediction Logs"
      description="Monitor real-time AI inference logs and model performance."
      columns={columns}
      data={logs || []}
      renderRow={(log: any) => (
        <tr key={log.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{log.id.split('-')[0]}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.userName}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.crop}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.disease} ({log.confidence}%)</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.executionTime}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${log.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {log.status.toUpperCase()}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button className="text-emerald-600 hover:text-emerald-900">View JSON</button>
          </td>
        </tr>
      )}
    />
  );
}
