import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { updateOrderStatus, getOrder } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['Placed', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered'];

export default function Success() {
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!order) return;
    // Load fresh copy of order to make sure we have latest status
    getOrder(order._id)
      .then((res) => setOrder(res.data))
      .catch(() => {});
  }, []);

  if (!order) {
    return (
      <div className="text-center py-16 card max-w-md mx-auto space-y-4">
        <p className="text-gray-500">No order details resolved.</p>
        <Link to="/" className="btn-primary inline-block">Go Home</Link>
      </div>
    );
  }

  const handleSimulateStatus = async (status) => {
    setUpdating(true);
    const toastId = toast.loading(`Simulating state: ${status}...`);
    try {
      const { data } = await updateOrderStatus(order._id, status);
      setOrder(data);
      toast.success(`Order state updated to "${status}"!`, { id: toastId });
      toast(`Notification pushed & mock email generated for: ${status}`, { icon: '📧' });
    } catch {
      toast.error('Simulation failed', { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      {/* Top Banner */}
      <div className="card p-8 text-center space-y-4 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="text-6xl animate-bounce select-none">🎉</div>
        <h1 className="text-3xl font-extrabold tracking-tight">Order Placed Successfully!</h1>
        <p className="text-emerald-100 max-w-md mx-auto text-sm">
          Thank you for your purchase. Your order #{order.orderNumber} is validated and entered into our system.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to={`/track?order=${order.orderNumber}`} className="px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg text-sm font-bold shadow transition-colors">
            🔍 Go to Live Tracking
          </Link>
          <Link to="/" className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold transition-colors">
            🛒 Continue Shopping
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left pane: Barcode Invoice sheet */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-dashed border-2 border-gray-300 dark:border-gray-700 space-y-6">
          <div className="flex justify-between items-start border-b pb-4 dark:border-gray-700">
            <div>
              <h2 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider">Tax Invoice / Receipt</h2>
              <p className="font-bold text-gray-900 dark:text-white mt-1">SmartCart Logistics Inc.</p>
              <p className="text-xs text-gray-500">Invoice Number: INV-{order.orderNumber}</p>
            </div>
            {/* Barcode Mock */}
            <div className="flex flex-col items-center select-none font-mono text-[9px] text-gray-400">
              <div className="flex gap-px h-8 bg-gray-900 dark:bg-white w-28 px-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-white dark:bg-gray-800"
                    style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }}
                  ></div>
                ))}
              </div>
              <span className="mt-1">*{order.orderNumber}*</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-400 font-semibold uppercase">Billing/Delivery Address:</p>
                <p className="text-gray-700 dark:text-gray-300 font-bold mt-1">{order.address.fullName}</p>
                <p className="text-gray-500">{order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-semibold uppercase">Payment Details:</p>
                <p className="text-gray-700 dark:text-gray-300 font-bold mt-1">{order.paymentMethod}</p>
                <p className="text-gray-500 mt-1">Status: Paid (Mock)</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-t border-b py-3 divide-y divide-gray-100 dark:border-gray-700 dark:divide-gray-700 text-xs">
              <div className="flex justify-between items-center text-gray-400 font-semibold pb-1.5 uppercase">
                <span>Description</span>
                <span>Qty</span>
                <span className="text-right">Total</span>
              </div>
              {order.items.map((item) => (
                <div key={item.product} className="flex justify-between items-center py-2">
                  <span className="truncate max-w-[180px] font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                  <span className="text-gray-500">×{item.quantity}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Coupon Discount ({order.couponCode}):</span>
                  <span>-{formatCurrency(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping:</span>
                <span>{order.shippingCharge === 0 ? 'Free' : formatCurrency(order.shippingCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (18% GST):</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm border-t pt-2 dark:border-gray-700 text-primary-600">
                <span>Total Paid:</span>
                <span>{formatCurrency(order.finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Interactive State Simulator */}
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="font-extrabold text-lg text-gray-900 dark:text-white">🚀 Order Flow Simulator</h2>
            <p className="text-xs text-gray-500">
              Manually advance order stages to test live notifications, email dispatch, and order timelines.
            </p>
          </div>

          {/* Delivery Tracker Graphic */}
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] text-gray-400 uppercase font-extrabold tracking-wider border-b pb-2 dark:border-gray-700">
              <span>Timeline Status</span>
              <span>Current: <strong className="text-primary-600">{order.status}</strong></span>
            </div>

            <div className="relative pl-6 space-y-4 border-l-2 border-gray-200 dark:border-gray-700">
              {STATUS_FLOW.map((status, idx) => {
                const isPassed = currentStatusIdx >= idx;
                const isCurrent = currentStatusIdx === idx;
                return (
                  <div key={status} className="relative">
                    {/* Circle bullet */}
                    <span className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                      isPassed
                        ? 'bg-primary-600 border-primary-600 ring-4 ring-primary-100 dark:ring-primary-950/30'
                        : 'bg-white dark:bg-gray-800 border-gray-300'
                    }`}>
                      {isPassed && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                    </span>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${isCurrent ? 'text-primary-600' : isPassed ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {status}
                      </p>
                      {isCurrent && (
                        <p className="text-[10px] text-gray-400 mt-0.5">Automated emails & notifications triggered.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulator Control Action Buttons */}
          <div className="border-t pt-4 space-y-3 dark:border-gray-700">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Push Status updates</h4>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_FLOW.map((status) => {
                const isActive = order.status === status;
                const isDisabled = updating || isActive;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSimulateStatus(status)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 border-primary-300 dark:bg-primary-950/20'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              Hint: Advance status, then open the <strong>📬 Inbox</strong> link in navigation to preview HTML receipts!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
