const express = require('express');
const router = express.Router();
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database');

// Get notifications for user
router.get('/', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/all/read', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get unread count
router.get('/unread/count', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
