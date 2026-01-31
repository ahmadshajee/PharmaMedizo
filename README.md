# PharmaMedizo - Pharmacist Portal

A secure prescription validation portal for pharmacists built with React.js and Node.js. This application allows pharmacists to scan and validate prescriptions from the Medizo healthcare system.

## 🚀 Overview

PharmaMedizo is a separate web portal that connects to the same MongoDB database as Medizo. Pharmacists can:
- Scan prescription QR codes using their device camera
- Validate prescriptions against the database
- Track medication dispensing with detailed status tracking
- Maintain audit trails with pharmacist identification

## 🚀 Features

### For Pharmacists
- **QR Code Scanning**: Scan prescription QR codes using device camera
- **Manual Entry**: Enter prescription ID manually if scanning fails
- **Prescription Validation**: Verify prescriptions against the database in real-time
- **Medicine Checklist**: Track each medicine with mutually exclusive statuses:
  - ✅ **Given** - Medicine has been dispensed
  - ⚠️ **Not Available** - Medicine is out of stock
  - ❌ **Not Needed** - Patient declined or doesn't need the medicine
- **Dispensing History**: View all previously dispensed prescriptions
- **Profile Management**: Manage pharmacy and pharmacist details

### System Features
- **Secure Authentication**: JWT-based authentication for pharmacists
- **Pharmacist Tracking**: Each prescription records which pharmacist dispensed it
- **Real-time Validation**: Instant verification against the database
- **Audit Trail**: Complete tracking of all dispensing activities

## Tech Stack

### Frontend
- React with TypeScript
- Material UI for UI components
- @zxing/browser for QR code scanning
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Project Structure

```
PharmaMedizo/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # Auth context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database config
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- npm or yarn package manager
- MongoDB database (same as Medizo)

### Server Setup
```bash
cd server
npm install

# Create .env file with:
# MONGO_URI=your-mongodb-connection-string
# JWT_SECRET=your-jwt-secret
# PORT=5001

npm start
```

### Client Setup
```bash
cd client
npm install
npm start
```

The client will run on port 3001 (to avoid conflict with Medizo on port 3000).

### Environment Variables

#### Server (.env)
- `MONGO_URI`: MongoDB connection string (same as Medizo)
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5001)
- `CLIENT_URL`: Frontend URL for CORS

#### Client (.env)
- `REACT_APP_API_URL`: Backend API URL (for production)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new pharmacist
- `POST /api/auth/login` - Pharmacist login
- `GET /api/auth/me` - Get current pharmacist profile
- `PUT /api/auth/profile` - Update profile

### Prescriptions
- `GET /api/prescriptions/validate/:id` - Validate prescription by ID
- `POST /api/prescriptions/dispense/:id` - Record dispensing information
- `GET /api/prescriptions/history` - Get dispensing history
- `GET /api/prescriptions/stats` - Get dispensing statistics

## Database Updates

When a pharmacist dispenses a prescription, the following fields are added:
- `pharmacistId`: ObjectId of the pharmacist
- `pharmacistName`: Name of the pharmacist
- `pharmacyName`: Name of the pharmacy
- `validatedAt`: Timestamp of dispensing
- `medicineStatuses`: Array of medicine statuses
- `dispensingNotes`: Optional notes

## Deployment

### Render (Recommended)

1. Create separate web services for client and server
2. Set environment variables
3. Deploy from GitHub

### Other Platforms
- Vercel (frontend)
- Heroku (backend)
- Railway (full stack)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Role-based access control
- Audit trail for all dispensing activities

## License

ISC
