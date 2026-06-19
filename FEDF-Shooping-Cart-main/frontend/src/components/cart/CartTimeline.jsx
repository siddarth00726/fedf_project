import { useCart } from '../../context/CartContext';

const icon = { add: '➕', remove: '🗑️', update: '🔄', expire: '⏳', lock: '🔒', budget: '💰' };

export default function CartTimeline() {
  const { timeline } = useCart();

  if (!timeline.length) {
    return (
      <div className="card p-6 text-center text-gray-500 text-sm">
        Cart timeline will show adds, removes, and updates here.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">Cart Timeline</h2>
      <div className="space-y-0 max-h-64 overflow-y-auto">
        {timeline.map((entry) => (
          <div key={entry.id} className="flex gap-3 pb-4">
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
                {icon[entry.type] || '•'}
              </span>
              <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-600 min-h-[12px]" />
            </div>
            <div className="pb-2 flex-1">
              <p className="text-sm font-medium">{entry.message}</p>
              <p className="text-xs text-gray-500">{new Date(entry.at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
