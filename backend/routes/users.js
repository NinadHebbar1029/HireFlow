const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database');

// Get current user
router.get('/me', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, role, status, face_recognition_enabled, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update password
router.put('/password', [
  authenticateToken,
  checkUserStatus,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current password
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Toggle face recognition
router.put('/face-recognition', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { enabled } = req.body;

    await db.query(
      'UPDATE users SET face_recognition_enabled = ? WHERE id = ?',
      [enabled, req.user.id]
    );

    res.json({ message: 'Face recognition settings updated', enabled });
  } catch (error) {
    console.error('Update face recognition error:', error);
    res.status(500).json({ error: 'Failed to update face recognition settings' });
  }
});

module.exports = router;
