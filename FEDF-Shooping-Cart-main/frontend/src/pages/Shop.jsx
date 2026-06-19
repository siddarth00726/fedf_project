import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import SearchHistoryRecommendations from '../components/SearchHistoryRecommendations';
import { getCategories, getProducts, getSearchHistoryRecommendations } from '../services/api';
import {
  addSearchTerm,
  clearSearchHistory,
  getSearchHistory,
  removeSearchTerm,
} from '../utils/searchHistory';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [loading, setLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const [historyRecs, setHistoryRecs] = useState([]);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
    getCategories().then(({ data }) => setCategories(data)).catch(() => {});
    getProducts()
      .then(({ data }) => setTotalCount(data.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const terms = getSearchHistory();
    if (terms.length) {
      getSearchHistoryRecommendations(terms.join(','))
        .then(({ data }) => setHistoryRecs(data))
        .catch(() => setHistoryRecs([]));
    } else {
      setHistoryRecs([]);
    }
  }, [searchHistory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category !== 'all') params.category = category;
        const { data } = await getProducts(params);
        let list = data;
        if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
        if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
        if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
        setProducts(list);

        if (search.trim().length >= 2) {
          const updated = addSearchTerm(search);
          setSearchHistory(updated);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  const handleRemoveTerm = (term) => {
    setSearchHistory(removeSearchTerm(term));
  };

  const handleClearHistory = () => {
    setSearchHistory(clearSearchHistory());
    setHistoryRecs([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-primary-600 font-medium text-sm">2026 Collection</p>
          <h1 className="text-3xl font-bold">Shop All Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {totalCount} curated products · clean layout · matched images
          </p>
        </div>
      </div>

      <SearchHistoryRecommendations
        history={searchHistory}
        recommendations={historyRecs}
        onRemoveTerm={handleRemoveTerm}
        onClear={handleClearHistory}
      />

      <div className="card p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="search"
          placeholder="Search shoes, toys, keyboard..."
          className="input-field sm:col-span-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="input-field" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sort: Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">
        Showing {products.length} of {totalCount} products
        {category !== 'all' ? ` in ${category}` : ''}
        {search ? ` for "${search}"` : ''}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="card h-80 animate-pulse bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-gray-500 mb-2">No products found.</p>
          <button type="button" className="btn-secondary" onClick={() => { setSearch(''); setCategory('all'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
