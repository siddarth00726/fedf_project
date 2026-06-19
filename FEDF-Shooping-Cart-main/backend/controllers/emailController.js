import { getEmailsStore, deleteEmailStore, clearEmailsStore } from '../data/store.js';

export const getEmails = async (req, res) => {
  try {
    const { userId } = req.query;
    const list = getEmailsStore(userId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    deleteEmailStore(id);
    res.json({ message: 'Email deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearEmails = async (req, res) => {
  try {
    clearEmailsStore();
    res.json({ message: 'Email sandbox cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
