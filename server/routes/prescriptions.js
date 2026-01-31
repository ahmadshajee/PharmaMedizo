const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Mock prescription data for demo mode - Using valid MongoDB ObjectId format
const demoPrescriptions = {
  // Prescription 1 - Thyroid patient
  '507f1f77bcf86cd799439011': {
    _id: '507f1f77bcf86cd799439011',
    doctorId: '694b8fd382b8ac9759e49e54',
    patientId: '694b8fd382b8ac9759e49e57',
    patientName: 'Sarah Ahmed',
    patientEmail: 'sarah.ahmed@test.com',
    patientAge: 35,
    patientGender: 'Female',
    doctorName: 'Dr. Ali Hassan',
    doctorSpecialization: 'Endocrinologist',
    hospitalName: 'City Medical Center',
    diagnosis: 'Hypothyroidism',
    medications: [
      { name: 'Levothyroxine 50mcg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take on empty stomach, 30 min before breakfast' },
      { name: 'Vitamin D3 1000IU', dosage: '1 capsule', frequency: 'Once daily', duration: '30 days', instructions: 'Take with food' }
    ],
    instructions: 'Regular thyroid function tests every 3 months. Avoid soy products near medication time.',
    followUpDate: '2026-02-26',
    status: 'active',
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-01-20T09:00:00.000Z'
  },

  // Prescription 2 - Diabetes patient
  '507f1f77bcf86cd799439012': {
    _id: '507f1f77bcf86cd799439012',
    doctorId: '694b8fd382b8ac9759e49e55',
    patientId: '694b8fd382b8ac9759e49e58',
    patientName: 'Mohammad Khan',
    patientEmail: 'mohammad.khan@test.com',
    patientAge: 52,
    patientGender: 'Male',
    doctorName: 'Dr. Fatima Zahra',
    doctorSpecialization: 'Diabetologist',
    hospitalName: 'National Hospital',
    diagnosis: 'Type 2 Diabetes Mellitus',
    medications: [
      { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with meals' },
      { name: 'Glimepiride 2mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take before breakfast' },
      { name: 'Atorvastatin 10mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime' }
    ],
    instructions: 'Monitor blood sugar levels daily. Follow diabetic diet. Regular exercise recommended.',
    followUpDate: '2026-02-15',
    status: 'active',
    createdAt: '2026-01-18T14:30:00.000Z',
    updatedAt: '2026-01-18T14:30:00.000Z'
  },

  // Prescription 3 - Hypertension patient
  '507f1f77bcf86cd799439013': {
    _id: '507f1f77bcf86cd799439013',
    doctorId: '694b8fd382b8ac9759e49e56',
    patientId: '694b8fd382b8ac9759e49e59',
    patientName: 'Aisha Begum',
    patientEmail: 'aisha.begum@test.com',
    patientAge: 48,
    patientGender: 'Female',
    doctorName: 'Dr. Ahmed Raza',
    doctorSpecialization: 'Cardiologist',
    hospitalName: 'Heart Care Institute',
    diagnosis: 'Essential Hypertension',
    medications: [
      { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning' },
      { name: 'Losartan 50mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take with or without food' },
      { name: 'Aspirin 75mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take after lunch' }
    ],
    instructions: 'Monitor BP twice daily. Reduce salt intake. Avoid stress.',
    followUpDate: '2026-02-20',
    status: 'active',
    createdAt: '2026-01-22T11:15:00.000Z',
    updatedAt: '2026-01-22T11:15:00.000Z'
  },

  // Prescription 4 - Infection (Antibiotics)
  '507f1f77bcf86cd799439014': {
    _id: '507f1f77bcf86cd799439014',
    doctorId: '694b8fd382b8ac9759e49e57',
    patientId: '694b8fd382b8ac9759e49e60',
    patientName: 'Zain Ali',
    patientEmail: 'zain.ali@test.com',
    patientAge: 28,
    patientGender: 'Male',
    doctorName: 'Dr. Sana Malik',
    doctorSpecialization: 'General Physician',
    hospitalName: 'Community Health Clinic',
    diagnosis: 'Upper Respiratory Tract Infection',
    medications: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Three times daily', duration: '7 days', instructions: 'Take every 8 hours' },
      { name: 'Paracetamol 500mg', dosage: '1-2 tablets', frequency: 'As needed', duration: '5 days', instructions: 'Take for fever/pain, max 4 times daily' },
      { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days', instructions: 'Take at bedtime' }
    ],
    instructions: 'Complete full course of antibiotics. Rest and drink plenty of fluids.',
    followUpDate: '2026-02-03',
    status: 'active',
    createdAt: '2026-01-25T16:45:00.000Z',
    updatedAt: '2026-01-25T16:45:00.000Z'
  },

  // Prescription 5 - Already dispensed (for testing)
  '507f1f77bcf86cd799439015': {
    _id: '507f1f77bcf86cd799439015',
    doctorId: '694b8fd382b8ac9759e49e58',
    patientId: '694b8fd382b8ac9759e49e61',
    patientName: 'Hira Nawaz',
    patientEmail: 'hira.nawaz@test.com',
    patientAge: 32,
    patientGender: 'Female',
    doctorName: 'Dr. Imran Sheikh',
    doctorSpecialization: 'General Physician',
    hospitalName: 'Family Medical Center',
    diagnosis: 'Migraine',
    medications: [
      { name: 'Sumatriptan 50mg', dosage: '1 tablet', frequency: 'As needed', duration: '10 days', instructions: 'Take at onset of migraine' },
      { name: 'Propranolol 40mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with food' }
    ],
    instructions: 'Avoid triggers like bright lights and loud sounds. Maintain regular sleep schedule.',
    followUpDate: '2026-02-10',
    status: 'dispensed',
    pharmacistId: 'demo-pharmacist-001',
    pharmacistName: 'Demo Pharmacist',
    pharmacyName: 'Demo Pharmacy',
    validatedAt: '2026-01-24T10:30:00.000Z',
    medicineStatuses: [
      { medicineName: 'Sumatriptan 50mg', status: 'given' },
      { medicineName: 'Propranolol 40mg', status: 'given' }
    ],
    createdAt: '2026-01-15T08:20:00.000Z',
    updatedAt: '2026-01-24T10:30:00.000Z'
  },

  // Prescription 6 - Pain Management
  '507f1f77bcf86cd799439016': {
    _id: '507f1f77bcf86cd799439016',
    doctorId: '694b8fd382b8ac9759e49e59',
    patientId: '694b8fd382b8ac9759e49e62',
    patientName: 'Bilal Ahmad',
    patientEmail: 'bilal.ahmad@test.com',
    patientAge: 45,
    patientGender: 'Male',
    doctorName: 'Dr. Nadia Hussain',
    doctorSpecialization: 'Orthopedic Surgeon',
    hospitalName: 'Bone & Joint Hospital',
    diagnosis: 'Lumbar Spondylosis',
    medications: [
      { name: 'Diclofenac 50mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '14 days', instructions: 'Take after meals' },
      { name: 'Omeprazole 20mg', dosage: '1 capsule', frequency: 'Once daily', duration: '14 days', instructions: 'Take before breakfast' },
      { name: 'Thiamine 100mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take with food' },
      { name: 'Calcium + Vitamin D', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take after dinner' }
    ],
    instructions: 'Avoid heavy lifting. Do prescribed physiotherapy exercises. Use lumbar support belt.',
    followUpDate: '2026-02-17',
    status: 'active',
    createdAt: '2026-01-23T13:00:00.000Z',
    updatedAt: '2026-01-23T13:00:00.000Z'
  }
};

// Helper to get demo prescription by ID
const getDemoPrescription = (id) => {
  // Check if exact match exists
  if (demoPrescriptions[id]) {
    return { ...demoPrescriptions[id] };
  }
  // For any valid ObjectId format, return a default prescription
  if (mongoose.Types.ObjectId.isValid(id)) {
    return {
      _id: id,
      doctorId: '694b8fd382b8ac9759e49e54',
      patientId: '694b8fd382b8ac9759e49e57',
      patientName: 'Demo Patient',
      patientEmail: 'patient@demo.com',
      patientAge: 30,
      patientGender: 'Male',
      doctorName: 'Dr. Demo Doctor',
      doctorSpecialization: 'General Physician',
      hospitalName: 'Demo Hospital',
      diagnosis: 'General Checkup',
      medications: [
        { name: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take with breakfast' },
        { name: 'Vitamin C 500mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take with food' }
      ],
      instructions: 'Maintain healthy diet and regular exercise.',
      followUpDate: '2026-02-27',
      status: 'active',
      createdAt: '2026-01-27T10:00:00.000Z',
      updatedAt: '2026-01-27T10:00:00.000Z'
    };
  }
  return null;
};

// Try to load the Prescription model
let Prescription;
try {
  Prescription = require('../models/Prescription');
} catch (e) {
  Prescription = null;
}

/**
 * @route   GET /api/prescriptions/validate/:id
 * @desc    Validate and get prescription by ID (from QR code scan)
 * @access  Private (Pharmacist only)
 */
router.get('/validate/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    let prescription;

    // If MongoDB is connected, use real data
    if (isMongoConnected() && Prescription) {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          valid: false,
          message: 'Invalid prescription ID format' 
        });
      }

      prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(404).json({ 
          valid: false,
          message: 'Prescription not found in database' 
        });
      }
    } else {
      // DEMO MODE - use mock data
      console.log('DEMO MODE: Using mock prescription data for ID:', id);
      prescription = getDemoPrescription(id);
    }

    // Check prescription status
    if (prescription.status === 'cancelled') {
      return res.status(400).json({ 
        valid: false,
        message: 'This prescription has been cancelled',
        prescription
      });
    }

    if (prescription.status === 'dispensed') {
      return res.status(400).json({ 
        valid: false,
        message: 'This prescription has already been fully dispensed',
        prescription,
        dispensedBy: {
          pharmacistId: prescription.pharmacistId,
          pharmacistName: prescription.pharmacistName,
          pharmacyName: prescription.pharmacyName,
          dispensedAt: prescription.validatedAt
        }
      });
    }

    // Initialize medicine statuses if not present
    let medicineStatuses = prescription.medicineStatuses || [];
    
    // Build medicine list from medications array or single medication
    const medicines = [];
    
    if (prescription.medications && prescription.medications.length > 0) {
      prescription.medications.forEach(med => {
        medicines.push({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions
        });
      });
    } else if (prescription.medication) {
      medicines.push({
        name: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions
      });
    }

    // Sync medicine statuses with current medicines
    if (medicineStatuses.length !== medicines.length) {
      medicineStatuses = medicines.map(med => ({
        medicineName: med.name,
        status: 'pending',
        updatedAt: new Date()
      }));
    }

    res.json({
      valid: true,
      message: 'Prescription found and valid',
      prescription: {
        _id: prescription._id,
        diagnosis: prescription.diagnosis,
        instructions: prescription.instructions,
        notes: prescription.notes,
        followUpDate: prescription.followUpDate,
        status: prescription.status,
        createdAt: prescription.createdAt,
        patientEmail: prescription.patientEmail
      },
      medicines: medicines,
      medicineStatuses: medicineStatuses,
      previousDispensing: prescription.pharmacistId ? {
        pharmacistId: prescription.pharmacistId,
        pharmacistName: prescription.pharmacistName,
        pharmacyName: prescription.pharmacyName,
        validatedAt: prescription.validatedAt
      } : null
    });
  } catch (error) {
    console.error('Prescription validation error:', error);
    res.status(500).json({ 
      valid: false,
      message: 'Server error during validation' 
    });
  }
});

