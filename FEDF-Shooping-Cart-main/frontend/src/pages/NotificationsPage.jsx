import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead, deleteNotification, clearNotifications } from '../services/api';
import { getUserId } from '../utils/userId';

export default function NotificationsPage() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadNotifications = async () => {
    try {
      const { data } = await getNotifications(userId);
      setNotifications(data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await clearNotifications(userId);
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const filteredList = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'alerts') return n.type === 'alert' || n.type === 'expire';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🔔 Notification Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time status updates on inventory, price locks, coupons, and orders.
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-500 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-px text-sm font-semibold">
        {['all', 'orders', 'alerts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-3 border-b-2 capitalize transition-all ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="animate-pulse text-gray-500">Loading alerts...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 card space-y-3">
          <div className="text-5xl">📭</div>
          <h3 className="font-bold text-lg">No Notifications Found</h3>
          <p className="text-sm text-gray-500">
            Alerts about orders, price locks, or catalog items will list here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((n) => (
            <div
              key={n._id}
              className={`card p-4 flex gap-4 items-start relative transition-all border border-gray-100 dark:border-gray-700 ${
                !n.read ? 'bg-blue-50/20 dark:bg-blue-900/5 border-l-4 border-l-primary-500' : ''
              }`}
            >
              <div className="text-2xl mt-0.5 select-none shrink-0">
                {n.type === 'order' ? '📦' : n.type === 'expire' ? '⌛' : '⚡'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 dark:text-white">{n.title}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(n.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{n.message}</p>
                <div className="flex items-center gap-4 pt-1 text-xs">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="text-primary-600 hover:underline font-semibold"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
