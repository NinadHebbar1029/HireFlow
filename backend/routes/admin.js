const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database');

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRoles('admin'), checkUserStatus, async (req, res) => {
  try {
    const { role, status } = req.query;

    let query = 'SELECT id, email, role, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await db.query(query, params);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user status (admin only)
router.put('/users/:id/status', authenticateToken, authorizeRoles('admin'), checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Prevent admin from changing their own status
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own status' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    // Create notification for user
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [
        id,
        'account_status_update',
        'Account Status Updated',
        `Your account status has been updated to: ${status}`
      ]
    );

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get all jobs (admin only)
router.get('/jobs', authenticateToken, authorizeRoles('admin'), checkUserStatus, async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT j.*, r.company_name, r.company_logo_url,
        (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
      FROM jobs j
      JOIN recruiter_profiles r ON j.recruiter_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND j.status = ?';
      params.push(status);
    }

    query += ' ORDER BY j.created_at DESC';

    const [jobs] = await db.query(query, params);

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Update job status (admin only)
router.put('/jobs/:id/status', authenticateToken, authorizeRoles('admin'), checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'closed', 'pending_approval', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query('UPDATE jobs SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'Job status updated successfully' });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// Get all applications (admin only)
router.get('/applications', authenticateToken, authorizeRoles('admin'), checkUserStatus, async (req, res) => {
  try {
    const [applications] = await db.query(`
      SELECT a.*, j.title as job_title, jsp.full_name as job_seeker_name, r.company_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.id
      JOIN recruiter_profiles r ON j.recruiter_id = r.id
      ORDER BY a.applied_at DESC
      LIMIT 100
    `);

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get system statistics (admin only)
router.get('/statistics', authenticateToken, authorizeRoles('admin'), checkUserStatus, async (req, res) => {
  try {
    // User statistics
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'job_seeker' THEN 1 ELSE 0 END) as job_seekers,
        SUM(CASE WHEN role = 'recruiter' THEN 1 ELSE 0 END) as recruiters,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_users,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_users,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users,
        SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) as banned_users
      FROM users
    `);

    // Job statistics
    const [jobStats] = await db.query(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_jobs,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs,
        SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending_jobs
      FROM jobs
    `);

    // Application statistics
    const [applicationStats] = await db.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted_applications,
        SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired_count
      FROM applications
    `);

    res.json({
      users: userStats[0],
      jobs: jobStats[0],
      applications: applicationStats[0]
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
