import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ScienceIcon from '@mui/icons-material/Science';
import { getDispensingStats } from '../services/api';
import { DispensingStats } from '../types/prescription';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { pharmacist } = authState;

  const [stats, setStats] = useState<DispensingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDispensingStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <LocalPharmacyIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome, {pharmacist?.name}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {pharmacist?.pharmacyName} • License: {pharmacist?.licenseNumber}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => navigate('/scan')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <QrCodeScannerIcon sx={{ fontSize: 64, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Scan Prescription
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Scan QR code to validate and dispense prescription
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                }}
                startIcon={<QrCodeScannerIcon />}
              >
                Start Scanning
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => navigate('/history')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 64, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                View History
              </Typography>
              <Typography variant="body2" color="textSecondary">
                View your prescription dispensing history
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  mt: 2,
                  color: '#2e7d32',
                  borderColor: '#2e7d32',
                  '&:hover': { borderColor: '#1b5e20', bgcolor: 'rgba(46, 125, 50, 0.04)' },
                }}
                startIcon={<HistoryIcon />}
              >
                View History
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Demo Mode Alert */}
      <Alert 
        severity="info" 
        sx={{ mb: 3 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => navigate('/test-prescriptions')}
            startIcon={<ScienceIcon />}
          >
            View Test Prescriptions
          </Button>
        }
      >
        <strong>Demo Mode:</strong> Use test prescriptions to try out the system. Click the button to see available test prescriptions.
      </Alert>

      {/* Statistics */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Your Statistics
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: '#2e7d32' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: '#e8f5e9',
                borderLeft: '4px solid #2e7d32',
              }}
            >
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                {stats?.todayDispensed || 0}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Today's Dispensed
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: '#e3f2fd',
                borderLeft: '4px solid #1976d2',
              }}
            >
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#1976d2' }}>
                {stats?.totalDispensed || 0}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total Dispensed
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: '#fff3e0',
                borderLeft: '4px solid #f57c00',
              }}
            >
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#f57c00' }}>
                {stats?.partiallyDispensed || 0}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Partially Dispensed
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
