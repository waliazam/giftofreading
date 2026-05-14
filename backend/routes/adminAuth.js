const express = require('express');
const Admin = require('../models/Admin');
const { createAdminToken } = require('../utils/adminToken');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await Admin.findOne({
      where: { username, isActive: true }
    });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = createAdminToken(admin);
    return res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName || admin.username
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Admin login failed' });
  }
});

module.exports = router;
