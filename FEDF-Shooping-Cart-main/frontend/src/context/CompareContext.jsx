import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();
const MAX = 3;

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (product) => {
    if (compareList.some((p) => p._id === product._id)) {
      toast.error('Already in compare list');
      return;
    }
    if (compareList.length >= MAX) {
      toast.error(`Compare up to ${MAX} products only`);
      return;
    }
    setCompareList((prev) => [...prev, product]);
    toast.success('Added to compare');
  };

  const removeFromCompare = (id) => {
    setCompareList((prev) => prev.filter((p) => p._id !== id));
  };

  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
