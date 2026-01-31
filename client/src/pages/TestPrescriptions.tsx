import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Divider,
  Alert,
} from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Demo prescription IDs for testing (MongoDB ObjectId format - 24 hex characters)
const testPrescriptions = [
  {
    id: '507f1f77bcf86cd799439011',
    patient: 'Sarah Ahmed',
    age: 35,
    gender: 'Female',
    diagnosis: 'Hypothyroidism',
    doctor: 'Dr. Ali Hassan',
    hospital: 'City Medical Center',
    medicineCount: 2,
    status: 'active',
  },
  {
    id: '507f1f77bcf86cd799439012',
    patient: 'Mohammad Khan',
    age: 52,
    gender: 'Male',
    diagnosis: 'Type 2 Diabetes Mellitus',
    doctor: 'Dr. Fatima Zahra',
    hospital: 'National Hospital',
    medicineCount: 3,
    status: 'active',
  },
  {
    id: '507f1f77bcf86cd799439013',
    patient: 'Aisha Begum',
    age: 48,
    gender: 'Female',
    diagnosis: 'Essential Hypertension',
    doctor: 'Dr. Ahmed Raza',
    hospital: 'Heart Care Institute',
    medicineCount: 3,
    status: 'active',
  },
  {
    id: '507f1f77bcf86cd799439014',
    patient: 'Zain Ali',
    age: 28,
    gender: 'Male',
    diagnosis: 'Upper Respiratory Tract Infection',
    doctor: 'Dr. Sana Malik',
    hospital: 'Community Health Clinic',
    medicineCount: 3,
    status: 'active',
  },
  {
    id: '507f1f77bcf86cd799439015',
    patient: 'Hira Nawaz',
    age: 32,
    gender: 'Female',
    diagnosis: 'Migraine',
    doctor: 'Dr. Imran Sheikh',
    hospital: 'Family Medical Center',
    medicineCount: 2,
    status: 'dispensed',
  },
  {
    id: '507f1f77bcf86cd799439016',
    patient: 'Bilal Ahmad',
    age: 45,
    gender: 'Male',
    diagnosis: 'Lumbar Spondylosis',
    doctor: 'Dr. Nadia Hussain',
    hospital: 'Bone & Joint Hospital',
    medicineCount: 4,
    status: 'active',
  },
];

const TestPrescriptions: React.FC = () => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleValidate = (prescriptionId: string) => {
    navigate(`/validate?id=${prescriptionId}`);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <LocalPharmacyIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" color="primary" fontWeight="bold">
            Test Prescriptions
          </Typography>
        </Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Demo Mode:</strong> These are test prescriptions for testing the PharmaMedizo system.
          Click "Validate" to view prescription details and dispense medicines, or copy the ID to use with the QR scanner.
        </Alert>
        <Typography variant="body1" color="textSecondary">
          Use these prescription IDs to test the validation and dispensing workflow.
          You can either click "Validate" directly or enter the ID manually in the scan page.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {testPrescriptions.map((prescription) => (
          <Grid item xs={12} sm={6} md={4} key={prescription.id}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: prescription.status === 'dispensed' ? '2px solid #ff9800' : '1px solid #e0e0e0',
                opacity: prescription.status === 'dispensed' ? 0.8 : 1,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="subtitle2" color="textSecondary" fontFamily="monospace">
                    {prescription.id}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={prescription.status === 'dispensed' ? 'Dispensed' : 'Active'}
                    color={prescription.status === 'dispensed' ? 'warning' : 'success'}
                  />
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PersonIcon fontSize="small" color="primary" />
                  <Typography variant="h6" component="div">
                    {prescription.patient}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {prescription.age} years, {prescription.gender}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} mt={2}>
                  <MedicalServicesIcon fontSize="small" color="secondary" />
                  <Typography variant="body2" fontWeight="medium">
                    {prescription.diagnosis}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {prescription.doctor}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {prescription.hospital}
                </Typography>
                
                <Box mt={2}>
                  <Chip 
                    size="small" 
                    label={`${prescription.medicineCount} medicines`}
                    variant="outlined"
                    color="primary"
                  />
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopyId(prescription.id)}
                  color={copiedId === prescription.id ? 'success' : 'inherit'}
                >
                  {copiedId === prescription.id ? 'Copied!' : 'Copy ID'}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleValidate(prescription.id)}
                  sx={{ ml: 'auto' }}
                >
                  Validate
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={2} sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          How to Test
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li><strong>Direct Validation:</strong> Click "Validate" on any prescription card to view and dispense.</li>
            <li><strong>Manual Entry:</strong> Go to Scan page → Enter prescription ID manually → Click "Lookup".</li>
            <li><strong>QR Code:</strong> Generate a QR code with the prescription ID and scan it.</li>
          </ol>
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          <strong>Note:</strong> The "RX-005-DISPENSED" prescription is already marked as dispensed to test that scenario.
        </Typography>
      </Paper>
    </Container>
  );
};

export default TestPrescriptions;
