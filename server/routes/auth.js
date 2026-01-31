const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const { auth } = require('../middleware/auth');

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Try to load the Pharmacist model
let Pharmacist;
try {
  Pharmacist = require('../models/Pharmacist');
} catch (e) {
  Pharmacist = null;
}

// Demo pharmacist for testing without MongoDB
const demoPharmacist = {
  _id: 'demo-pharmacist-001',
  name: 'Demo Pharmacist',
  email: 'demo@pharmacy.com',
  pharmacyName: 'Demo Pharmacy',
  licenseNumber: 'DEMO-12345',
  phone: '123-456-7890',
  address: '123 Demo Street',
  role: 'pharmacist',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Generate JWT Token
const generateToken = (pharmacistId) => {
  return jwt.sign(
    { id: pharmacistId },
    process.env.JWT_SECRET || 'demo-secret-key',
    { expiresIn: '24h' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new pharmacist
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, pharmacyName, licenseNumber, phone, address } = req.body;

    // Validation
    if (!name || !email || !password || !pharmacyName || !licenseNumber) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, password, pharmacyName, licenseNumber' 
      });
    }

    // Check if pharmacist already exists
    const existingPharmacist = await Pharmacist.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });
    
    if (existingPharmacist) {
      if (existingPharmacist.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingPharmacist.licenseNumber === licenseNumber) {
        return res.status(400).json({ message: 'License number already registered' });
      }
    }

    // Create new pharmacist
    const pharmacist = new Pharmacist({
      name,
      email,
      password,
      pharmacyName,
      licenseNumber,
      phone,
      address
    });

    await pharmacist.save();

    // Generate token
    const token = generateToken(pharmacist._id);

    res.status(201).json({
      message: 'Pharmacist registered successfully',
      pharmacist: pharmacist.toJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate pharmacist & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // DEMO MODE - accept demo credentials
    if (!isMongoConnected() || !Pharmacist) {
      console.log('DEMO MODE: Using demo pharmacist login');
      
      // Accept any email/password in demo mode, or use demo credentials
      if (email === 'demo@pharmacy.com' && password === 'demo123') {
        const token = generateToken(demoPharmacist._id);
        return res.json({
          message: 'DEMO MODE: Login successful',
          pharmacist: demoPharmacist,
          token
        });
      }
      
      // For any other credentials in demo mode
      const customDemoPharmacist = {
        ...demoPharmacist,
        _id: 'custom-pharmacist-' + Date.now(),
        email: email,
        name: email.split('@')[0]
      };
      const token = generateToken(customDemoPharmacist._id);
      return res.json({
        message: 'DEMO MODE: Login successful',
        pharmacist: customDemoPharmacist,
        token
      });
    }

    // Find pharmacist by email
    const pharmacist = await Pharmacist.findOne({ email });
    
    if (!pharmacist) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!pharmacist.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Verify password
    const isMatch = await pharmacist.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(pharmacist._id);

    res.json({
      message: 'Login successful',
      pharmacist: pharmacist.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current pharmacist profile
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ pharmacist: req.pharmacist.toJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update pharmacist profile
 * @access  Private
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, pharmacyName, phone, address } = req.body;
    
    const pharmacist = await Pharmacist.findById(req.pharmacistId);
    
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    // Update fields
    if (name) pharmacist.name = name;
    if (pharmacyName) pharmacist.pharmacyName = pharmacyName;
    if (phone) pharmacist.phone = phone;
    if (address) pharmacist.address = address;

    await pharmacist.save();

    res.json({
      message: 'Profile updated successfully',
      pharmacist: pharmacist.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate pharmacist with Google OAuth
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // DEMO MODE - if no Google Client ID is set
    if (!process.env.GOOGLE_CLIENT_ID || !isMongoConnected() || !Pharmacist) {
      console.log('DEMO MODE: Google auth with demo pharmacist');
      
      // Parse the credential as a simple token or use demo data
      const demoGooglePharmacist = {
        ...demoPharmacist,
        _id: 'google-demo-' + Date.now(),
        name: 'Google Demo User',
        email: 'googledemo@pharmacy.com',
        authProvider: 'google'
      };
      
      const token = generateToken(demoGooglePharmacist._id);
      return res.json({
        message: 'DEMO MODE: Google login successful',
        pharmacist: demoGooglePharmacist,
        token,
        isNewUser: false
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if pharmacist exists with this email
    let pharmacist = await Pharmacist.findOne({ email });

    if (pharmacist) {
      // Update Google ID if not set
      if (!pharmacist.googleId) {
        pharmacist.googleId = googleId;
        pharmacist.authProvider = 'google';
        await pharmacist.save();
      }

      const token = generateToken(pharmacist._id);
      return res.json({
        message: 'Google login successful',
        pharmacist: pharmacist.toJSON(),
        token,
        isNewUser: false
      });
    }

    // Create new pharmacist with Google account
    // They'll need to complete their profile (pharmacy name, license number)
    pharmacist = new Pharmacist({
      name,
      email,
      googleId,
      authProvider: 'google',
      profilePicture: picture,
      // Set placeholder values - user needs to complete registration
      pharmacyName: 'Pending Setup',
      licenseNumber: 'PENDING-' + Date.now(),
      isProfileComplete: false
    });

    await pharmacist.save();

    const token = generateToken(pharmacist._id);

    res.status(201).json({
      message: 'Google registration successful. Please complete your profile.',
      pharmacist: pharmacist.toJSON(),
      token,
      isNewUser: true,
      requiresProfileCompletion: true
    });
  } catch (error) {
    console.error('Google auth error:', error);
    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ message: 'Invalid or expired Google token' });
    }
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

module.exports = router;
