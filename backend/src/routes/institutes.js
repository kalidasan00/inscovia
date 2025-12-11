// backend/routes/institutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Institute = require('../models/Institute');
const Center = require('../models/Center');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET Institute Data with Center
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find institute
    const institute = await Institute.findOne({ userId });

    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    // Find center (may not exist yet)
    const center = await Center.findOne({ instituteId: institute._id });

    // Prepare response
    const response = {
      user: {
        id: institute.userId,
        instituteName: institute.instituteName,
        email: institute.email,
        phone: institute.phone,
        city: institute.city,
        district: institute.district,
        state: institute.state,
        type: institute.type,
        isVerified: institute.isVerified,
        createdAt: institute.createdAt
      },
      center: center ? {
        id: center._id,
        description: center.description,
        address: center.address,
        website: center.website,
        established: center.established,
        logo: center.logo,
        image: center.image,
        courses: center.courses || [],
        gallery: center.gallery || [],
        rating: center.rating,
        isPublished: center.isPublished
      } : null
    };

    res.json(response);

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      message: 'Failed to fetch data',
      error: error.message
    });
  }
});

// UPDATE Institute Profile
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      instituteName,
      email,
      phone,
      city,
      district,
      state,
      type,
      description,
      address,
      website,
      established,
      logo,
      coverImage
    } = req.body;

    // Validate required fields
    if (!instituteName || !email || !phone || !city || !state) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate phone format (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: 'Invalid phone number. Must be 10 digits starting with 6-9'
      });
    }

    // Find institute
    const institute = await Institute.findOne({ userId });

    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    // Check if email is already taken by another institute
    if (email !== institute.email) {
      const existingInstitute = await Institute.findOne({
        email,
        _id: { $ne: institute._id }
      });

      if (existingInstitute) {
        return res.status(400).json({
          message: 'Email already registered with another institute'
        });
      }
    }

    // Update institute data
    institute.instituteName = instituteName;
    institute.email = email;
    institute.phone = phone;
    institute.city = city;
    institute.district = district || '';
    institute.state = state;
    institute.type = type || '';

    await institute.save();

    // Find or create center profile
    let center = await Center.findOne({ instituteId: institute._id });

    if (!center) {
      center = new Center({
        instituteId: institute._id,
        name: instituteName,
        city,
        district: district || '',
        state,
      });
    }

    // Update center data
    center.name = instituteName;
    center.city = city;
    center.district = district || '';
    center.state = state;

    if (description !== undefined) center.description = description;
    if (address !== undefined) center.address = address;
    if (website !== undefined) center.website = website;
    if (established !== undefined) center.established = established;
    if (logo !== undefined) center.logo = logo;
    if (coverImage !== undefined) center.image = coverImage;

    await center.save();

    // Prepare response
    const response = {
      user: {
        id: institute.userId,
        instituteName: institute.instituteName,
        email: institute.email,
        phone: institute.phone,
        city: institute.city,
        district: institute.district,
        state: institute.state,
        type: institute.type
      },
      center: {
        id: center._id,
        description: center.description,
        address: center.address,
        website: center.website,
        established: center.established,
        logo: center.logo,
        image: center.image,
        courses: center.courses || [],
        gallery: center.gallery || [],
        rating: center.rating,
        isPublished: center.isPublished
      }
    };

    res.json({
      message: 'Profile updated successfully',
      data: response
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// GET Public Center Profile (for viewing)
router.get('/center/:id', async (req, res) => {
  try {
    const center = await Center.findById(req.params.id)
      .populate('instituteId', 'instituteName email phone');

    if (!center || !center.isPublished) {
      return res.status(404).json({ message: 'Center not found' });
    }

    res.json(center);
  } catch (error) {
    console.error('Fetch center error:', error);
    res.status(500).json({
      message: 'Failed to fetch center',
      error: error.message
    });
  }
});

module.exports = router;