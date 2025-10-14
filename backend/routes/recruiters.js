const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, checkUserStatus } = require('../middleware/auth');
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');
const db = require('../config/database');

// Get recruiter profile
router.get('/profile', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query(
      'SELECT * FROM recruiter_profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profiles[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update recruiter profile
router.put('/profile', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const { 
      company_name, 
      company_description, 
      website,
      company_website,
      location,
      industry,
      company_size,
      founded_year,
      contact_email,
      contact_phone,
      linkedin_url,
      twitter_url,
      headquarters,
      employee_benefits,
      company_culture,
      company_logo 
    } = req.body;

    // Use website or company_website (frontend sends 'website', db stores 'company_website')
    const websiteUrl = website || company_website;

    await db.query(
      `UPDATE recruiter_profiles SET 
        company_name = ?, 
        company_website = ?, 
        company_description = ?, 
        location = ?, 
        industry = ?,
        company_size = ?,
        founded_year = ?,
        contact_email = ?,
        contact_phone = ?,
        linkedin_url = ?,
        twitter_url = ?,
        headquarters = ?,
        employee_benefits = ?,
        company_culture = ?,
        company_logo_url = ? 
      WHERE user_id = ?`,
      [
        company_name, 
        websiteUrl, 
        company_description, 
        location, 
        industry,
        company_size,
        founded_year,
        contact_email,
        contact_phone,
        linkedin_url,
        twitter_url,
        headquarters,
        employee_benefits,
        company_culture,
        company_logo, 
        req.user.id
      ]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload company logo
router.post('/company-logo', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, upload.single('companyLogo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'hireflow/company-logos',
          transformation: [{ width: 400, height: 400, crop: 'fill' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Update profile
    await db.query(
      'UPDATE recruiter_profiles SET company_logo_url = ? WHERE user_id = ?',
      [result.secure_url, req.user.id]
    );

    res.json({ message: 'Company logo uploaded successfully', url: result.secure_url });
  } catch (error) {
    console.error('Upload company logo error:', error);
    res.status(500).json({ error: 'Failed to upload company logo' });
  }
});

// Get recruiter stats for dashboard
router.get('/stats', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const recruiterId = profiles[0].id;

    // Get active job count
    const [jobCounts] = await db.query(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_jobs,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs
      FROM jobs 
      WHERE recruiter_id = ?
    `, [recruiterId]);

    // Get application counts by status
    const [applicationCounts] = await db.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN a.status = 'interviewed' THEN 1 ELSE 0 END) as interviewed,
        SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as hired
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = ?
    `, [recruiterId]);

    res.json({
      activeJobs: jobCounts[0].active_jobs || 0,
      totalApplications: applicationCounts[0].total_applications || 0,
      pendingReview: applicationCounts[0].pending_review || 0,
      shortlisted: applicationCounts[0].shortlisted || 0,
      interviewed: applicationCounts[0].interviewed || 0,
      hired: applicationCounts[0].hired || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all applications for recruiter (across all jobs)
router.get('/applications', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const recruiterId = profiles[0].id;

    const [applications] = await db.query(`
      SELECT 
        a.id as application_id, 
        a.job_id, 
        a.job_seeker_id, 
        a.cover_letter, 
        a.status, 
        a.applied_at, 
        a.updated_at,
        jsp.full_name,
        jsp.full_name as applicant_name, 
        jsp.phone, 
        jsp.location, 
        jsp.bio, 
        jsp.resume_url, 
        jsp.profile_image_url,
        u.email,
        j.title as job_title,
        j.id as job_id,
        GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.name)) as skills
      FROM applications a
      JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.id
      JOIN users u ON jsp.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN job_seeker_skills jss ON jsp.id = jss.job_seeker_id
      LEFT JOIN skills s ON jss.skill_id = s.id
      WHERE j.recruiter_id = ?
      GROUP BY a.id
      ORDER BY a.applied_at DESC
    `, [recruiterId]);

    // Parse skills
    applications.forEach(app => {
      if (app.skills) {
        app.skills = app.skills.split(',').map(skill => {
          const [id, name] = skill.split(':');
          return { id: parseInt(id), name };
        });
      } else {
        app.skills = [];
      }
    });

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get recruiter statistics (legacy endpoint)
router.get('/statistics', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const recruiterId = profiles[0].id;

    // Get job counts
    const [jobCounts] = await db.query(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_jobs,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs
      FROM jobs 
      WHERE recruiter_id = ?
    `, [recruiterId]);

    // Get application counts
    const [applicationCounts] = await db.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted_applications,
        SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as hired_count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = ?
    `, [recruiterId]);

    res.json({
      ...jobCounts[0],
      ...applicationCounts[0]
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
