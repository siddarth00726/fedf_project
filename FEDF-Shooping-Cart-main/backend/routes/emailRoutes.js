import express from 'express';
import { getEmails, deleteEmail, clearEmails } from '../controllers/emailController.js';

const router = express.Router();

router.get('/', getEmails);
router.delete('/clear', clearEmails);
router.delete('/:id', deleteEmail);

export default router;
