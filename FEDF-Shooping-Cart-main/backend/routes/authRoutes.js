import express from 'express';
import { login, register, getMe, updateProfile } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authRequired, getMe);
router.put('/profile', authRequired, updateProfile);

export default router;
