const express = require('express');
const router = express.Router();
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database');

// Get messages for user
router.get('/', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const [messages] = await db.query(`
      SELECT m.*, 
        sender.email as sender_email,
        receiver.email as receiver_email
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.sent_at DESC
    `, [req.user.id, req.user.id]);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { userId } = req.params;

    const [messages] = await db.query(`
      SELECT m.*, 
        sender.email as sender_email,
        receiver.email as receiver_email
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.sent_at ASC
    `, [req.user.id, userId, userId, req.user.id]);

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [userId, req.user.id]
    );

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Send message
router.post('/', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { receiver_id, subject, message, application_id } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ error: 'Receiver and message are required' });
    }

    // Check if receiver exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [receiver_id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, subject, message, application_id) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, receiver_id, subject, message, application_id]
    );

    // Create notification for receiver
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
      [
        receiver_id,
        'new_message',
        'New Message',
        'You have received a new message',
        `/messages/${result.insertId}`
      ]
    );

    res.status(201).json({ message: 'Message sent successfully', messageId: result.insertId });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE messages SET is_read = TRUE WHERE id = ? AND receiver_id = ?', [id, req.user.id]);

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get unread count
router.get('/unread/count', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;
