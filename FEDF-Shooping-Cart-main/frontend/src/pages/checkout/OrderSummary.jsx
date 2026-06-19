import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderSummaryBox from '../../components/OrderSummaryBox';
import { useCart } from '../../context/CartContext';
import { useCheckout } from '../../context/CheckoutContext';
import { applyCoupon, createOrder, getCoupons } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getUserId } from '../../utils/userId';
import { formatCurrency } from '../../utils/formatCurrency';

export default function OrderSummary() {
  const {
    checkoutItems,
    selectedAddress,
    paymentMethod,
    coupon,
    setCoupon,
    totals,
    setTotals,
    isBuyNow,
    setLastOrder,
    resetCheckout,
    pendingCoupon,
    setPendingCoupon,
  } = useCheckout();
  const { clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkoutItems.length || !selectedAddress || !paymentMethod) {
      navigate('/checkout/address');
      return;
    }

    // Load available coupons
    getCoupons()
      .then(({ data }) => setAvailableCoupons(data))
      .catch(() => {});

    if (pendingCoupon?.code) {
      setCouponCode(pendingCoupon.code);
      calculateTotals(pendingCoupon.code);
      setPendingCoupon(null);
    } else {
      calculateTotals();
    }
  }, [checkoutItems]);

  const getItemsPayload = () =>
    checkoutItems.map((i) => ({
      productId: i._id,
      price: i.price,
      quantity: i.quantity,
    }));

  const calculateTotals = async (code) => {
    try {
      const { data } = await applyCoupon({ code: code || '', items: getItemsPayload() });
      if (code && data.valid) {
        setCoupon({ code: data.code, discountPercent: data.discountPercent });
        toast.success(`Coupon "${data.code}" applied: ${data.discountPercent}% OFF!`);
      } else if (!code) {
        setCoupon(null);
      }
      setTotals(data);
    } catch (err) {
      if (code) toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return toast.error('Enter coupon code');
    calculateTotals(couponCode);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const { data } = await createOrder({
        userId: getUserId(user),
        items: checkoutItems.map((i) => ({ productId: i._id, quantity: i.quantity })),
        address: {
          fullName: selectedAddress.fullName,
          mobile: selectedAddress.mobile,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
        },
        paymentMethod,
        couponCode: coupon?.code,
      });
      setLastOrder(data);
      if (user) refreshUser();
      if (!isBuyNow) clearCart();
      resetCheckout();
      toast.success('Order placed successfully!');
      navigate('/checkout/success', { state: { order: data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      {/* Checkout Progress Tracker */}
      <div className="flex justify-between items-center max-w-lg mx-auto py-2">
        {[
          { label: 'Address', active: false, done: true },
          { label: 'Payment', active: false, done: true },
          { label: 'Review', active: true, done: false },
        ].map((step, idx) => (
          <div key={step.label} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step.active
                  ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-300'
                  : 'bg-primary-100 text-primary-600 font-bold'
              }`}
            >
              ✓
            </span>
            <span className={`text-sm font-semibold ${step.active || step.done ? 'text-primary-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
            {idx < 2 && <span className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700 block"></span>}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Review Order</h1>
        <span className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-semibold">
          Step 3 of 3
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left pane: Item details, delivery address, payment review */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address & Payment summary card */}
          <div className="card p-6 grid sm:grid-cols-2 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Shipping Destination</h3>
              <p className="font-bold text-gray-900 dark:text-white">{selectedAddress?.fullName}</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{selectedAddress?.mobile}</p>
              <p className="text-sm text-gray-500">
                {selectedAddress?.street}, {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
              </p>
            </div>
            <div className="space-y-2 pt-4 sm:pt-0 sm:pl-6">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Payment Selected</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {paymentMethod === 'Cash On Delivery' ? '💵' : paymentMethod === 'UPI' ? '📱' : '💳'}
                </span>
                <p className="font-bold text-gray-900 dark:text-white">{paymentMethod}</p>
              </div>
              <p className="text-xs text-gray-500 leading-normal">
                {paymentMethod.includes('Card')
                  ? 'Mock card verification complete.'
                  : paymentMethod === 'UPI'
                  ? 'Simulated UPI validation pending final approval.'
                  : 'Pay with cash upon package receipt.'}
              </p>
            </div>
          </div>

          {/* Items checklist */}
          <div className="card p-6 space-y-4">
            <h2 className="font-extrabold text-lg text-gray-900 dark:text-white">Shopping Bag Details</h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {checkoutItems.map((item) => (
                <div key={item._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-100 dark:border-gray-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Unit price: {formatCurrency(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right pane: Price summary sidebar & coupon code application */}
        <div className="space-y-6">
          <OrderSummaryBox
            totals={totals}
            showCouponInput
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
          />

          {/* Active coupon lists drawer */}
          {availableCoupons.length > 0 && (
            <div className="card p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Coupons</h3>
              <div className="space-y-2">
                {availableCoupons.map((c) => (
                  <div
                    key={c.code}
                    onClick={() => {
                      setCouponCode(c.code);
                      calculateTotals(c.code);
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all hover:bg-primary-50/10 dark:hover:bg-primary-950/10 flex justify-between items-center ${
                      coupon?.code === c.code
                        ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-primary-600 uppercase">{c.code}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded font-semibold">
                          {c.discountPercent}% Off
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{c.description}</p>
                    </div>
                    {coupon?.code === c.code ? (
                      <span className="text-xs text-primary-600 font-bold">Applied ✓</span>
                    ) : (
                      <span className="text-[10px] text-gray-400 hover:text-primary-600 font-semibold uppercase">Apply</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            className="btn-primary w-full py-4 text-center text-sm font-extrabold tracking-wide shadow-lg shadow-primary-500/20 hover:scale-[1.01] transition-transform"
            disabled={loading}
            onClick={handlePlaceOrder}
          >
            {loading ? 'Simulating Dispatch...' : 'Place Order & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
