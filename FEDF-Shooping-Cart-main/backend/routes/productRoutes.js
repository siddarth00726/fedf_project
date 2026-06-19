import express from 'express';
import {
  getProducts,
  getProductByIdHandler,
  getCategories,
  getRecommendations,
  getFlashDeals,
  getSearchHistoryRecommendations,
  updateStock,
  createProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/recommendations/search-history', getSearchHistoryRecommendations);
router.get('/flash-deals', getFlashDeals);
router.get('/categories', getCategories);
router.post('/create', createProduct);
router.patch('/:id/stock', updateStock);
router.get('/:id/recommendations', getRecommendations);
router.get('/:id', getProductByIdHandler);

export default router;
