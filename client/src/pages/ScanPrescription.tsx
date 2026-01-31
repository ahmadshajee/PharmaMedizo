import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StopIcon from '@mui/icons-material/Stop';
import SearchIcon from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { validatePrescription } from '../services/api';

const ScanPrescription: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [cameraSupported, setCameraSupported] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);

    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
    }

    return () => {
      // Cleanup on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setScanning(true);

    try {
      // First check if we can access the camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device/browser');
      }

      // Request camera permission explicitly first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());

      if (!codeReader || !videoRef.current) {
        throw new Error('Scanner not initialized');
      }

      await codeReader.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current,
        (result, err) => {
          if (result) {
            const scannedText = result.getText();
            console.log('Scanned:', scannedText);
            stopScanning();
            handleValidation(scannedText);
          }
          // Ignore errors during scanning (they occur continuously when no code is detected)
        }
      );
    } catch (err: any) {
      console.error('Camera error:', err);
      let errorMessage = 'Unable to access camera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError' || err.message?.includes('not supported')) {
        errorMessage = 'Camera not supported. Try using HTTPS or upload a QR code image instead.';
        setCameraSupported(false);
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.';
      }
      
      setError(errorMessage);
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Handle QR code image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !codeReader) return;

    setLoading(true);
    setError(null);

    try {
      const imageUrl = URL.createObjectURL(file);
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);
      
      if (result) {
        handleValidation(result.getText());
      }
    } catch (err) {
      console.error('QR decode error:', err);
      setError('Could not read QR code from image. Please try another image or enter the ID manually.');
      setLoading(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleValidation = async (prescriptionId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Extract ID if it's a URL or contains extra data
      let id = prescriptionId;
      
      // If the QR contains a URL, extract the ID
      if (prescriptionId.includes('/')) {
        const parts = prescriptionId.split('/');
        id = parts[parts.length - 1];
      }
      
      // Remove any query strings
      id = id.split('?')[0];
      
      console.log('Validating prescription ID:', id);
      
      const response = await validatePrescription(id);
      
      if (response.valid) {
        // Navigate to validation page with prescription data
        navigate('/validate', { 
          state: { 
            prescription: response.prescription,
            medicines: response.medicines,
            medicineStatuses: response.medicineStatuses,
            previousDispensing: response.previousDispensing,
            prescriptionId: id
          } 
        });
      } else {
        setError(response.message || 'Prescription validation failed');
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setError(err.response?.data?.message || 'Failed to validate prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      handleValidation(manualId.trim());
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <QrCodeScannerIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32' }}>
            Scan Prescription
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress sx={{ color: '#2e7d32' }} />
            <Typography sx={{ ml: 2 }}>Validating prescription...</Typography>
          </Box>
        )}

        {!loading && (
          <>
            {/* Camera Section */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 500,
                margin: '0 auto',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '4/3',
                  bgcolor: '#000',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {scanning ? (
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    autoPlay
                    playsInline
                    muted
                  />
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      color: 'white',
                      p: 4,
                    }}
                  >
                    <CameraAltIcon sx={{ fontSize: 64, opacity: 0.5 }} />
                    <Typography variant="body1" sx={{ mt: 2, opacity: 0.7 }}>
                      Click "Start Camera" to scan QR code
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Scanning overlay */}
              {scanning && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 200,
                    height: 200,
                    border: '3px solid #2e7d32',
                    borderRadius: 2,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
              )}
            </Box>

            <Box display="flex" justifyContent="center" gap={2} mb={4}>
              {!scanning ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraAltIcon />}
                  onClick={startScanning}
                  sx={{
                    bgcolor: '#2e7d32',
                    '&:hover': { bgcolor: '#1b5e20' },
                    px: 4,
                  }}
                >
                  Start Camera
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<StopIcon />}
                  onClick={stopScanning}
                  sx={{
                    color: '#d32f2f',
                    borderColor: '#d32f2f',
                    '&:hover': { borderColor: '#b71c1c', bgcolor: 'rgba(211, 47, 47, 0.04)' },
                    px: 4,
                  }}
                >
                  Stop Camera
                </Button>
              )}
            </Box>

            {/* Image Upload Option */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="textSecondary">
                OR UPLOAD QR CODE IMAGE
              </Typography>
            </Divider>

            <Box display="flex" justifyContent="center" mb={3}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="qr-image-upload"
              />
              <label htmlFor="qr-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  size="large"
                  startIcon={<FileUploadIcon />}
                  sx={{
                    color: '#2e7d32',
                    borderColor: '#2e7d32',
                    '&:hover': { borderColor: '#1b5e20', bgcolor: 'rgba(46, 125, 50, 0.04)' },
                    px: 4,
                  }}
                >
                  Upload QR Code Image
                </Button>
              </label>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="textSecondary">
                OR ENTER MANUALLY
              </Typography>
            </Divider>

            {/* Manual Entry */}
            <Box
              component="form"
              onSubmit={handleManualSubmit}
              sx={{
                display: 'flex',
                gap: 2,
                maxWidth: 500,
                margin: '0 auto',
              }}
            >
              <TextField
                fullWidth
                label="Prescription ID"
                placeholder="Enter prescription ID from QR code"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                sx={{
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
              <Button
                type="submit"
                variant="contained"
                disabled={!manualId.trim()}
                sx={{
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                  minWidth: 120,
                }}
                startIcon={<SearchIcon />}
              >
                Validate
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ScanPrescription;
