const STATUSES = ['Placed', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered'];

export default function OrderTimeline({ currentStatus, statusHistory = [] }) {
  const currentIndex = STATUSES.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {STATUSES.map((status, index) => {
        const done = index <= currentIndex;
        const historyEntry = statusHistory.find((h) => h.status === status);
        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  done
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {done ? '✓' : index + 1}
              </div>
              {index < STATUSES.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${
                    index < currentIndex ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
            <div className="pb-8">
              <p className={`font-semibold ${done ? 'text-primary-600' : 'text-gray-400'}`}>
                {status}
              </p>
              {historyEntry?.date && (
                <p className="text-xs text-gray-500">
                  {new Date(historyEntry.date).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
