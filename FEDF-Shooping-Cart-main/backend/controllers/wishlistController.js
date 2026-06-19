import {
  addToWishlistStore,
  getProductById,
  getWishlistByUser,
  removeFromWishlistStore,
} from '../data/store.js';

export const getWishlist = async (req, res) => {
  try {
    const products = getWishlistByUser(req.params.userId);
    res.json({ userId: req.params.userId, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const product = getProductById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const products = addToWishlistStore(userId, productId);
    res.json({ userId, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const products = removeFromWishlistStore(userId, productId);
    res.json({ userId, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
