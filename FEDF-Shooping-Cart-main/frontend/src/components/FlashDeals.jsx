import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { getFlashDeals } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { getEffectivePrice, isOnSale } from '../utils/productPrice';

function Countdown({ endsAt }) {
  const [left, setLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt) - new Date();
      if (diff <= 0) return setLeft('Ended');
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;
      const s = Math.floor(diff / 1000) % 60;
      const d = Math.floor(diff / 86400000);
      setLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return <span className="font-mono text-red-600 dark:text-red-400 font-bold">{left}</span>;
}

export default function FlashDeals() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    getFlashDeals().then(({ data }) => setDeals(data)).catch(() => {});
  }, []);

  if (!deals.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="animate-pulse">⚡</span> Flash Deals
        </h2>
        <Link to="/shop" className="text-sm text-primary-600 hover:underline">View all →</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map((p) => (
          <Link
            key={p._id}
            to={`/product/${p._id}`}
            className="card p-4 flex gap-4 hover:shadow-lg transition border-2 border-red-200 dark:border-red-900/50"
          >
            <ProductImage src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold line-clamp-1">{p.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-red-600">{formatCurrency(getEffectivePrice(p))}</span>
                {isOnSale(p) && (
                  <span className="text-sm text-gray-400 line-through">{formatCurrency(p.price)}</span>
                )}
              </div>
              <p className="text-xs mt-2 text-gray-500">Ends in: <Countdown endsAt={p.saleEndsAt} /></p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
