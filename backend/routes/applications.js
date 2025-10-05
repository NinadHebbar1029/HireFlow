const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database');

// Apply for a job
router.post('/', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const { job_id, cover_letter } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' });
    }

    const jobSeekerId = profiles[0].id;

    // Check if job exists and is active
    const [jobs] = await db.query('SELECT id, recruiter_id FROM jobs WHERE id = ? AND status = ?', [job_id, 'active']);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found or not active' });
    }

    // Check if already applied
    const [existing] = await db.query('SELECT id FROM applications WHERE job_id = ? AND job_seeker_id = ?', [job_id, jobSeekerId]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Get job required skills
    const [requiredSkills] = await db.query(`
      SELECT skill_id, is_mandatory
      FROM job_required_skills
      WHERE job_id = ? AND is_mandatory = TRUE
    `, [job_id]);

    // Get user skills
    const [userSkills] = await db.query('SELECT skill_id FROM job_seeker_skills WHERE job_seeker_id = ?', [jobSeekerId]);
    const userSkillIds = userSkills.map(s => s.skill_id);

    // Check if user has all mandatory skills
    const mandatorySkills = requiredSkills.filter(s => s.is_mandatory);
    const missingSkills = mandatorySkills.filter(s => !userSkillIds.includes(s.skill_id));

    if (missingSkills.length > 0) {
      return res.status(400).json({ error: 'You do not meet the required skills for this job' });
    }

    // Create application
    const [result] = await db.query(
      'INSERT INTO applications (job_id, job_seeker_id, cover_letter) VALUES (?, ?, ?)',
      [job_id, jobSeekerId, cover_letter]
    );

    // Create notification for recruiter
    const [recruiterProfile] = await db.query('SELECT user_id FROM recruiter_profiles WHERE id = ?', [jobs[0].recruiter_id]);
    
    if (recruiterProfile.length > 0) {
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
        [
          recruiterProfile[0].user_id,
          'new_application',
          'New Application Received',
          'You have received a new application for your job posting',
          `/applications/${result.insertId}`
        ]
      );
    }

    res.status(201).json({ message: 'Application submitted successfully', applicationId: result.insertId });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get job seeker's applications
router.get('/my-applications', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' });
    }

    const jobSeekerId = profiles[0].id;

    const [applications] = await db.query(`
      SELECT a.*, j.title, j.location, j.job_type, r.company_name, r.company_logo_url
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN recruiter_profiles r ON j.recruiter_id = r.id
      WHERE a.job_seeker_id = ?
      ORDER BY a.applied_at DESC
    `, [jobSeekerId]);

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get applications for a job (recruiter only)
router.get('/job/:jobId', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const { jobId } = req.params;

    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }

    const recruiterId = profiles[0].id;

    // Check ownership
    const [jobs] = await db.query('SELECT id FROM jobs WHERE id = ? AND recruiter_id = ?', [jobId, recruiterId]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found or you do not have permission to view it' });
    }

    const [applications] = await db.query(`
      SELECT a.*, jsp.full_name, jsp.phone, jsp.location, jsp.bio, jsp.resume_url, jsp.profile_image_url,
        u.email,
        GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.name)) as skills
      FROM applications a
      JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.id
      JOIN users u ON jsp.user_id = u.id
      LEFT JOIN job_seeker_skills jss ON jsp.id = jss.job_seeker_id
      LEFT JOIN skills s ON jss.skill_id = s.id
      WHERE a.job_id = ?
      GROUP BY a.id
      ORDER BY a.applied_at DESC
    `, [jobId]);

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
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status (recruiter only)
router.put('/:id/status', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'shortlisted', 'rejected', 'interviewed', 'hired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }

    const recruiterId = profiles[0].id;

    // Check ownership
    const [applications] = await db.query(`
      SELECT a.id, a.job_seeker_id, jsp.user_id as job_seeker_user_id
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.id
      WHERE a.id = ? AND j.recruiter_id = ?
    `, [id, recruiterId]);
    
    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found or you do not have permission to update it' });
    }

    await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

    // Create notification for job seeker
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
      [
        applications[0].job_seeker_user_id,
        'application_status_update',
        'Application Status Updated',
        `Your application status has been updated to: ${status}`,
        `/applications/${id}`
      ]
    );

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Get application details
router.get('/:id', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await db.query(`
      SELECT a.*, j.title, j.description, j.location, j.job_type, j.salary_min, j.salary_max,
        r.company_name, r.company_logo_url,
        jsp.full_name, jsp.phone, jsp.resume_url,
        u.email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN recruiter_profiles r ON j.recruiter_id = r.id
      JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.id
      JOIN users u ON jsp.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(applications[0]);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Save/bookmark job
router.post('/save-job', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' });
    }

    const jobSeekerId = profiles[0].id;

    // Check if job exists
    const [jobs] = await db.query('SELECT id FROM jobs WHERE id = ?', [job_id]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Save job
    await db.query(
      'INSERT INTO saved_jobs (job_seeker_id, job_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE saved_at = CURRENT_TIMESTAMP',
      [jobSeekerId, job_id]
    );

    res.json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// Get saved jobs
router.get('/saved/my-saved-jobs', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' });
    }

    const jobSeekerId = profiles[0].id;

    const [savedJobs] = await db.query(`
      SELECT j.*, r.company_name, r.company_logo_url, sj.saved_at,
        GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.name)) as required_skills
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN recruiter_profiles r ON j.recruiter_id = r.id
      LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id
      LEFT JOIN skills s ON jrs.skill_id = s.id
      WHERE sj.job_seeker_id = ?
      GROUP BY j.id
      ORDER BY sj.saved_at DESC
    `, [jobSeekerId]);

    // Parse required_skills
    savedJobs.forEach(job => {
      if (job.required_skills) {
        job.required_skills = job.required_skills.split(',').map(skill => {
          const [id, name] = skill.split(':');
          return { id: parseInt(id), name };
        });
      } else {
        job.required_skills = [];
      }
    });

    res.json(savedJobs);
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// Unsave/unbookmark job
router.delete('/saved/:jobId', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const { jobId } = req.params;

    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' });
    }

    const jobSeekerId = profiles[0].id;

    await db.query('DELETE FROM saved_jobs WHERE job_seeker_id = ? AND job_id = ?', [jobSeekerId, jobId]);

    res.json({ message: 'Job unsaved successfully' });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({ error: 'Failed to unsave job' });
  }
});

module.exports = router;
