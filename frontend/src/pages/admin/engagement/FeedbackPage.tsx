import { AdminTable } from '@/components/ui/admin-table';
import { Star } from 'lucide-react';

const MOCK_FEEDBACK = [
  { id: 1, user: 'Ramesh K.', rating: 5, comment: 'Very accurate prediction for tomato blight. Saved my crop!', date: '2023-10-25', status: 'Reviewed' },
  { id: 2, user: 'Suresh P.', rating: 2, comment: 'App said it was healthy but my cotton has aphids.', date: '2023-10-24', status: 'Pending' },
];

export default function FeedbackPage() {
  const columns = [
    { key: 'user', label: 'User' },
    { key: 'rating', label: 'Rating' },
    { key: 'comment', label: 'Comment' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <AdminTable
      title="User Feedback"
      description="Review farmer feedback and app ratings to improve the AI model."
      columns={columns}
      data={MOCK_FEEDBACK}
      renderRow={(fb) => (
        <tr key={fb.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fb.user}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < fb.rating ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{fb.comment}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fb.date}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${fb.status === 'Reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {fb.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button className="text-emerald-600 hover:text-emerald-900">Mark Reviewed</button>
          </td>
        </tr>
      )}
    />
  );
}
