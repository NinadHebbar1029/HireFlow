const express = require('express');
const router = express.Router();
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database');

// Get activity feed for admin
router.get('/admin', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const [activities] = await db.query(`
      SELECT 
        'user_registered' as type,
        u.id as entity_id,
        u.email as entity_name,
        u.role,
        u.created_at as timestamp,
        CONCAT('New ', u.role, ' registered: ', u.email) as description
      FROM users u
      WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'job_posted' as type,
        j.id as entity_id,
        j.title as entity_name,
        'job' as role,
        j.created_at as timestamp,
        CONCAT('New job posted: ', j.title) as description
      FROM jobs j
      WHERE j.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'application_submitted' as type,
        a.id as entity_id,
        j.title as entity_name,
        'application' as role,
        a.applied_at as timestamp,
        CONCAT('Application submitted for: ', j.title) as description
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY timestamp DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json(activities);
  } catch (error) {
    console.error('Get admin activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// Get activity feed for job seeker
router.get('/job-seeker', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 15 } = req.query;

    const [activities] = await db.query(`
      SELECT 
        'application_status_changed' as type,
        a.id as entity_id,
        j.title as entity_name,
        a.status,
        a.updated_at as timestamp,
        CONCAT('Your application for "', j.title, '" status changed to: ', a.status) as description
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      AND a.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      
      UNION ALL
      
      SELECT 
        'new_job_match' as type,
        j.id as entity_id,
        j.title as entity_name,
        'matched' as status,
        j.created_at as timestamp,
        CONCAT('New job matching your profile: ', j.title) as description
      FROM jobs j
      WHERE j.status = 'active'
      AND j.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'message_received' as type,
        m.id as entity_id,
        CONCAT(u.email, ' sent you a message') as entity_name,
        'unread' as status,
        m.created_at as timestamp,
        m.message as description
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ?
      AND m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY timestamp DESC
      LIMIT ?
    `, [userId, userId, parseInt(limit)]);

    res.json(activities);
  } catch (error) {
    console.error('Get job seeker activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// Get activity feed for recruiter
router.get('/recruiter', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 15 } = req.query;

    const [activities] = await db.query(`
      SELECT 
        'new_application' as type,
        a.id as entity_id,
        CONCAT(u.email, ' applied to ', j.title) as entity_name,
        a.status,
        a.applied_at as timestamp,
        CONCAT('New application for "', j.title, '" from ', u.email) as description,
        a.job_id
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.id
      JOIN users u ON jsp.user_id = u.id
      WHERE j.recruiter_id = (SELECT id FROM recruiter_profiles WHERE user_id = ?)
      AND a.applied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      
      UNION ALL
      
      SELECT 
        'job_view' as type,
        j.id as entity_id,
        CONCAT('Your job "', j.title, '" was viewed') as entity_name,
        j.status,
        NOW() as timestamp,
        CONCAT('Job posting "', j.title, '" received views') as description,
        j.id as job_id
      FROM jobs j
      WHERE j.recruiter_id = (SELECT id FROM recruiter_profiles WHERE user_id = ?)
      AND j.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY timestamp DESC
      LIMIT ?
    `, [userId, userId, parseInt(limit)]);

    res.json(activities);
  } catch (error) {
    console.error('Get recruiter activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

module.exports = router;
