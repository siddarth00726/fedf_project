import express from 'express';
import { applyCoupon, listCoupons, createCoupon, toggleCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.get('/', listCoupons);
router.post('/apply', applyCoupon);
router.post('/create', createCoupon);
router.patch('/toggle', toggleCoupon);

export default router;
