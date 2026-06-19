import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { formatCurrency } from '../utils/formatCurrency';
import { getEffectivePrice } from '../utils/productPrice';
import { removeSearchTerm } from '../utils/searchHistory';

export default function SearchHistoryRecommendations({
  history,
  recommendations,
  onRemoveTerm,
  onClear,
}) {
  if (!history.length && !recommendations.length) return null;

  return (
    <section className="card p-6 space-y-4 border-2 border-primary-200 dark:border-primary-800">
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🔍</span> Based on your search history
          </h2>
          <p className="text-sm text-gray-500 mt-1">Personalized picks from what you looked for</p>
        </div>
        {history.length > 0 && (
          <button type="button" className="text-xs text-gray-500 hover:text-red-600" onClick={onClear}>
            Clear history
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {history.map((term) => (
            <span
              key={term}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200 text-sm"
            >
              {term}
              <button
                type="button"
                className="hover:text-red-600 ml-1"
                onClick={() => onRemoveTerm(term)}
                aria-label={`Remove ${term}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {recommendations.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="border rounded-xl p-3 hover:shadow-md dark:border-gray-700 transition"
            >
              <ProductImage src={p.image} alt={p.name} className="w-full h-28 object-cover rounded-lg" />
              <p className="text-sm font-medium mt-2 line-clamp-2">{p.name}</p>
              <p className="text-primary-600 font-bold text-sm">{formatCurrency(getEffectivePrice(p))}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Search for products to get recommendations here.</p>
      )}
    </section>
  );
}
