import express from 'express';
import {
  getNotifications,
  createNotification,
  markRead,
  deleteNotification,
  clearNotifications,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', createNotification);
router.delete('/clear', clearNotifications);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

export default router;
