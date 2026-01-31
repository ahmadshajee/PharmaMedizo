const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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
  toJSON: function() { return { ...this, toJSON: undefined }; }
};

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
    
    // DEMO MODE - use demo pharmacist
    if (!isMongoConnected() || !Pharmacist) {
      console.log('DEMO MODE: Using demo pharmacist for auth');
      req.pharmacist = { 
        ...demoPharmacist, 
        _id: decoded.id,
        toJSON: function() { 
          const obj = { ...this }; 
          delete obj.toJSON; 
          return obj; 
        }
      };
      req.pharmacistId = decoded.id;
      return next();
    }
    
    // Find pharmacist by ID
    const pharmacist = await Pharmacist.findById(decoded.id);
    
    if (!pharmacist) {
      return res.status(401).json({ message: 'Pharmacist not found' });
    }

    if (!pharmacist.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Attach pharmacist to request
    req.pharmacist = pharmacist;
    req.pharmacistId = pharmacist._id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth };
