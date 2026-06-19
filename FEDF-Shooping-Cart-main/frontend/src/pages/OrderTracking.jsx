import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import OrderTimeline from '../components/OrderTimeline';
import { trackOrder } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function OrderTracking() {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e, numberOverride) => {
    e?.preventDefault();
    const num = (numberOverride || orderNumber).trim();
    if (!num) return toast.error('Enter order number');
    setLoading(true);
    try {
      const { data } = await trackOrder(num.toUpperCase());
      setOrder(data);
    } catch {
      setOrder(null);
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const param = params.get('order');
    if (param) handleTrack(null, param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Track Your Order</h1>
      <form onSubmit={handleTrack} className="card p-6 flex gap-3">
        <input
          className="input-field flex-1"
          placeholder="Enter order number (e.g. ORD123456)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '...' : 'Track'}
        </button>
      </form>

      {order && (
        <div className="card p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-bold">{order.orderNumber}</p>
            </div>
            <span className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
              {order.status}
            </span>
          </div>
          <p>Total: <strong>{formatCurrency(order.finalTotal)}</strong></p>
          <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
        </div>
      )}
    </div>
  );
}
