import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { authState, login, googleLogin } = useAuth();
  const { loading, error, isAuthenticated } = authState;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setGoogleError(null);
    if (credentialResponse.credential) {
      try {
        await googleLogin(credentialResponse.credential);
      } catch (err) {
        setGoogleError('Google sign-in failed. Please try again.');
      }
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: '#2e7d32', width: 56, height: 56 }}>
          <LocalPharmacyIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          PharmaMedizo
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Pharmacist Portal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
            {error}
          </Alert>
        )}

        {googleError && (
          <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
            {googleError}
          </Alert>
        )}

        {/* Google Sign In */}
        <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="320"
            text="signin_with"
          />
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>
          <Typography variant="body2" color="textSecondary">
            OR
          </Typography>
        </Divider>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: '#2e7d32',
              '&:hover': {
                bgcolor: '#1b5e20',
              },
              height: 48,
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          <Grid container justifyContent="center">
            <Grid item>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{ color: '#2e7d32' }}
              >
                {"Don't have an account? Register"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
