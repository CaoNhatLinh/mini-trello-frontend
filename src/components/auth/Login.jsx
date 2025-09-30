import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';

function Login() {
  const [step, setStep] = useState('email'); 
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const callbackError = location.state?.error;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setLocalLoading(true);
    setLocalError('');
    
    try {
      const response = await authAPI.sendVerificationCode({ email: formData.email });
      if (response.data.success) {
        setStep('code');
        setCodeExpiry(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      }
    } catch (error) {
      setLocalError(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!formData.verificationCode) return;
    
    setLocalLoading(true);
    setLocalError('');
    
    try {
      const response = await authAPI.verifyCode({
        email: formData.email,
        verificationCode: formData.verificationCode
      });
      
      if (response.data.success) {
        await login({
          user: response.data.user,
          token: response.data.accessToken
        });
        navigate('/dashboard');
      }
    } catch (error) {
      setLocalError(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setFormData(prev => ({ ...prev, verificationCode: '' }));
    setLocalError('');
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '400px',
          height: '300px',
          backgroundImage: 'url(/src/assets/img/Image-39.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '400px',
          height: '300px',
          backgroundImage: 'url(/src/assets/img/Image-40.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7,
        }}
      />

      <Box
        sx={{
          width: '100%',
          maxWidth: '450px',
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={24}
          sx={{
            padding: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: '100%',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img
              src="/src/assets/img/logo.png"
              alt="Logo"
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block',
              }}
            />
          </Box>

          <Typography
            variant="h6"
            align="center"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: '#1a1a1a'
            }}
          >
            {step === 'email' ? 'Enter your email' : 'Enter verification code'}
          </Typography>

          {step === 'code' && formData.email && (
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              We sent a code to {formData.email}
            </Typography>
          )}

          {callbackError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {callbackError}
            </Alert>
          )}

          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error || localError}
            </Alert>
          )}

          {step === 'email' ? (
            <Box component="form" onSubmit={handleSendCode} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                placeholder="Enter your email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={localLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    '&:hover': {
                      backgroundColor: '#f1f3f4',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  backgroundColor: '#2B78E4',
                  '&:hover': {
                    backgroundColor: '#1a65d1',
                  },
                }}
                disabled={localLoading || !formData.email}
              >
                {localLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Code'
                )}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyCode} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="verificationCode"
                placeholder="Enter 6-digit code"
                name="verificationCode"
                autoComplete="one-time-code"
                autoFocus
                value={formData.verificationCode}
                onChange={handleChange}
                disabled={localLoading}
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]{6}',
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    '&:hover': {
                      backgroundColor: '#f1f3f4',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 1,
                  py: 1.5,
                  backgroundColor: '#2B78E4',
                  '&:hover': {
                    backgroundColor: '#1a65d1',
                  },
                }}
                disabled={localLoading || formData.verificationCode.length !== 6}
              >
                {localLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Verify Code'
                )}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={handleBackToEmail}
                disabled={localLoading}
                sx={{
                  mb: 2,
                  color: '#2B78E4',
                }}
              >
                Back to email
              </Button>
            </Box>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              lineHeight: 1.4,
            }}
          >
            Privacy Policy
            <br />
            This site is protected by reCAPTCHA and the Google Privacy
            Policy and Terms of Service apply.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default Login;