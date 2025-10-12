const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, checkUserStatus } = require('../middleware/auth');
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');
const db = require('../config/database');
const axios = require('axios');

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

    if (userSkills.length === 0) {
      return res.json([]);
    }

    const skillIds = userSkills.map(s => s.id);

    const [jobs] = await db.query(`
      SELECT DISTINCT j.*, r.company_name, r.company_logo_url,
        COUNT(DISTINCT jrs.skill_id) as matched_skills,
        (SELECT COUNT(*) FROM job_required_skills WHERE job_id = j.id) as total_required_skills
      FROM jobs j
      JOIN recruiter_profiles r ON j.recruiter_id = r.id
      JOIN job_required_skills jrs ON j.id = jrs.job_id
      WHERE j.status = 'active' 
        AND jrs.skill_id IN (${skillIds.join(',')})
        AND j.id NOT IN (SELECT job_id FROM applications WHERE job_seeker_id = ?)
      GROUP BY j.id
      ORDER BY matched_skills DESC, j.created_at DESC
      LIMIT 20
    `, [jobSeekerId]);

    // Call AI service for personalized ranking (if available)
    if (process.env.AI_SERVICE_URL) {
      try {
        const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/recommend`, {
          user_skills: userSkills.map(s => s.name),
          jobs: jobs
        }, { timeout: 5000 });

        return res.json(aiResponse.data.recommendations || jobs);
      } catch (aiError) {
        console.error('AI service error:', aiError.message);
        // Fallback to regular skill matching
      }
    }
    
    // Return skill-matched jobs (either as fallback or when AI service is not configured)
    res.json(jobs);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
