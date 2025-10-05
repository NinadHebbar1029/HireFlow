const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database');

// Get all jobs (with filters)
router.get('/', async (req, res) => {
  try {
    const { search, location, job_type, skill_ids, salary_min, salary_max, page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT j.*, r.company_name, r.company_logo_url,
        GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.name)) as required_skills
      FROM jobs j
      JOIN recruiter_profiles r ON j.recruiter_id = r.id
      LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id
      LEFT JOIN skills s ON jrs.skill_id = s.id
      WHERE j.status = 'active'
    `;
    
    const params = [];

    if (search) {
      query += ` AND (j.title LIKE ? OR j.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      query += ` AND j.location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (job_type) {
      query += ` AND j.job_type = ?`;
      params.push(job_type);
    }

    if (salary_min) {
      query += ` AND j.salary_max >= ?`;
      params.push(salary_min);
    }

    if (salary_max) {
      query += ` AND j.salary_min <= ?`;
      params.push(salary_max);
    }

    query += ` GROUP BY j.id`;

    if (skill_ids) {
      const skillIdArray = skill_ids.split(',').map(id => parseInt(id));
      query += ` HAVING `;
      const skillConditions = skillIdArray.map(() => `FIND_IN_SET(?, required_skills) > 0`);
      query += skillConditions.join(' OR ');
      params.push(...skillIdArray);
    }

    query += ` ORDER BY j.created_at DESC LIMIT ? OFFSET ?`;
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    const [jobs] = await db.query(query, params);

    // Parse required_skills
    jobs.forEach(job => {
      if (job.required_skills) {
        job.required_skills = job.required_skills.split(',').map(skill => {
          const [id, name] = skill.split(':');
          return { id: parseInt(id), name };
        });
      } else {
        job.required_skills = [];
      }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Fetching job details for job ID: ${id}`);

    const [jobs] = await db.query(`
      SELECT j.*, r.company_name, r.company_website, r.company_description, r.company_logo_url, r.location as company_location,
        GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.name, ':', jrs.is_mandatory)) as required_skills
      FROM jobs j
      JOIN recruiter_profiles r ON j.recruiter_id = r.id
      LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id
      LEFT JOIN skills s ON jrs.skill_id = s.id
      WHERE j.id = ?
      GROUP BY j.id
    `, [id]);

    if (jobs.length === 0) {
      console.log(`Job not found with ID: ${id}`);
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobs[0];

    // Parse required_skills
    if (job.required_skills) {
      job.required_skills = job.required_skills.split(',').map(skill => {
        const [id, name, is_mandatory] = skill.split(':');
        return { id: parseInt(id), name, is_mandatory: is_mandatory === '1' };
      });
    } else {
      job.required_skills = [];
    }

    console.log(`Successfully fetched job: ${job.title}`);
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to fetch job', details: error.message });
  }
});

// Create job (recruiter only)
router.post('/', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const { title, description, requirements, location, job_type, salary_min, salary_max, required_skills } = req.body;

    if (!title || !description || !job_type) {
      return res.status(400).json({ error: 'Title, description, and job type are required' });
    }

    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }

    const recruiterId = profiles[0].id;

    // Convert job_type format: "full-time" -> "full_time"
    const dbJobType = job_type.replace(/-/g, '_');

    // Insert job
    const [result] = await db.query(
      'INSERT INTO jobs (recruiter_id, title, description, requirements, location, job_type, salary_min, salary_max) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [recruiterId, title, description, requirements, location, dbJobType, salary_min || null, salary_max || null]
    );

    const jobId = result.insertId;

    // Add required skills
    if (required_skills && Array.isArray(required_skills) && required_skills.length > 0) {
      for (const skill of required_skills) {
        await db.query(
          'INSERT INTO job_required_skills (job_id, skill_id, is_mandatory) VALUES (?, ?, ?)',
          [jobId, skill.skill_id, skill.is_mandatory ? 1 : 0]
        );
      }
    }

    res.status(201).json({ message: 'Job created successfully', jobId });
  } catch (error) {
    console.error('Create job error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
});

// Update job (recruiter only)
router.put('/:id', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, location, job_type, salary_min, salary_max, status, required_skills } = req.body;

    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }

    const recruiterId = profiles[0].id;

    // Check ownership and get current job data
    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?', [id, recruiterId]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found or you do not have permission to edit it' });
    }

    const currentJob = jobs[0];

    // Merge with existing data (only update provided fields)
    const updatedTitle = title !== undefined ? title : currentJob.title;
    const updatedDescription = description !== undefined ? description : currentJob.description;
    const updatedRequirements = requirements !== undefined ? requirements : currentJob.requirements;
    const updatedLocation = location !== undefined ? location : currentJob.location;
    const updatedJobType = job_type !== undefined ? job_type.replace(/-/g, '_') : currentJob.job_type;
    const updatedSalaryMin = salary_min !== undefined ? salary_min : currentJob.salary_min;
    const updatedSalaryMax = salary_max !== undefined ? salary_max : currentJob.salary_max;
    const updatedStatus = status !== undefined ? status : currentJob.status;

    // Update job
    await db.query(
      'UPDATE jobs SET title = ?, description = ?, requirements = ?, location = ?, job_type = ?, salary_min = ?, salary_max = ?, status = ? WHERE id = ?',
      [updatedTitle, updatedDescription, updatedRequirements, updatedLocation, updatedJobType, updatedSalaryMin, updatedSalaryMax, updatedStatus, id]
    );

    // Update required skills only if provided
    if (required_skills && Array.isArray(required_skills)) {
      // Delete existing skills
      await db.query('DELETE FROM job_required_skills WHERE job_id = ?', [id]);
      
      // Add new skills
      for (const skill of required_skills) {
        await db.query(
          'INSERT INTO job_required_skills (job_id, skill_id, is_mandatory) VALUES (?, ?, ?)',
          [id, skill.skill_id, skill.is_mandatory ? 1 : 0]
        );
      }
    }

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job (recruiter only)
router.delete('/:id', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const { id } = req.params;

    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }

    const recruiterId = profiles[0].id;

    // Check ownership
    const [jobs] = await db.query('SELECT id FROM jobs WHERE id = ? AND recruiter_id = ?', [id, recruiterId]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found or you do not have permission to delete it' });
    }

    await db.query('DELETE FROM jobs WHERE id = ?', [id]);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Get jobs posted by recruiter
router.get('/recruiter/my-jobs', authenticateToken, authorizeRoles('recruiter'), checkUserStatus, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }

    const recruiterId = profiles[0].id;

    const [jobs] = await db.query(`
      SELECT j.*,
        (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count,
        GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.name)) as required_skills
      FROM jobs j
      LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id
      LEFT JOIN skills s ON jrs.skill_id = s.id
      WHERE j.recruiter_id = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `, [recruiterId]);

    // Parse required_skills
    jobs.forEach(job => {
      if (job.required_skills) {
        job.required_skills = job.required_skills.split(',').map(skill => {
          const [id, name] = skill.split(':');
          return { id: parseInt(id), name };
        });
      } else {
        job.required_skills = [];
      }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router;
