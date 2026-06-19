// Cart is persisted on frontend via localStorage.
// Backend validates cart items during order creation and coupon apply.

export const validateCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Cart is empty' });
    res.json({ valid: true, itemCount: items.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
