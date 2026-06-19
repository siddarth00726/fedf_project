const KEY = 'ssc_search_history';
const MAX = 12;

export const addSearchTerm = (term) => {
  const q = term?.trim().toLowerCase();
  if (!q || q.length < 2) return getSearchHistory();
  const list = getSearchHistory().filter((t) => t !== q);
  const updated = [q, ...list].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};

export const getSearchHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

export const removeSearchTerm = (term) => {
  const updated = getSearchHistory().filter((t) => t !== term);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};

export const clearSearchHistory = () => {
  localStorage.removeItem(KEY);
  return [];
};
