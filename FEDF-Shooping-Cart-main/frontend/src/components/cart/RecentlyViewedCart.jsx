import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProductImage from '../ProductImage';
import { useCart } from '../../context/CartContext';
import { getRecentlyViewed } from '../../utils/recentlyViewed';
import { formatCurrency } from '../../utils/formatCurrency';
import { getEffectivePrice } from '../../utils/productPrice';

export default function RecentlyViewedCart() {
  const [recent, setRecent] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    setRecent(getRecentlyViewed());
  }, []);

  if (!recent.length) return null;

  return (
    <section className="card p-6">
      <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>
      <p className="text-sm text-gray-500 mb-4">Products you browsed — add them back quickly</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {recent.map((p) => (
          <div key={p._id} className="border rounded-lg p-3 dark:border-gray-700 hover:shadow-md transition">
            <Link to={`/product/${p._id}`}>
              <ProductImage src={p.image} alt={p.name} category={p.category} className="w-full h-28 object-cover rounded-lg" />
            </Link>
            <p className="text-sm font-medium mt-2 line-clamp-2">{p.name}</p>
            <p className="text-primary-600 font-bold text-sm">{formatCurrency(getEffectivePrice(p))}</p>
            <button
              type="button"
              className="btn-primary w-full text-xs mt-2 py-1.5"
              onClick={() => addToCart({ ...p, price: getEffectivePrice(p) })}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
