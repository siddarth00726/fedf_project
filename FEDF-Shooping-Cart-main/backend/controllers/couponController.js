import { getAllCoupons, findCoupon, addCouponStore, toggleCouponStore } from '../data/store.js';
import { calculateOrderTotals } from '../utils/orderUtils.js';

export const listCoupons = async (req, res) => {
  try {
    res.json(getAllCoupons());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ message: 'Items are required' });
    }
    if (!code) {
      const totals = calculateOrderTotals(items, 0);
      return res.json({ valid: false, code: null, discountPercent: 0, ...totals });
    }
    const coupon = findCoupon(code);
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }
    const totals = calculateOrderTotals(items, coupon.discountPercent);
    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      description: coupon.description,
      ...totals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, description } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ message: 'Code and discount percent are required' });
    }
    const c = addCouponStore({ code, discountPercent: Number(discountPercent), description });
    res.status(201).json(c);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleCoupon = async (req, res) => {
  try {
    const { code, active } = req.body;
    const c = toggleCouponStore(code, active);
    if (!c) return res.status(404).json({ message: 'Coupon not found' });
    res.json(c);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
