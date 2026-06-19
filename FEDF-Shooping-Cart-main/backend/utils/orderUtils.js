export const generateOrderNumber = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `ORD${num}`;
};

export const SHIPPING_CHARGE = 49;
export const GST_RATE = 0.18;

export const calculateOrderTotals = (items, discountPercent = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const afterDiscount = subtotal - discount;
  const shipping = subtotal > 0 ? SHIPPING_CHARGE : 0;
  const gst = Math.round(afterDiscount * GST_RATE);
  const finalTotal = afterDiscount + shipping + gst;
  return { subtotal, discount, shipping, gst, finalTotal };
};
