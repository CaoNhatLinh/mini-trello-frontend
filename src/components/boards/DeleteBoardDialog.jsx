import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  TextField,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

function DeleteBoardDialog({ open, onClose, board, onDelete }) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfirmValid = confirmText === board?.name;

  const handleDelete = async () => {
    if (!isConfirmValid) {
      setError('Please enter the board name to confirm deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onDelete(board);
      handleClose();
    } catch (error) {
      console.error('Error deleting board:', error);
      setError('Failed to delete board');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2B2D31',
          border: '1px solid #E74C3C',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          color: '#E74C3C',
          borderBottom: '1px solid #4A4B4F',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <WarningIcon />
        Delete Board
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete the board 
              "<strong>{board?.name}</strong>" and all its cards, tasks, and attachments.
            </Typography>
          </Alert>

          <Typography variant="body1" sx={{ color: '#BDC1CA', mb: 1 }}>
            Please type <strong>{board?.name}</strong> to confirm deletion:
          </Typography>
          
          <TextField
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={board?.name}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1E1F22',
                color: '#BDC1CA',
                '& fieldset': {
                  borderColor: '#E74C3C',
                },
                '&:hover fieldset': {
                  borderColor: '#E74C3C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#E74C3C',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#6C6D70',
                opacity: 1,
              },
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid #4A4B4F', p: 2 }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: '#BDC1CA',
            '&:hover': {
              backgroundColor: 'rgba(189, 193, 202, 0.1)',
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleDelete}
          variant="contained"
          disabled={loading || !isConfirmValid}
          startIcon={<DeleteIcon />}
          sx={{
            backgroundColor: '#E74C3C',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#C0392B',
            },
            '&:disabled': {
              backgroundColor: '#4A4B4F',
              color: '#6C6D70',
            }
          }}
        >
          {loading ? 'Deleting...' : 'Delete Board'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteBoardDialog;