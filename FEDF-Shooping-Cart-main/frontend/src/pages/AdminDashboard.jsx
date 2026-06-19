import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getAdminOrders,
  getAdminStats,
  updateOrderStatus,
  getProducts,
  updateProductStock,
  createCoupon,
  getCoupons,
  toggleCoupon,
  broadcastNotification,
} from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');

  // Form states
  const [restockQty, setRestockQty] = useState({});
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: '', description: '' });
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'alert' });

  const loadData = async () => {
    try {
      const [statsRes, ordersRes, productsRes, couponsRes] = await Promise.all([
        getAdminStats(),
        getAdminOrders(),
        getProducts(),
        getCoupons(),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCoupons(couponsRes.data);
    } catch {
      toast.error('Failed to load admin dashboard database');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      loadData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleRestock = async (productId) => {
    const qty = Number(restockQty[productId]);
    if (isNaN(qty) || qty < 0) return toast.error('Enter valid stock quantity');
    try {
      await updateProductStock(productId, qty);
      toast.success('Stock inventory updated');
      setRestockQty((prev) => ({ ...prev, [productId]: '' }));
      loadData();
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountPercent) return toast.error('Fill in required coupon fields');
    try {
      await createCoupon(newCoupon);
      toast.success(`Coupon ${newCoupon.code.toUpperCase()} registered!`);
      setNewCoupon({ code: '', discountPercent: '', description: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register coupon');
    }
  };

  const handleToggleCoupon = async (code, currentStatus) => {
    try {
      await toggleCoupon({ code, active: !currentStatus });
      toast.success(`Coupon ${code} ${!currentStatus ? 'Activated' : 'Disabled'}`);
      loadData();
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) return toast.error('Title and message are required');
    try {
      await broadcastNotification({
        userId: 'all',
        type: broadcast.type,
        title: broadcast.title,
        message: broadcast.message,
      });
      toast.success('Manual system alert broadcasted to all users!');
      setBroadcast({ title: '', message: '', type: 'alert' });
    } catch {
      toast.error('Failed to dispatch alert');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Perform administrative orders management, inventory restocking, coupon configuration, and system alerts.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: formatCurrency(stats.revenue), bg: 'from-blue-500 to-indigo-600' },
            { label: 'Total Orders', value: stats.totalOrders, bg: 'from-purple-500 to-violet-600' },
            { label: 'Delivered', value: stats.deliveredOrders, bg: 'from-emerald-500 to-teal-600' },
            { label: 'Pending', value: stats.pendingOrders, bg: 'from-amber-500 to-orange-600' },
          ].map((s) => (
            <div key={s.label} className="card p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative overflow-hidden">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-extrabold text-primary-600 mt-2">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Tabs Menu */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-px text-sm font-semibold">
        {[
          { id: 'orders', label: 'Orders Tracker 📦' },
          { id: 'stock', label: 'Stock & Inventory 📦' },
          { id: 'coupons', label: 'Coupon Manager 🏷️' },
          { id: 'broadcast', label: 'System Alerts 📢' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-4 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && (
        <div className="card overflow-x-auto border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">Manage Orders</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 font-bold uppercase tracking-wider text-xs text-gray-500 border-b dark:border-gray-700">
              <tr>
                <th className="p-4 text-left">Order #</th>
                <th className="p-4 text-left">Items Count</th>
                <th className="p-4 text-left">Revenue Total</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">{o.orderNumber}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {o.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="p-4 font-semibold text-primary-600">{formatCurrency(o.finalTotal)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      o.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                        : o.status === 'Placed'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      className="input-field text-xs py-1.5 w-36"
                      value={o.status}
                      onChange={(e) => handleStatusUpdate(o._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">No orders registered yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="card overflow-x-auto border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">Product Inventory Stock</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 font-bold uppercase tracking-wider text-xs text-gray-500 border-b dark:border-gray-700">
              <tr>
                <th className="p-4 text-left">Product Details</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Retail Price</th>
                <th className="p-4 text-left">Stock Quantity</th>
                <th className="p-4 text-left">Inventory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border dark:border-gray-700" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{p.name}</p>
                      <p className="text-[10px] text-gray-400">ID: {p._id}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{p.category}</td>
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(p.price)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      p.stock < 5
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 animate-pulse'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {p.stock} remaining {p.stock < 5 && '⚠️'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Restock..."
                        className="input-field text-xs py-1.5 w-24 text-center"
                        value={restockQty[p._id] || ''}
                        onChange={(e) => setRestockQty({ ...restockQty, [p._id]: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleRestock(p._id)}
                        className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                      >
                        Set Stock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="md:col-span-1">
            <form onSubmit={handleCreateCoupon} className="card p-6 space-y-4">
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Register Coupon</h2>
                <p className="text-xs text-gray-400">Define active promotional discount offers.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Coupon Code</label>
                <input
                  className="input-field py-2 uppercase font-bold tracking-widest text-center"
                  placeholder="e.g. FLASH30"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Discount Percent</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  className="input-field py-2 text-center"
                  placeholder="e.g. 30"
                  value={newCoupon.discountPercent}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Description</label>
                <input
                  className="input-field py-2"
                  placeholder="e.g. 30% off limited tech collection"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 font-bold text-xs uppercase tracking-wider">
                Create Promo Coupon
              </button>
            </form>
          </div>

          {/* Coupons List */}
          <div className="md:col-span-2 card p-6 space-y-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Active Catalog Coupons</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className={`p-4 border rounded-xl flex justify-between items-center transition-all ${
                    c.active
                      ? 'border-emerald-200 bg-emerald-50/10 dark:bg-emerald-950/5'
                      : 'border-gray-200 bg-gray-50/50 dark:border-gray-800/20 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm uppercase text-gray-900 dark:text-white">{c.code}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 rounded">
                        {c.discountPercent}% Off
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">{c.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleCoupon(c.code, c.active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      c.active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
                    }`}
                  >
                    {c.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <form onSubmit={handleBroadcast} className="card p-6 space-y-4">
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Alert Broadcaster</h2>
                <p className="text-xs text-gray-400">Push real-time messages to user accounts.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Alert Type</label>
                <select
                  value={broadcast.type}
                  onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value })}
                  className="input-field py-2"
                >
                  <option value="alert">⚡ Alert (General)</option>
                  <option value="order">📦 Order Update</option>
                  <option value="expire">⌛ Expiry Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Message Title</label>
                <input
                  className="input-field py-2"
                  placeholder="e.g. Flash Deal Commencing!"
                  value={broadcast.title}
                  onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Message Description</label>
                <textarea
                  rows="4"
                  className="input-field py-2"
                  placeholder="Provide brief broadcast notification details..."
                  value={broadcast.message}
                  onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 font-bold text-xs uppercase tracking-wider">
                Broadcast Alert 🚀
              </button>
            </form>
          </div>

          <div className="md:col-span-2 card p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Broadcast Sandbox Guidelines</h2>
            <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                This broadcaster simulates a real-time web socket dispatch. Any alerts generated here are committed to the backend notification history storage.
              </p>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border-l-4 border-amber-400 rounded-lg">
                <strong>Important:</strong> Broadcaster notifications default to <code>userId = 'all'</code>. Every active account (including your current session) will instantly load this notification in their Navbar Bell dropdown menu upon next API refresh (polled every 5 seconds).
              </div>
              <p>
                Use this dashboard to test layout reactivity, notification badge animations, and email history interactions concurrently with the checkout simulator.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
