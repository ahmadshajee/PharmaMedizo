import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { authState } = useAuth();
  const { isAuthenticated } = authState;

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <LocalPharmacyIcon sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              PharmaMedizo
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Secure Prescription Validation Portal for Pharmacists
            </Typography>
            {!isAuthenticated && (
              <Box display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    bgcolor: 'white',
                    color: '#2e7d32',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    px: 4,
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    px: 4,
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
            {isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/dashboard"
                sx={{
                  bgcolor: 'white',
                  color: '#2e7d32',
                  '&:hover': { bgcolor: '#f5f5f5' },
                  px: 4,
                }}
              >
                Go to Dashboard
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom sx={{ color: '#2e7d32' }}>
          Features
        </Typography>
        <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 4 }}>
          Everything you need to validate and manage prescriptions efficiently
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <QrCodeScannerIcon sx={{ fontSize: 64, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                QR Code Scanning
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Quickly scan prescription QR codes using your device camera to validate authenticity instantly.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <VerifiedIcon sx={{ fontSize: 64, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Real-time Validation
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Verify prescriptions against the database in real-time to ensure authenticity and prevent fraud.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <SecurityIcon sx={{ fontSize: 64, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Secure Tracking
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Track dispensed medications with pharmacist ID for complete audit trail and accountability.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
