import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  TextField,
  Divider,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicineChecklist from '../components/MedicineChecklist';
import { dispensePrescription } from '../services/api';
import { Medicine, MedicineStatus, Prescription } from '../types/prescription';

interface LocationState {
  prescription: Prescription;
  medicines: Medicine[];
  medicineStatuses: MedicineStatus[];
  previousDispensing: {
    pharmacistId: string;
    pharmacistName: string;
    pharmacyName: string;
    validatedAt: string;
  } | null;
  prescriptionId: string;
}

const ValidatePrescription: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [statuses, setStatuses] = useState<MedicineStatus[]>(
    state?.medicineStatuses || []
  );
  const [dispensingNotes, setDispensingNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if no prescription data
  if (!state?.prescription) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No prescription data found. Please scan a prescription first.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/scan')}
          sx={{ mt: 2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
        >
          Go to Scanner
        </Button>
      </Container>
    );
  }

  const { prescription, medicines, previousDispensing, prescriptionId } = state;

  const handleStatusChange = (medicineName: string, newStatus: MedicineStatus['status']) => {
    setStatuses(prev => {
      const existing = prev.findIndex(s => s.medicineName === medicineName);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status: newStatus, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [...prev, { medicineName, status: newStatus, updatedAt: new Date().toISOString() }];
    });
  };

  const handleSubmit = async () => {
    // Check if all medicines have a status set (not pending)
    const allStatusSet = medicines.every(med => {
      const status = statuses.find(s => s.medicineName === med.name);
      return status && status.status !== 'pending';
    });

    if (!allStatusSet) {
      setError('Please select a status for all medicines before submitting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispensePrescription(prescriptionId, {
        medicineStatuses: statuses,
        dispensingNotes,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit dispensing information');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <VerifiedIcon sx={{ fontSize: 80, color: '#2e7d32', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
            Prescription Dispensed Successfully!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            The prescription has been updated with your dispensing information.
          </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              onClick={() => navigate('/scan')}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              Scan Another
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{ color: '#2e7d32', borderColor: '#2e7d32' }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/scan')}
        sx={{ mb: 2, color: '#2e7d32' }}
      >
        Back to Scanner
      </Button>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <VerifiedIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32' }}>
            Prescription Valid
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {previousDispensing && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
            This prescription was previously processed by{' '}
            <strong>{previousDispensing.pharmacistName}</strong> at{' '}
            <strong>{previousDispensing.pharmacyName}</strong> on{' '}
            {new Date(previousDispensing.validatedAt).toLocaleString()}
          </Alert>
        )}

        {/* Prescription Details */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            PRESCRIPTION DETAILS
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Prescription ID
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {prescription._id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Status
              </Typography>
              <Chip
                label={prescription.status.replace('_', ' ').toUpperCase()}
                size="small"
                color={
                  prescription.status === 'active' ? 'success' :
                  prescription.status === 'dispensed' ? 'info' :
                  prescription.status === 'partially_dispensed' ? 'warning' : 'default'
                }
              />
            </Grid>
            {prescription.diagnosis && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Diagnosis
                </Typography>
                <Typography variant="body1">{prescription.diagnosis}</Typography>
              </Grid>
            )}
            {prescription.patientEmail && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Patient Email
                </Typography>
                <Typography variant="body1">{prescription.patientEmail}</Typography>
              </Grid>
            )}
            {prescription.instructions && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Instructions
                </Typography>
                <Typography variant="body1">{prescription.instructions}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Created
              </Typography>
              <Typography variant="body1">
                {new Date(prescription.createdAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Medicine Checklist */}
        <MedicineChecklist
          medicines={medicines}
          statuses={statuses}
          onStatusChange={handleStatusChange}
          disabled={loading}
        />

        <Divider sx={{ my: 3 }} />

        {/* Dispensing Notes */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Dispensing Notes (Optional)"
          placeholder="Add any notes about this dispensing..."
          value={dispensingNotes}
          onChange={(e) => setDispensingNotes(e.target.value)}
          disabled={loading}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#2e7d32',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2e7d32',
            },
          }}
        />

        {/* Submit Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' },
              px: 4,
            }}
          >
            {loading ? 'Submitting...' : 'Confirm Dispensing'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ValidatePrescription;
