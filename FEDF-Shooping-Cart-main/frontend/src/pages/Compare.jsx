import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCheckout } from '../context/CheckoutContext';
import ProductImage from '../components/ProductImage';
import StarRating from '../components/StarRating';
import { formatCurrency } from '../utils/formatCurrency';
import { getEffectivePrice } from '../utils/productPrice';
import toast from 'react-hot-toast';

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { startBuyNow } = useCheckout();
  const navigate = useNavigate();

  // Comparison type tabs: 'stores' (Compare store deals) or 'products' (Compare product specs)
  const [compareTab, setCompareTab] = useState('stores');
  // Selected product index in the compareList to compare across stores
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);

  // Auto-adjust selected index if compareList changes
  useEffect(() => {
    if (selectedProductIdx >= compareList.length && compareList.length > 0) {
      setSelectedProductIdx(0);
    }
  }, [compareList.length, selectedProductIdx]);

  if (!compareList.length) {
    return (
      <div className="text-center py-20 card max-w-xl mx-auto space-y-6">
        <div className="text-6xl animate-pulse">⚖️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compare Hub is Empty</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Add products to your compare list from product cards or detail pages to search for the best store deals and analyze technical specifications.
        </p>
        <Link to="/shop" className="btn-primary inline-block px-8 py-3">
          Browse Catalog
        </Link>
      </div>
    );
  }

  // Active product for store comparison
  const activeProduct = compareList[selectedProductIdx] || compareList[0];

  // Helper to generate deterministic deals across stores based on the product ID
  const getStoreDeals = (product) => {
    const basePrice = getEffectivePrice(product);
    const baseRating = product.rating || 4.2;
    // Generate a simple hash of the product ID
    const hash = product._id
      ? product._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : 123;

    // Define raw store parameters
    const deals = [
      {
        name: 'Amazon',
        logo: '📦',
        brandColor: 'text-orange-500 dark:text-orange-400',
        badgeBg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30',
        price: Math.round(basePrice * (0.95 + (hash % 4) * 0.01)), // 95% to 98% of base price
        deliveryDays: 1 + (hash % 2), // 1 or 2 days
        rating: Math.min(5, Math.max(1, +(baseRating + ((hash % 3) - 1) * 0.1).toFixed(1))),
        returnPolicy: '10 Days Replacement',
        warrantyYears: 1 + (hash % 2) * 0.5, // 1 or 1.5 years
        offers: 'Flat ₹1,000 off on ICICI Credit Cards',
        storeUrl: 'https://amazon.in',
      },
      {
        name: 'Flipkart',
        logo: '🛍️',
        brandColor: 'text-blue-500 dark:text-blue-400',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
        price: Math.round(basePrice * (0.92 + (hash % 5) * 0.01)), // 92% to 96% of base price (cheapest usually)
        deliveryDays: 2 + (hash % 2), // 2 or 3 days
        rating: Math.min(5, Math.max(1, +(baseRating + ((hash % 4) - 2) * 0.1).toFixed(1))),
        returnPolicy: '7 Days Replacement',
        warrantyYears: 1, // 1 year
        offers: '5% Unlimited Cashback on Axis Bank Credit Card',
        storeUrl: 'https://flipkart.com',
      },
      {
        name: 'Reliance Digital',
        logo: '⚡',
        brandColor: 'text-red-500 dark:text-red-400',
        badgeBg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
        price: Math.round(basePrice * (0.96 + (hash % 4) * 0.01)), // 96% to 99% of base price
        deliveryDays: 2 + (hash % 3), // 2 to 4 days
        rating: Math.min(5, Math.max(1, +(baseRating + ((hash % 5) - 2) * 0.1).toFixed(1))),
        returnPolicy: '14 Days Return',
        warrantyYears: 1 + (hash % 3) * 0.5, // 1, 1.5 or 2 years
        offers: '10% Instant Discount on HDFC Bank Cards',
        storeUrl: 'https://reliancedigital.in',
      },
      {
        name: 'Croma',
        logo: '🔌',
        brandColor: 'text-teal-500 dark:text-teal-400',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/30',
        price: Math.round(basePrice * (0.94 + (hash % 6) * 0.01)), // 94% to 99% of base price
        deliveryDays: 1 + (hash % 3), // 1 to 3 days
        rating: Math.min(5, Math.max(1, +(baseRating + ((hash % 6) - 3) * 0.1).toFixed(1))),
        returnPolicy: '15 Days Replacement',
        warrantyYears: 2, // Promo 2 years warranty
        offers: 'Flat ₹1,500 off on Federal Bank Credit Cards',
        storeUrl: 'https://croma.com',
      },
    ];

    // Calculate score metrics
    const prices = deals.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    deals.forEach((d) => {
      // Normalization formulas
      const priceScore = (minPrice / d.price) * 100;
      const ratingScore = (d.rating / 5) * 100;
      // Lower delivery days is better (1 day = 100, 2 days = 80, 3 days = 60, 4 days = 40, etc.)
      const deliveryScore = Math.max(0, 100 - (d.deliveryDays - 1) * 20);
      // Higher warranty is better (max out at 2 years)
      const warrantyScore = (d.warrantyYears / 2) * 100;

      // Overall Score = 40% Price + 20% Rating + 20% Delivery + 20% Warranty
      d.overallScore = +(
        priceScore * 0.4 +
        ratingScore * 0.2 +
        deliveryScore * 0.2 +
        warrantyScore * 0.2
      ).toFixed(1);
    });

    return {
      deals,
      minPrice,
      maxPrice,
    };
  };

  const { deals: storeDeals, minPrice, maxPrice } = getStoreDeals(activeProduct);

  // Smart Recommendation Engine Calculations
  const bestDeal = storeDeals.reduce((best, d) => (d.overallScore > best.overallScore ? d : best), storeDeals[0]);
  const cheapestDeal = storeDeals.reduce((cheap, d) => (d.price < cheap.price ? d : cheap), storeDeals[0]);
  
  // Savings amount compared to the maximum price store
  const savingsAmount = maxPrice - bestDeal.price;

  // Conversational reason generation
  let recommendationReason = '';
  if (bestDeal.name === cheapestDeal.name) {
    recommendationReason = `Offers the absolute lowest price of ${formatCurrency(bestDeal.price)} with ultra-fast delivery in ${bestDeal.deliveryDays} day(s), making it the undisputed winner.`;
  } else {
    recommendationReason = `Provides a superior combination of faster delivery (${bestDeal.deliveryDays} day(s)), a longer warranty coverage (${bestDeal.warrantyYears} years), and a robust user rating of ${bestDeal.rating}/5, easily compensating for the slight price difference compared to ${cheapestDeal.name}.`;
  }

  // Handle store deal direct checkout
  const handleProceedStoreDeal = (deal) => {
    const customizedProduct = {
      ...activeProduct,
      price: deal.price,
      name: `${activeProduct.name} (${deal.name} Deal)`,
    };
    startBuyNow(customizedProduct, 1);
    toast.success(`Redirecting to checkout with ${deal.name}'s special offer!`);
    navigate('/checkout/address');
  };

  return (
    <div className="space-y-8 text-left py-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Compare Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Compare store-specific deals or compare product specs side-by-side.
          </p>
        </div>
        <button
          onClick={clearCompare}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 rounded-lg text-sm font-semibold transition shrink-0"
        >
          🗑 Clear Compare Hub
        </button>
      </div>

      {/* Comparison View Selector Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-px text-sm font-bold">
        <button
          onClick={() => setCompareTab('stores')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            compareTab === 'stores'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>🛒 Store Deals Comparison</span>
          <span className="text-[10px] bg-primary-100 dark:bg-primary-950 text-primary-600 px-1.5 py-0.5 rounded-full font-bold">New</span>
        </button>
        <button
          onClick={() => setCompareTab('products')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            compareTab === 'products'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>⚖️ Specs side-by-side</span>
          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full font-bold">{compareList.length} Items</span>
        </button>
      </div>

      {/* Tab: Store Deals Comparison */}
      {compareTab === 'stores' && (
        <div className="space-y-6">
          {/* Active Product Selector Slider/Cards */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Product to compare across stores</h3>
            <div className="flex flex-wrap gap-3">
              {compareList.map((p, idx) => (
                <div
                  key={p._id}
                  onClick={() => setSelectedProductIdx(idx)}
                  className={`card p-3 flex items-center gap-3 cursor-pointer border-2 transition-all ${
                    idx === selectedProductIdx
                      ? 'border-primary-600 shadow bg-primary-50/5 dark:bg-primary-900/5'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <ProductImage src={p.image} alt={p.name} category={p.category} className="w-10 h-10 object-cover rounded-lg" />
                  <div className="text-left">
                    <p className="font-bold text-xs max-w-[120px] truncate text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-primary-600 font-bold mt-0.5">{formatCurrency(getEffectivePrice(p))}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCompare(p._id);
                    }}
                    className="text-gray-400 hover:text-red-500 font-bold text-sm leading-none pl-2 border-l border-gray-100 dark:border-gray-800"
                    title="Remove product"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Recommendation Engine Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/30 uppercase tracking-widest">
                💡 Smart Recommendation Engine
              </span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                🏆 Best Value Product: <span className="text-amber-600 dark:text-amber-400">{bestDeal.name}</span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                {recommendationReason}
              </p>
            </div>
            
            {/* Savings & Action */}
            <div className="shrink-0 flex flex-col items-center md:items-end justify-center gap-2 border-t md:border-t-0 md:border-l border-amber-500/20 pt-4 md:pt-0 md:pl-6 text-center md:text-right">
              <div>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Estimated Savings</p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">{formatCurrency(savingsAmount)}</p>
              </div>
              <button
                onClick={() => handleProceedStoreDeal(bestDeal)}
                className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg shadow-md transition-all hover:scale-[1.02]"
              >
                Proceed with Best Value Deal &rarr;
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="card overflow-x-auto border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Store Outlet</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Price Offer</th>
                  <th className="p-4">Delivery Timeline</th>
                  <th className="p-4">User Rating</th>
                  <th className="p-4">Return Policy</th>
                  <th className="p-4">Warranty Scope</th>
                  <th className="p-4">Promo Offers</th>
                  <th className="p-4 text-center">Value Score</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-sm">
                {storeDeals.map((deal) => {
                  const isBest = deal.name === bestDeal.name;
                  return (
                    <tr
                      key={deal.name}
                      className={`transition-colors duration-250 ${
                        isBest
                          ? 'bg-amber-500/[0.04] dark:bg-amber-400/[0.02] font-medium'
                          : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/10'
                      }`}
                    >
                      {/* Store Outlet */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl shrink-0">{deal.logo}</span>
                          <div>
                            <span className="font-extrabold text-gray-900 dark:text-white">{deal.name}</span>
                            {isBest && (
                              <span className="block text-[8px] uppercase tracking-widest font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                                ⭐ Best Value
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="p-4">
                        <div className="max-w-[150px] truncate text-gray-700 dark:text-gray-300 font-semibold" title={activeProduct.name}>
                          {activeProduct.name}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(deal.price)}
                          </span>
                          {deal.price === minPrice && (
                            <span className="block text-[9px] text-green-600 dark:text-green-400 font-extrabold uppercase tracking-wider">
                              Cheapest
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Delivery Time */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          deal.deliveryDays === 1
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350'
                        }`}>
                          🚀 {deal.deliveryDays} {deal.deliveryDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800 dark:text-gray-200">{deal.rating}</span>
                          <span className="text-amber-400">★</span>
                        </div>
                      </td>

                      {/* Return Policy */}
                      <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                        {deal.returnPolicy}
                      </td>

                      {/* Warranty */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded">
                          🛡️ {deal.warrantyYears} {deal.warrantyYears === 1 ? 'Year' : 'Years'}
                        </span>
                      </td>

                      {/* Available Offers */}
                      <td className="p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal max-w-[180px]" title={deal.offers}>
                          🏷️ {deal.offers}
                        </p>
                      </td>

                      {/* Overall Value Score */}
                      <td className="p-4 text-center">
                        <div className="inline-block relative">
                          <div className={`px-2.5 py-1.5 rounded-xl font-black text-xs ${
                            deal.overallScore >= 85
                              ? 'bg-green-500 text-white shadow-sm'
                              : deal.overallScore >= 70
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-gray-200 dark:bg-gray-750 text-gray-600 dark:text-gray-300'
                          }`}>
                            {deal.overallScore} / 100
                          </div>
                        </div>
                      </td>

                      {/* Action button */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleProceedStoreDeal(deal)}
                          className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all ${
                            isBest
                              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow shadow-amber-500/20 hover:scale-[1.02]'
                              : 'bg-primary-600 hover:bg-primary-700 text-white'
                          }`}
                        >
                          Buy Deal
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Specs side-by-side (Product Comparison) */}
      {compareTab === 'products' && (
        <div className="card overflow-x-auto border border-gray-200 dark:border-gray-700">
          <table className="w-full min-w-[700px] border-collapse text-center">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-left">
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider w-40">Specifications</th>
                {compareList.map((p) => (
                  <th key={p._id} className="p-4 min-w-[200px] text-center border-l dark:border-gray-850">
                    <div className="relative group/spec duration-200 inline-block w-full">
                      <button
                        onClick={() => removeFromCompare(p._id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-100 hover:bg-red-500 hover:text-white text-red-600 rounded-full text-xs font-bold flex items-center justify-center transition"
                        title="Remove product"
                      >
                        ✕
                      </button>
                      <ProductImage src={p.image} alt={p.name} category={p.category} className="w-20 h-20 object-cover rounded-xl mx-auto mb-3 border dark:border-gray-800" />
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">{p.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{p.category}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-sm">
              {/* Row: Price */}
              <tr>
                <td className="p-4 text-left font-bold text-gray-500">Retail Price</td>
                {compareList.map((p) => (
                  <td key={p._id} className="p-4 border-l dark:border-gray-850 font-extrabold text-primary-600 text-base">
                    {formatCurrency(getEffectivePrice(p))}
                  </td>
                ))}
              </tr>

              {/* Row: Rating */}
              <tr>
                <td className="p-4 text-left font-bold text-gray-500">User Rating</td>
                {compareList.map((p) => (
                  <td key={p._id} className="p-4 border-l dark:border-gray-850">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-bold">{p.rating || 4.2}</span>
                      <StarRating rating={p.rating || 4.2} />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Stock status */}
              <tr>
                <td className="p-4 text-left font-bold text-gray-500">Stock Availability</td>
                {compareList.map((p) => (
                  <td key={p._id} className="p-4 border-l dark:border-gray-850">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      p.stock > 0
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-950/20'
                    }`}>
                      {p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row: Description */}
              <tr>
                <td className="p-4 text-left font-bold text-gray-500">Description</td>
                {compareList.map((p) => (
                  <td key={p._id} className="p-4 border-l dark:border-gray-850 text-xs text-gray-550 dark:text-gray-400 leading-normal max-w-xs text-center mx-auto">
                    <p className="line-clamp-3">{p.description}</p>
                  </td>
                ))}
              </tr>

              {/* Row: Action Details */}
              <tr className="bg-gray-50/20 dark:bg-gray-900/5">
                <td className="p-4 text-left font-bold text-gray-500">Action</td>
                {compareList.map((p) => (
                  <td key={p._id} className="p-4 border-l dark:border-gray-850">
                    <div className="flex flex-col gap-2 max-w-[150px] mx-auto">
                      <Link to={`/product/${p._id}`} className="btn-primary text-xs py-2 w-full text-center font-bold uppercase tracking-wider">
                        View Specs
                      </Link>
                      <button
                        onClick={() => startBuyNow(p, 1)}
                        disabled={p.stock < 1}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 w-full rounded-lg font-bold uppercase tracking-wider transition disabled:opacity-50"
                      >
                        Buy Now
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
