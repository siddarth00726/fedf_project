import {
  getNotificationsStore,
  addNotificationStore,
  markNotificationReadStore,
  deleteNotificationStore,
  clearNotificationsStore,
} from '../data/store.js';

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    const list = getNotificationsStore(userId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    const notif = addNotificationStore({
      userId: userId || 'all',
      type: type || 'alert',
      title,
      message,
    });
    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = markNotificationReadStore(id);
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    deleteNotificationStore(id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    clearNotificationsStore(userId);
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
