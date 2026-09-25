import { Router } from 'express';
import { getAllNotifications, markAsRead, clearNotifications } from '../services/notificationService.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ success: true, notifications: getAllNotifications() });
});

router.put('/:id/read', (req, res) => {
  const notif = markAsRead(req.params.id);
  res.json({ success: true, notification: notif });
});

router.delete('/', (req, res) => {
  clearNotifications();
  res.json({ success: true, message: 'All notifications cleared' });
});

export default router;
