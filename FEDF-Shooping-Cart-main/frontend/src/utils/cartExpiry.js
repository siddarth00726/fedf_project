export const CART_TTL_DAYS = 60;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const stampCartItems = (items) => {
  const now = Date.now();
  return items.map((item) => ({
    ...item,
    addedAt: item.addedAt || now,
  }));
};

export const purgeExpiredCartItems = (items) => {
  const now = Date.now();
  const maxAge = CART_TTL_DAYS * MS_PER_DAY;
  const valid = [];
  const expired = [];
  items.forEach((item) => {
    const age = now - (item.addedAt || now);
    if (age >= maxAge) expired.push(item);
    else valid.push(item);
  });
  return { valid, expired };
};

export const daysUntilExpiry = (addedAt) => {
  const remaining = CART_TTL_DAYS * MS_PER_DAY - (Date.now() - (addedAt || Date.now()));
  return Math.max(0, Math.ceil(remaining / MS_PER_DAY));
};

export const isExpiringSoon = (addedAt) => daysUntilExpiry(addedAt) <= 7;
