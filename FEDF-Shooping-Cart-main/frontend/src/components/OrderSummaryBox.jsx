import { formatCurrency } from '../utils/formatCurrency';

export default function OrderSummaryBox({ totals, showCouponInput, onApplyCoupon, couponCode, setCouponCode }) {
  if (!totals) return null;
  return (
    <div className="card p-6 space-y-3">
      <h3 className="font-semibold text-lg">Order Summary</h3>
      {showCouponInput && (
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          <button onClick={onApplyCoupon} className="btn-primary">
            Apply
          </button>
        </div>
      )}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>- {formatCurrency(totals.discount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatCurrency(totals.shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (18%)</span>
          <span>{formatCurrency(totals.gst)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 dark:border-gray-600">
          <span>Final Total</span>
          <span className="text-primary-600">{formatCurrency(totals.finalTotal)}</span>
        </div>
      </div>
    </div>
  );
}
