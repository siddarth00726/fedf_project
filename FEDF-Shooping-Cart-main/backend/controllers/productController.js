import { getAllProducts, getFlashDealProducts, getProductById, updateProductStockStore, addProductStore } from '../data/store.js';
import { getRecommendationKeywords } from '../utils/recommendations.js';

export const getProducts = async (req, res) => {
  try {
    const { search, category, trending } = req.query;
    let list = getAllProducts();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const text = `${p.name} ${p.description} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return text.includes(q);
      });
    }
    if (category && category !== 'all') {
      list = list.filter((p) => p.category === category);
    }
    if (trending === 'true') {
      list = list.filter((p) => p.trending);
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductByIdHandler = async (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = [...new Set(getAllProducts().map((p) => p.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlashDeals = async (req, res) => {
  try {
    res.json(getFlashDealProducts());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSearchHistoryRecommendations = async (req, res) => {
  try {
    const raw = req.query.terms || '';
    const terms = raw
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length >= 2);
    if (!terms.length) return res.json([]);

    const all = getAllProducts();
    const ranked = all
      .map((p) => {
        const text = `${p.name} ${p.description} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        const score = terms.reduce((sum, term) => (text.includes(term) ? sum + 1 : sum), 0);
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json(ranked.slice(0, 8).map((x) => x.p));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const keywords = getRecommendationKeywords(product.name, product.category);
    const all = getAllProducts().filter((p) => p._id !== product._id);
    let recommendations = [];
    if (keywords.length) {
      recommendations = all.filter((p) =>
        keywords.some((k) => p.name.toLowerCase().includes(k))
      );
    }
    if (!recommendations.length) {
      recommendations = all.filter((p) => p.category === product.category);
    }
    res.json(recommendations.slice(0, 6));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const updated = updateProductStockStore(id, stock);
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock, badge } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    const product = addProductStore({ name, description, price: Number(price), category, image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=600&q=80', stock: Number(stock || 0), badge });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
