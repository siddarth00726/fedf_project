import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CART_TTL_DAYS,
  daysUntilExpiry,
  isExpiringSoon,
  purgeExpiredCartItems,
  stampCartItems,
} from '../utils/cartExpiry';
import { computeCartHealthScore } from '../utils/cartHealth';

const CartContext = createContext();
const CART_KEY = 'ssc_cart';
const SAVED_KEY = 'ssc_saved_for_later';
const REMOVED_KEY = 'ssc_removed_history';
const TIMELINE_KEY = 'ssc_cart_timeline';
const BUDGET_KEY = 'ssc_cart_budget';
const GROUP_KEY = 'ssc_group_code';
const PRICE_LOCK_KEY = 'ssc_price_lock';
const REMINDER_KEY = 'ssc_cart_reminder_shown';
const PRICE_LOCK_MS = 24 * 60 * 60 * 1000;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [removedHistory, setRemovedHistory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [budgetLimit, setBudgetLimitState] = useState(0);
  const [groupCode, setGroupCode] = useState('');
  const [priceLockEnabled, setPriceLockEnabledState] = useState(false);
  const [expiryNotice, setExpiryNotice] = useState(null);

  const logTimeline = (type, message) => {
    const entry = { id: `${Date.now()}-${Math.random()}`, type, message, at: Date.now() };
    setTimeline((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      localStorage.setItem(TIMELINE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const processExpiry = (items, showToast = true) => {
    const stamped = stampCartItems(items);
    const { valid, expired } = purgeExpiredCartItems(stamped);
    if (expired.length && showToast) {
      expired.forEach((item) => {
        setRemovedHistory((prev) => {
          const next = [{ ...item, removedAt: Date.now(), reason: 'expired' }, ...prev].slice(0, 30);
          localStorage.setItem(REMOVED_KEY, JSON.stringify(next));
          return next;
        });
        logTimeline('expire', `${item.name} auto-removed (60-day limit)`);
      });
      toast.error(`${expired.length} item(s) removed — cart expires after ${CART_TTL_DAYS} days`, {
        duration: 5000,
      });
    }
    const soon = valid.filter((i) => isExpiringSoon(i.addedAt));
    if (soon.length) {
      setExpiryNotice(
        `${soon.length} item(s) expire in ${daysUntilExpiry(soon[0].addedAt)} day(s). Checkout soon.`
      );
      const lastShown = localStorage.getItem(REMINDER_KEY);
      const today = new Date().toDateString();
      if (lastShown !== today && showToast) {
        toast(`Reminder: cart items removed after ${CART_TTL_DAYS} days.`, { icon: '⏳', duration: 6000 });
        localStorage.setItem(REMINDER_KEY, today);
      }
    } else {
      setExpiryNotice(null);
    }
    return valid;
  };

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    const saved = localStorage.getItem(SAVED_KEY);
    const removed = localStorage.getItem(REMOVED_KEY);
    const tl = localStorage.getItem(TIMELINE_KEY);
    const budget = localStorage.getItem(BUDGET_KEY);
    const group = localStorage.getItem(GROUP_KEY);
    const lock = localStorage.getItem(PRICE_LOCK_KEY);

    if (stored) setCart(processExpiry(JSON.parse(stored), true));
    if (saved) setSavedForLater(JSON.parse(saved));
    if (removed) setRemovedHistory(JSON.parse(removed));
    if (tl) setTimeline(JSON.parse(tl));
    if (budget) setBudgetLimitState(Number(budget));
    if (group) setGroupCode(group);
    if (lock === 'true') setPriceLockEnabledState(true);
  }, []);

  useEffect(() => {
    if (!cart.length) {
      localStorage.setItem(CART_KEY, JSON.stringify([]));
      setExpiryNotice(null);
      return;
    }
    const { valid, expired } = purgeExpiredCartItems(stampCartItems(cart));
    if (expired.length && valid.length !== cart.length) {
      setCart(valid);
      return;
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    const soon = cart.filter((i) => isExpiringSoon(i.addedAt));
    setExpiryNotice(
      soon.length
        ? `${soon.length} item(s) expire in ${daysUntilExpiry(soon[0].addedAt)} day(s). Checkout soon.`
        : null
    );
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedForLater));
  }, [savedForLater]);

  useEffect(() => {
    localStorage.setItem(REMOVED_KEY, JSON.stringify(removedHistory));
  }, [removedHistory]);

  const applyPriceLock = (product) => {
    if (!priceLockEnabled) return product;
    const now = Date.now();
    return {
      ...product,
      priceLocked: product.price,
      priceLockedUntil: now + PRICE_LOCK_MS,
      price: product.price,
    };
  };

  const addToCart = (product, qty = 1, silent = false) => {
    const now = Date.now();
    const withLock = applyPriceLock(product);
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, quantity: i.quantity + qty, addedAt: i.addedAt || now }
            : i
        );
      }
      return [...prev, { ...withLock, quantity: qty, addedAt: now }];
    });
    logTimeline('add', `Added ${product.name} (×${qty})`);
    if (priceLockEnabled) logTimeline('lock', `Price locked for ${product.name} (24h)`);
    if (!silent) toast.success('Added to cart');
  };

  const removeFromCart = (id, silent = false) => {
    const item = cart.find((i) => i._id === id);
    if (item) {
      setRemovedHistory((prev) => [{ ...item, removedAt: Date.now(), reason: 'manual' }, ...prev].slice(0, 30));
      logTimeline('remove', `Removed ${item.name} from cart`);
    }
    setCart((prev) => prev.filter((i) => i._id !== id));
    if (!silent) toast.success('Removed from cart');
  };

  const restoreRemovedItem = (item) => {
    addToCart(item, item.quantity || 1);
    setRemovedHistory((prev) => prev.filter((r) => r.removedAt !== item.removedAt || r._id !== item._id));
    toast.success('Restored to cart');
  };

  const clearRemovedHistory = () => {
    setRemovedHistory([]);
    toast.success('Removed history cleared');
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return removeFromCart(id);
    const item = cart.find((i) => i._id === id);
    setCart((prev) => prev.map((i) => (i._id === id ? { ...i, quantity } : i)));
    if (item) logTimeline('update', `Updated ${item.name} quantity to ${quantity}`);
  };

  const saveForLater = (id) => {
    const item = cart.find((i) => i._id === id);
    if (item) {
      setSavedForLater((prev) => [...prev.filter((s) => s._id !== id), item]);
      removeFromCart(id, true);
      logTimeline('update', `Saved ${item.name} for later`);
      toast.success('Saved for later');
    }
  };

  const moveSavedToCart = (id) => {
    const item = savedForLater.find((i) => i._id === id);
    if (item) {
      addToCart(item, item.quantity);
      setSavedForLater((prev) => prev.filter((i) => i._id !== id));
    }
  };

  const clearCart = () => {
    logTimeline('remove', 'Cart cleared');
    setCart([]);
  };

  const setBudgetLimit = (amount) => {
    setBudgetLimitState(amount);
    localStorage.setItem(BUDGET_KEY, String(amount));
    logTimeline('budget', amount ? `Smart budget set to ₹${amount}` : 'Smart budget cleared');
    if (amount) toast.success('Smart budget updated');
  };

  const enableGroupPurchase = () => {
    const code = `GROUP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setGroupCode(code);
    localStorage.setItem(GROUP_KEY, code);
    logTimeline('update', `Group purchase started — code ${code}`);
    toast.success('Group cart created! Share your code.');
  };

  const setPriceLockEnabled = (enabled) => {
    setPriceLockEnabledState(enabled);
    localStorage.setItem(PRICE_LOCK_KEY, enabled ? 'true' : 'false');
    logTimeline('lock', enabled ? 'Price lock enabled for new items' : 'Price lock disabled');
    toast.success(enabled ? 'Price lock ON (24h)' : 'Price lock OFF');
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const cartHealth = useMemo(
    () => computeCartHealthScore({ cart, cartTotal, budgetLimit, priceLockEnabled }),
    [cart, cartTotal, budgetLimit, priceLockEnabled]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        savedForLater,
        removedHistory,
        timeline,
        expiryNotice,
        budgetLimit,
        groupCode,
        priceLockEnabled,
        cartHealth,
        cartTtlDays: CART_TTL_DAYS,
        daysUntilExpiry,
        isExpiringSoon,
        addToCart,
        removeFromCart,
        restoreRemovedItem,
        clearRemovedHistory,
        updateQuantity,
        saveForLater,
        moveSavedToCart,
        clearCart,
        setBudgetLimit,
        enableGroupPurchase,
        setPriceLockEnabled,
        cartTotal,
        cartCount,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
