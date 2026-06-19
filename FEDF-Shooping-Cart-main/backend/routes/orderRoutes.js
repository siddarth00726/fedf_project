import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderByIdHandler,
  getOrderByNumberHandler,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { adminRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', createOrder);
router.get('/', getOrders);
router.get('/track/:orderNumber', getOrderByNumberHandler);
router.get('/:id', getOrderByIdHandler);
router.patch('/:id/status', adminRequired, updateOrderStatus);

export default router;
