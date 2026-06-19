import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { applyCoupon, getCoupons } from '../services/api';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { formatCurrency } from '../utils/formatCurrency';
import { getEffectivePrice } from '../utils/productPrice';

export default function SmartBuyPanel({ product, quantity = 1 }) {
  const [coupons, setCoupons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const { addToCart } = useCart();
  const { setPendingCoupon } = useCheckout();
  const price = getEffectivePrice(product);

  useEffect(() => {
    getCoupons()
      .then(({ data }) => setCoupons(data))
      .catch(() => {});
  }, []);

  const itemPayload = [{ price, quantity }];

  const loadPreview = async (code) => {
    try {
      const { data } = await applyCoupon({ code: code || '', items: itemPayload });
      setPreview(data);
      return data;
    } catch {
      setPreview(null);
      return null;
    }
  };

  const handleSelect = async (coupon) => {
    setSelected(coupon.code);
    const data = await loadPreview(coupon.code);
    if (data?.valid) toast.success(`${coupon.code} selected — ${coupon.discountPercent}% off`);
  };

  const handleApplyAndAdd = async () => {
    if (!selected) {
      addToCart({ ...product, price }, quantity);
      return;
    }
    const data = await loadPreview(selected);
    if (!data?.valid) return toast.error('Coupon no longer valid');
    setPendingCoupon({
      code: data.code,
      discountPercent: data.discountPercent,
      totals: data,
    });
    addToCart({ ...product, price }, quantity);
    toast.success(`Added with coupon ${data.code} — saves ${formatCurrency(data.discount)}`);
  };

  return (
    <div className="card p-6 border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎟️</span>
        <div>
          <h3 className="font-bold text-lg">Smart Buy</h3>
          <p className="text-sm text-gray-500">All valid coupons — pick one & add to cart</p>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            loadPreview('');
          }}
          className={`w-full text-left p-3 rounded-lg border transition ${
            !selected
              ? 'border-primary-600 bg-white dark:bg-gray-800'
              : 'border-gray-200 dark:border-gray-600 hover:border-primary-400'
          }`}
        >
          <span className="font-medium">No coupon</span>
          <span className="text-xs text-gray-500 block">Add at regular price</span>
        </button>
        {coupons.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => handleSelect(c)}
            className={`w-full text-left p-3 rounded-lg border transition ${
              selected === c.code
                ? 'border-primary-600 bg-white dark:bg-gray-800 ring-2 ring-primary-200'
                : 'border-gray-200 dark:border-gray-600 hover:border-primary-400'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-primary-600">{c.code}</span>
              <span className="text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                {c.discountPercent}% OFF
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{c.description}</p>
          </button>
        ))}
      </div>

      {preview?.valid && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal ({quantity}×)</span>
            <span>{formatCurrency(preview.subtotal)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Coupon savings</span>
            <span>- {formatCurrency(preview.discount)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-1 dark:border-gray-600">
            <span>Est. total</span>
            <span>{formatCurrency(preview.finalTotal)}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleApplyAndAdd}
        className="w-full mt-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg"
      >
        {selected ? `Apply ${selected} & Add to Cart` : 'Add to Cart'}
      </button>
    </div>
  );
}
