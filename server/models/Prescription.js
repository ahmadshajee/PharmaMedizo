const mongoose = require('mongoose');

// Medicine status within a prescription
const medicineStatusSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'given', 'not_available', 'not_needed'],
    default: 'pending'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Schema for prescription (matches the main Medizo prescription schema)
// This is used to query prescriptions from the shared database
const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientEmail: {
    type: String
  },
  diagnosis: {
    type: String
  },
  medication: {
    type: String
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  dosage: {
    type: String
  },
  frequency: {
    type: String
  },
  duration: {
    type: String
  },
  instructions: {
    type: String
  },
  notes: {
    type: String
  },
  followUpDate: {
    type: Date
  },
  qrCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'dispensed', 'partially_dispensed'],
    default: 'active'
  },
  // Pharmacist validation fields
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacist'
  },
  pharmacistName: {
    type: String
  },
  pharmacyName: {
    type: String
  },
  validatedAt: {
    type: Date
  },
  medicineStatuses: [medicineStatusSchema],
  dispensingNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
