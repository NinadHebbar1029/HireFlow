const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all skills
router.get('/', async (req, res) => {
  try {
    const [skills] = await db.query('SELECT * FROM skills ORDER BY name ASC');
    res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Search skills
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const [skills] = await db.query(
      'SELECT * FROM skills WHERE name LIKE ? ORDER BY name ASC LIMIT 20',
      [`%${query}%`]
    );

    res.json(skills);
  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({ error: 'Failed to search skills' });
  }
});

// Create skill
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    // Check if skill already exists
    const [existing] = await db.query('SELECT id FROM skills WHERE name = ?', [name]);
    
    if (existing.length > 0) {
      return res.json({ skillId: existing[0].id, exists: true });
    }

    const [result] = await db.query('INSERT INTO skills (name) VALUES (?)', [name]);

    res.status(201).json({ skillId: result.insertId, exists: false });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

module.exports = router;
