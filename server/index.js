require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const prescriptionRoutes = require('./routes/prescriptions');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;
let mongoConnected = false;

// Connect to MongoDB
const initializeApp = async () => {
  mongoConnected = await connectDB();
  
  if (mongoConnected) {
    console.log('PharmaMedizo: Connected to MongoDB');
  } else {
    console.log('PharmaMedizo: Running in DEMO mode (no MongoDB). Using mock data for testing.');
  }
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());
app.use(morgan('dev'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'PharmaMedizo API is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongoConnected: mongoConnected && mongoose.connection.readyState === 1
  });
});

// Initialize app and start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`PharmaMedizo Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize PharmaMedizo:', err);
  process.exit(1);
});

module.exports = app;
