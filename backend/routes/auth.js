const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Check if CNIC/B-Form exists
router.post('/check-cnic', async (req, res) => {
  try {
    const { cnicBform } = req.body;
    
    if (!cnicBform || cnicBform.length !== 13) {
      return res.status(400).json({ error: 'Invalid CNIC/B-Form number' });
    }

    const user = await User.findOne({ 
      where: { cnicBform } 
    });
    
    if (user) {
      return res.json({ 
        exists: true, 
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          category: user.category,
          region: user.region,
          location: user.location,
          class: user.class,
          booksReadCount: user.booksReadCount
        }
      });
    }
    
    res.json({ exists: false });
  } catch (error) {
    console.error('Check CNIC Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register new user
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { cnicBform, firstName, lastName, category, region, location, classLevel } = req.body;
    
    // Validate required fields
    if (!cnicBform || !firstName || !lastName || !category || !region || !location) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate CNIC format
    if (cnicBform.length !== 13) {
      return res.status(400).json({ error: 'CNIC/B-Form must be 13 digits' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { cnicBform } 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this CNIC/B-Form already exists' });
    }
    
    let profilePhotoUrl = null;
    
    // Process and save photo if uploaded
    if (req.file) {
      const fileName = `${cnicBform}-${Date.now()}.png`;
      const uploadDir = path.join(__dirname, '../uploads');
      const filePath = path.join(uploadDir, fileName);
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Process image with sharp
      await sharp(req.file.buffer)
        .resize(400, 400, { fit: 'cover' })
        .png()
        .toFile(filePath);
      
      profilePhotoUrl = `/uploads/${fileName}`;
    }
    
    // Create new user
    const newUser = await User.create({
      cnicBform,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      category,
      region,
      location,
      class: classLevel || 'N/A',
      profilePhotoUrl,
      booksReadCount: 0
    });
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: {
        id: newUser.id,
        cnicBform: newUser.cnicBform,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        category: newUser.category,
        region: newUser.region,
        location: newUser.location,
        class: newUser.class,
        profilePhotoUrl: newUser.profilePhotoUrl,
        booksReadCount: newUser.booksReadCount,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors.map(e => e.message) 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'User with this CNIC/B-Form already exists' });
    }
    
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { cnicBform } = req.body;
    
    if (!cnicBform || cnicBform.length !== 13) {
      return res.status(400).json({ error: 'Invalid CNIC/B-Form number' });
    }

    const user = await User.findOne({ 
      where: { cnicBform },
      attributes: ['id', 'cnicBform', 'firstName', 'lastName', 'category', 'region', 'location', 'class', 'profilePhotoUrl', 'booksReadCount', 'created_at']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }
    
    res.json({ 
      message: 'Login successful', 
      user: {
        id: user.id,
        cnicBform: user.cnicBform,
        firstName: user.firstName,
        lastName: user.lastName,
        category: user.category,
        region: user.region,
        location: user.location,
        class: user.class,
        profilePhotoUrl: user.profilePhotoUrl,
        booksReadCount: user.booksReadCount,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get user by ID
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'cnicBform', 'firstName', 'lastName', 'category', 'region', 'location', 'class', 'profilePhotoUrl', 'booksReadCount', 'created_at']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        cnicBform: user.cnicBform,
        firstName: user.firstName,
        lastName: user.lastName,
        category: user.category,
        region: user.region,
        location: user.location,
        class: user.class,
        profilePhotoUrl: user.profilePhotoUrl,
        booksReadCount: user.booksReadCount,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
