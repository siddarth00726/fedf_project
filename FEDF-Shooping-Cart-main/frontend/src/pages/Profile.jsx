import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../services/api';
import { getUserId } from '../utils/userId';
import { formatCurrency } from '../utils/formatCurrency';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    refreshUser();
    getOrders(getUserId(user))
      .then(({ data }) => setOrders(data))
      .catch(() => {});
  }, [user?._id]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card p-8 bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-primary-100">{user?.email}</p>
            <p className="mt-2 text-sm bg-white/20 inline-block px-3 py-1 rounded-full">
              ⭐ {user?.loyaltyPoints || 0} Loyalty Points
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4">Your Perks</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <p className="text-2xl">🎁</p>
            <p className="font-semibold mt-1">Earn on orders</p>
            <p className="text-xs text-gray-500">1 point per ₹100 spent</p>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <p className="text-2xl">⚡</p>
            <p className="font-semibold mt-1">Flash deals</p>
            <p className="text-xs text-gray-500">Members-only prices</p>
          </div>
          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
            <p className="text-2xl">📦</p>
            <p className="font-semibold mt-1">Order history</p>
            <p className="text-xs text-gray-500">Track all purchases</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No orders yet. <Link to="/" className="text-primary-600">Start shopping</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o._id}
                className="flex flex-wrap justify-between items-center gap-2 p-4 border rounded-lg dark:border-gray-700"
              >
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm px-2 py-1 bg-primary-100 dark:bg-primary-900/40 rounded">
                  {o.status}
                </span>
                <p className="font-bold text-primary-600">{formatCurrency(o.finalTotal)}</p>
                <Link to={`/track?order=${o.orderNumber}`} className="text-sm text-primary-600 hover:underline">
                  Track →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