/**
 * @route   POST /api/prescriptions/dispense/:id
 * @desc    Update prescription with dispensing information
 * @access  Private (Pharmacist only)
 */
router.post('/dispense/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { medicineStatuses, dispensingNotes } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid prescription ID format' });
    }

    // Validate medicine statuses
    if (!medicineStatuses || !Array.isArray(medicineStatuses)) {
      return res.status(400).json({ message: 'Medicine statuses are required' });
    }

    // Validate each status is one of allowed values
    const validStatuses = ['pending', 'given', 'not_available', 'not_needed'];
    for (const status of medicineStatuses) {
      if (!status.medicineName || !status.status) {
        return res.status(400).json({ message: 'Each medicine must have a name and status' });
      }
      if (!validStatuses.includes(status.status)) {
        return res.status(400).json({ 
          message: `Invalid status "${status.status}". Must be one of: ${validStatuses.join(', ')}` 
        });
      }
    }

    // Find prescription
    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot dispense a cancelled prescription' });
    }

    // Determine new prescription status based on medicine statuses
    const allGiven = medicineStatuses.every(s => s.status === 'given');
    const someGiven = medicineStatuses.some(s => s.status === 'given');
    const allNotNeeded = medicineStatuses.every(s => s.status === 'not_needed');

    let newStatus = prescription.status;
    if (allGiven || allNotNeeded) {
      newStatus = 'dispensed';
    } else if (someGiven) {
      newStatus = 'partially_dispensed';
    }

    // Update prescription with pharmacist info and medicine statuses
    prescription.pharmacistId = req.pharmacist._id;
    prescription.pharmacistName = req.pharmacist.name;
    prescription.pharmacyName = req.pharmacist.pharmacyName;
    prescription.validatedAt = new Date();
    prescription.medicineStatuses = medicineStatuses.map(s => ({
      medicineName: s.medicineName,
      status: s.status,
      updatedAt: new Date()
    }));
    prescription.status = newStatus;
    if (dispensingNotes) {
      prescription.dispensingNotes = dispensingNotes;
    }

    await prescription.save();

    res.json({
      message: 'Prescription dispensing recorded successfully',
      prescription: prescription.toObject(),
      dispensedBy: {
        pharmacistId: req.pharmacist._id,
        pharmacistName: req.pharmacist.name,
        pharmacyName: req.pharmacist.pharmacyName,
        validatedAt: prescription.validatedAt
      }
    });
  } catch (error) {
    console.error('Dispensing error:', error);
    res.status(500).json({ message: 'Server error during dispensing' });
  }
});

/**
 * @route   GET /api/prescriptions/history
 * @desc    Get dispensing history for logged-in pharmacist
 * @access  Private (Pharmacist only)
 */
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { pharmacistId: req.pharmacist._id };
    
    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .sort({ validatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

/**
 * @route   GET /api/prescriptions/stats
 * @desc    Get dispensing statistics for logged-in pharmacist
 * @access  Private (Pharmacist only)
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDispensed = await Prescription.countDocuments({ 
      pharmacistId: req.pharmacist._id 
    });

    const todayDispensed = await Prescription.countDocuments({ 
      pharmacistId: req.pharmacist._id,
      validatedAt: { $gte: today }
    });

    const partiallyDispensed = await Prescription.countDocuments({ 
      pharmacistId: req.pharmacist._id,
      status: 'partially_dispensed'
    });

    res.json({
      totalDispensed,
      todayDispensed,
      partiallyDispensed
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;
