import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const GitHubCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (error) {
          console.error('GitHub linking error:', error);
          setStatus('error');
          setTimeout(() => {
            navigate('/dashboard', { 
              state: { error: decodeURIComponent(error) }
            });
          }, 2000);
          return;
        }

        if (success) {
          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard', { 
              state: { success: decodeURIComponent(success) }
            });
          }, 2000);
          return;
        }

        console.error('No success or error parameters received');
        setStatus('error');
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { error: 'GitHub linking failed. Please try again.' }
          });
        }, 2000);
      } catch (error) {
        console.error('Callback handling error:', error);
        setStatus('error');
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { error: 'An error occurred during GitHub linking.' }
          });
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing GitHub account linking...';
      case 'saving':
        return 'Linking your GitHub account...';
      case 'success':
        return 'Success! GitHub account linked. Redirecting...';
      case 'error':
        return 'GitHub linking failed. Redirecting...';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'success.main';
      case 'error':
        return 'error.main';
      default:
        return 'primary.main';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Paper 
        elevation={24} 
        sx={{ 
          padding: 6, 
          width: '100%',
          maxWidth: 400,
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: getStatusColor(),
              mb: 2 
            }} 
          />
        </Box>
        
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 2
          }}
        >
          GitHub Account Linking
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: 2
          }}
        >
          {getStatusMessage()}
        </Typography>
        
        {status === 'success' && (
          <Typography
            variant="body2"
            sx={{
              color: 'success.main',
              fontWeight: 'medium'
            }}
          >
            ✓ GitHub account linked successfully!
          </Typography>
        )}
        
        {status === 'error' && (
          <Typography
            variant="body2"
            sx={{
              color: 'error.main',
              fontWeight: 'medium'
            }}
          >
            ✗ GitHub linking failed
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default GitHubCallback;