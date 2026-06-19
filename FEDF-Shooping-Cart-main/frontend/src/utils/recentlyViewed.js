const KEY = 'ssc_recently_viewed';
const MAX = 8;

export const addRecentlyViewed = (product) => {
  const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
  const filtered = stored.filter((p) => p._id !== product._id);
  const updated = [product, ...filtered].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};

export const getRecentlyViewed = () => JSON.parse(localStorage.getItem(KEY) || '[]');
