const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, checkUserStatus } = require('../middleware/auth');
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');
const db = require('../config/database');
const axios = require('axios');

// Health check for AI service
router.get('/ai-status', authenticateToken, async (req, res) => {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8080';
  
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
    res.json({ 
      status: 'available', 
      service: response.data,
      url: AI_SERVICE_URL
    });
  } catch (error) {
    res.json({ 
      status: 'unavailable', 
      error: error.message,
      url: AI_SERVICE_URL,
      note: 'Using fallback skill-based matching'
    });
  }
});

// Debug endpoint - check recommendations data
router.get('/debug-recommendations', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.json({ error: 'Profile not found' });
    }

    const jobSeekerId = profiles[0].id;

    // Get user info
    const [users] = await db.query('SELECT email FROM users WHERE id = ?', [req.user.id]);

    // Get user skills
    const [userSkills] = await db.query(`
      SELECT s.id, s.name
      FROM job_seeker_skills jss
      JOIN skills s ON jss.skill_id = s.id
      WHERE jss.job_seeker_id = ?
    `, [jobSeekerId]);

    // Get total active jobs
    const [totalJobs] = await db.query(`
      SELECT COUNT(*) as total FROM jobs WHERE status = 'active'
    `);

    // Get jobs user has applied to
    const [appliedJobs] = await db.query(`
      SELECT COUNT(*) as total FROM applications WHERE job_seeker_id = ?
    `, [jobSeekerId]);

    // Get sample of active jobs with their required skills
    const [sampleJobs] = await db.query(`
      SELECT j.id, j.title, j.company_name,
        (SELECT GROUP_CONCAT(s.name) FROM job_required_skills jrs 
         JOIN skills s ON jrs.skill_id = s.id WHERE jrs.job_id = j.id) as required_skills
      FROM jobs j
      WHERE j.status = 'active'
      LIMIT 5
    `);

    // Get matching jobs
    let matchingJobs = [];
    if (userSkills.length > 0) {
      const skillIds = userSkills.map(s => s.id);
      const [matches] = await db.query(`
        SELECT j.id, j.title, 
          COUNT(DISTINCT jrs.skill_id) as matched_skills,
          (SELECT COUNT(*) FROM job_required_skills WHERE job_id = j.id) as total_required_skills,
          (SELECT GROUP_CONCAT(s.name) FROM job_required_skills jrs2 
           JOIN skills s ON jrs2.skill_id = s.id WHERE jrs2.job_id = j.id) as required_skills
        FROM jobs j
        JOIN job_required_skills jrs ON j.id = jrs.job_id
        WHERE j.status = 'active' 
          AND jrs.skill_id IN (${skillIds.join(',')})
          AND j.id NOT IN (SELECT job_id FROM applications WHERE job_seeker_id = ?)
        GROUP BY j.id
        ORDER BY matched_skills DESC
        LIMIT 10
      `, [jobSeekerId]);
      matchingJobs = matches;
    }

    res.json({
      user_email: users[0].email,
      user_skills: userSkills.map(s => s.name),
      user_skills_count: userSkills.length,
      total_active_jobs: totalJobs[0].total,
      jobs_applied_to: appliedJobs[0].total,
      sample_jobs: sampleJobs.map(j => ({
        id: j.id,
        title: j.title,
        required_skills: j.required_skills ? j.required_skills.split(',') : []
      })),
      matching_jobs: matchingJobs.map(j => ({
        id: j.id,
        title: j.title,
        matched: j.matched_skills,
        total: j.total_required_skills,
        match_percent: Math.round((j.matched_skills / j.total_required_skills) * 100),
        required_skills: j.required_skills ? j.required_skills.split(',') : []
      })),
      ai_service_url: process.env.AI_SERVICE_URL || 'http://localhost:8080'
    });
  } catch (error) {
    console.error('Debug recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get job seeker profile
router.get('/profile', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query(`
      SELECT p.*, GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.name, ':', jss.proficiency_level)) as skills
      FROM job_seeker_profiles p
      LEFT JOIN job_seeker_skills jss ON p.id = jss.job_seeker_id
      LEFT JOIN skills s ON jss.skill_id = s.id
      WHERE p.user_id = ?
      GROUP BY p.id
    `, [req.user.id]);

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profiles[0];
    
    // Parse skills
    if (profile.skills) {
      profile.skills = profile.skills.split(',').map(skill => {
        const [id, name, proficiency_level] = skill.split(':');
        return { id: parseInt(id), name, proficiency_level };
      });
    } else {
      profile.skills = [];
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update job seeker profile
router.put('/profile', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const { full_name, phone, location, bio } = req.body;

    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await db.query(
      'UPDATE job_seeker_profiles SET full_name = ?, phone = ?, location = ?, bio = ? WHERE user_id = ?',
      [full_name, phone, location, bio, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload resume
router.post('/resume', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, upload.single('resume'), async (req, res) => {
  try {
    console.log('Resume upload attempt - File received:', req.file ? req.file.originalname : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading to Cloudinary:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'hireflow/resumes',
          resource_type: 'raw',
          public_id: `resume_${req.user.id}_${Date.now()}`
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Update profile
    await db.query(
      'UPDATE job_seeker_profiles SET resume_url = ? WHERE user_id = ?',
      [result.secure_url, req.user.id]
    );

    console.log('Resume URL updated in database');
    res.json({ message: 'Resume uploaded successfully', resume_url: result.secure_url });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload resume' });
  }
});

// Upload profile image
router.post('/profile-image', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'hireflow/profile-images',
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
      'UPDATE job_seeker_profiles SET profile_image_url = ? WHERE user_id = ?',
      [result.secure_url, req.user.id]
    );

    res.json({ message: 'Profile image uploaded successfully', profile_image_url: result.secure_url });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Add skills
router.post('/skills', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const { skill_ids, proficiency_levels } = req.body;

    if (!Array.isArray(skill_ids) || skill_ids.length === 0) {
      return res.status(400).json({ error: 'Skills array is required' });
    }

    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const jobSeekerId = profiles[0].id;

    // Insert skills
    for (let i = 0; i < skill_ids.length; i++) {
      const skillId = skill_ids[i];
      const proficiencyLevel = proficiency_levels && proficiency_levels[i] ? proficiency_levels[i] : 'intermediate';
      
      await db.query(
        'INSERT INTO job_seeker_skills (job_seeker_id, skill_id, proficiency_level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE proficiency_level = ?',
        [jobSeekerId, skillId, proficiencyLevel, proficiencyLevel]
      );
    }

    res.json({ message: 'Skills added successfully' });
  } catch (error) {
    console.error('Add skills error:', error);
    res.status(500).json({ error: 'Failed to add skills' });
  }
});

// Remove skill
router.delete('/skills/:skillId', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const { skillId } = req.params;

    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await db.query(
      'DELETE FROM job_seeker_skills WHERE job_seeker_id = ? AND skill_id = ?',
      [profiles[0].id, skillId]
    );

    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({ error: 'Failed to remove skill' });
  }
});

// Get job recommendations (AI-powered)
router.get('/recommendations', authenticateToken, authorizeRoles('job_seeker'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const jobSeekerId = profiles[0].id;

    // Get user skills
    const [userSkills] = await db.query(`
      SELECT s.id, s.name
      FROM job_seeker_skills jss
      JOIN skills s ON jss.skill_id = s.id
      WHERE jss.job_seeker_id = ?
    `, [jobSeekerId]);

    console.log(`[Recommendations] User has ${userSkills.length} skills:`, userSkills.map(s => s.name));

    // Get all active jobs with details
    let query;
    let params;
    
    if (userSkills.length > 0) {
      const skillIds = userSkills.map(s => s.id);
      query = `
        SELECT DISTINCT j.id as job_id, j.*, r.company_name, r.company_logo_url,
          COUNT(DISTINCT jrs.skill_id) as matched_skills,
          (SELECT COUNT(*) FROM job_required_skills WHERE job_id = j.id) as total_required_skills,
          (SELECT GROUP_CONCAT(s.name) FROM job_required_skills jrs2 
           JOIN skills s ON jrs2.skill_id = s.id WHERE jrs2.job_id = j.id) as required_skills
        FROM jobs j
        JOIN recruiter_profiles r ON j.recruiter_id = r.id
        LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id AND jrs.skill_id IN (${skillIds.join(',')})
        WHERE j.status = 'active' 
          AND j.id NOT IN (SELECT job_id FROM applications WHERE job_seeker_id = ?)
        GROUP BY j.id
        ORDER BY matched_skills DESC, j.created_at DESC
        LIMIT 50
      `;
      params = [jobSeekerId];
    } else {
      // If no skills, just get recent active jobs
      query = `
        SELECT j.id as job_id, j.*, r.company_name, r.company_logo_url,
          0 as matched_skills,
          (SELECT COUNT(*) FROM job_required_skills WHERE job_id = j.id) as total_required_skills,
          (SELECT GROUP_CONCAT(s.name) FROM job_required_skills jrs 
           JOIN skills s ON jrs.skill_id = s.id WHERE jrs.job_id = j.id) as required_skills
        FROM jobs j
        JOIN recruiter_profiles r ON j.recruiter_id = r.id
        WHERE j.status = 'active'
        ORDER BY j.created_at DESC
        LIMIT 50
      `;
      params = [];
    }

    const [jobs] = await db.query(query, params);
    console.log(`[Recommendations] Found ${jobs.length} active jobs`);

    if (jobs.length === 0) {
      console.log('[Recommendations] No jobs available');
      return res.json([]);
    }

    // Add match percentage calculation
    const jobsWithPercentage = jobs.map(job => ({
      ...job,
      match_percentage: job.total_required_skills > 0 
        ? Math.round((job.matched_skills / job.total_required_skills) * 100)
        : 50
    }));

    // Try AI service for intelligent ranking
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8080';
    
    try {
      console.log('[Recommendations] Calling AI service at', AI_SERVICE_URL);
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/recommend`, {
        user_skills: userSkills.map(s => s.name),
        jobs: jobsWithPercentage.map(job => ({
          ...job,
          required_skills: job.required_skills ? job.required_skills.split(',') : []
        }))
      }, { 
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('[Recommendations] AI service responded successfully');
      const rankedJobs = aiResponse.data.recommendations || jobsWithPercentage;
      
      // Ensure match_percentage is set from AI score
      const finalJobs = rankedJobs.map(job => ({
        ...job,
        match_percentage: job.recommendation_score 
          ? Math.round(job.recommendation_score * 100)
          : (job.match_percentage || 50)
      }));
      
      return res.json(finalJobs.slice(0, 20));
    } catch (aiError) {
      console.warn('[Recommendations] AI service not available, using fallback:', aiError.message);
      // Fallback to basic skill matching with calculated percentages
      return res.json(jobsWithPercentage.slice(0, 20));
    }
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
