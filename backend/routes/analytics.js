const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database');

// Get admin analytics
router.get('/admin/stats', authenticateToken, authorizeRoles('admin'), checkUserStatus, async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y

    // Calculate date range
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[period] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user growth data
    const [userGrowth] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate]);

    // Get application trends
    const [applicationTrends] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count, status
      FROM applications
      WHERE created_at >= ?
      GROUP BY DATE(created_at), status
      ORDER BY date ASC
    `, [startDate]);

    // Get job posting trends
    const [jobTrends] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM jobs
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate]);

    // Get user distribution by role
    const [userDistribution] = await db.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    res.json({
      userGrowth,
      applicationTrends,
      jobTrends,
      userDistribution,
      period
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get job seeker analytics
router.get('/job-seeker/stats', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get application success rate over time
    const [applicationStats] = await db.query(`
      SELECT 
        DATE(a.applied_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as hired,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN a.status = 'interviewed' THEN 1 ELSE 0 END) as interviewed
      FROM applications a
      JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.id
      WHERE jsp.user_id = ?
      GROUP BY DATE(a.applied_at)
      ORDER BY date ASC
    `, [userId]);

    // Get profile views over time (if tracking implemented)
    const [profileViews] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as views
      FROM profile_views
      WHERE profile_user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [userId]).catch(() => [[]]);

    // Get application response time
    const [responseTime] = await db.query(`
      SELECT AVG(DATEDIFF(updated_at, created_at)) as avg_response_days
      FROM applications
      WHERE user_id = ? AND status != 'pending'
    `, [userId]);

    res.json({
      applicationStats,
      profileViews,
      avgResponseTime: responseTime[0]?.avg_response_days || 0
    });
  } catch (error) {
    console.error('Get job seeker analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get recruiter analytics
router.get('/recruiter/stats', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get hiring funnel data
    const [funnelData] = await db.query(`
      SELECT 
        j.id as job_id,
        j.title as job_title,
        COUNT(a.id) as total_applications,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN a.status = 'interviewed' THEN 1 ELSE 0 END) as interviewed,
        SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as hired,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.recruiter_id = (SELECT id FROM recruiter_profiles WHERE user_id = ?)
      GROUP BY j.id, j.title
    `, [userId]);

    // Get time-to-hire metrics
    const [timeToHire] = await db.query(`
      SELECT 
        AVG(DATEDIFF(a.updated_at, a.applied_at)) as avg_days,
        MIN(DATEDIFF(a.updated_at, a.applied_at)) as min_days,
        MAX(DATEDIFF(a.updated_at, a.applied_at)) as max_days
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = (SELECT id FROM recruiter_profiles WHERE user_id = ?)
      AND a.status = 'hired'
    `, [userId]);

    // Get application trends over time
    const [applicationTrends] = await db.query(`
      SELECT 
        DATE(a.applied_at) as date,
        COUNT(*) as count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = (SELECT id FROM recruiter_profiles WHERE user_id = ?)
      AND a.applied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(a.applied_at)
      ORDER BY date ASC
    `, [userId]);

    res.json({
      funnelData,
      timeToHire: timeToHire[0] || { avg_days: 0, min_days: 0, max_days: 0 },
      applicationTrends
    });
  } catch (error) {
    console.error('Get recruiter analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
