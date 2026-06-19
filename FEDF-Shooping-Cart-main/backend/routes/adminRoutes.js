import express from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getAllOrdersAdmin,
} from '../controllers/adminController.js';
import { adminRequired } from '../middleware/auth.js';

const router = express.Router();

router.use(adminRequired);
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/orders', getAllOrdersAdmin);

export default router;
