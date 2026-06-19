import { Link } from 'react-router-dom';
import ProductImage from '../ProductImage';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function RemovedFromCart() {
  const { removedHistory, restoreRemovedItem, clearRemovedHistory } = useCart();

  if (!removedHistory.length) return null;

  return (
    <section className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Removed From Cart</h2>
        <button type="button" className="text-sm text-gray-500 hover:text-red-600" onClick={clearRemovedHistory}>
          Clear history
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {removedHistory.map((item) => (
          <div
            key={`${item._id}-${item.removedAt}`}
            className="flex gap-3 p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
          >
            <ProductImage src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item._id}`} className="font-medium text-sm hover:text-primary-600 line-clamp-1">
                {item.name}
              </Link>
              <p className="text-primary-600 text-sm font-bold">{formatCurrency(item.price)}</p>
              <p className="text-xs text-gray-500">
                Removed {new Date(item.removedAt).toLocaleDateString()}
              </p>
              <button
                type="button"
                className="text-xs text-primary-600 font-medium mt-1 hover:underline"
                onClick={() => restoreRemovedItem(item)}
              >
                Add back to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
