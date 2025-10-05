const express = require('express');
const router = express.Router();
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');
const db = require('../config/database');

// Enroll face
router.post('/enroll', authenticateToken, checkUserStatus, upload.single('faceImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Upload image to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'hireflow/face-recognition',
          transformation: [{ width: 640, height: 640, crop: 'fill' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Add face to CompreFace
    try {
      const compreFaceResponse = await axios.post(
        `${process.env.COMPREFACE_URL}/api/v1/recognition/faces`,
        {
          file: cloudinaryResult.secure_url,
          subject: `user_${req.user.id}`
        },
        {
          headers: {
            'x-api-key': process.env.COMPREFACE_API_KEY
          },
          timeout: 10000
        }
      );

      // Save face recognition ID
      await db.query(
        'UPDATE users SET face_recognition_id = ?, face_recognition_enabled = TRUE WHERE id = ?',
        [compreFaceResponse.data.image_id, req.user.id]
      );

      res.json({ 
        message: 'Face enrolled successfully',
        faceId: compreFaceResponse.data.image_id
      });
    } catch (compreFaceError) {
      console.error('CompreFace error:', compreFaceError.response?.data || compreFaceError.message);
      res.status(500).json({ error: 'Face recognition service error. Please try again.' });
    }
  } catch (error) {
    console.error('Enroll face error:', error);
    res.status(500).json({ error: 'Failed to enroll face' });
  }
});

// Verify face
router.post('/verify', upload.single('faceImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    if (!user.face_recognition_enabled || !user.face_recognition_id) {
      return res.status(400).json({ error: 'Face recognition not enabled for this user' });
    }

    // Upload temp image to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'hireflow/face-recognition/temp',
          transformation: [{ width: 640, height: 640, crop: 'fill' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Verify face with CompreFace
    try {
      const compreFaceResponse = await axios.post(
        `${process.env.COMPREFACE_URL}/api/v1/recognition/recognize`,
        {
          file: cloudinaryResult.secure_url
        },
        {
          headers: {
            'x-api-key': process.env.COMPREFACE_API_KEY
          },
          timeout: 10000
        }
      );

      const results = compreFaceResponse.data.result;
      
      if (results && results.length > 0) {
        const match = results.find(r => r.subject === `user_${user.id}`);
        
        if (match && match.similarity >= 0.85) {
          res.json({ 
            verified: true,
            similarity: match.similarity,
            userId: user.id
          });
        } else {
          res.json({ verified: false });
        }
      } else {
        res.json({ verified: false });
      }

      // Delete temp image from Cloudinary
      cloudinary.uploader.destroy(cloudinaryResult.public_id).catch(err => {
        console.error('Failed to delete temp image:', err);
      });
    } catch (compreFaceError) {
      console.error('CompreFace error:', compreFaceError.response?.data || compreFaceError.message);
      res.status(500).json({ error: 'Face recognition service error. Please try again.' });
    }
  } catch (error) {
    console.error('Verify face error:', error);
    res.status(500).json({ error: 'Failed to verify face' });
  }
});

// Disable face recognition
router.delete('/disable', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const [users] = await db.query('SELECT face_recognition_id FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const faceRecognitionId = users[0].face_recognition_id;

    // Delete from CompreFace if exists
    if (faceRecognitionId) {
      try {
        await axios.delete(
          `${process.env.COMPREFACE_URL}/api/v1/recognition/faces/${faceRecognitionId}`,
          {
            headers: {
              'x-api-key': process.env.COMPREFACE_API_KEY
            },
            timeout: 10000
          }
        );
      } catch (compreFaceError) {
        console.error('CompreFace delete error:', compreFaceError.response?.data || compreFaceError.message);
      }
    }

    // Update user
    await db.query(
      'UPDATE users SET face_recognition_enabled = FALSE, face_recognition_id = NULL WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Face recognition disabled successfully' });
  } catch (error) {
    console.error('Disable face recognition error:', error);
    res.status(500).json({ error: 'Failed to disable face recognition' });
  }
});

module.exports = router;
