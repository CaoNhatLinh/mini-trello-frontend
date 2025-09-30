import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
} from '@mui/icons-material';

function EditBoardDialog({ open, onClose, board, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (board) {
      setName(board.name || '');
      setDescription(board.description || '');
    }
  }, [board]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Board name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        ...board,
        name: name.trim(),
        description: description.trim(),
      });
      handleClose();
    } catch (error) {
      console.error('Error updating board:', error);
      setError('Failed to update board');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
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
          border: '1px solid #4A4B4F',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          color: '#BDC1CA',
          borderBottom: '1px solid #4A4B4F',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <EditIcon />
        Edit Board
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Board Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1E1F22',
                color: '#BDC1CA',
                '& fieldset': {
                  borderColor: '#4A4B4F',
                },
                '&:hover fieldset': {
                  borderColor: '#8E44AD',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#8E44AD',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#BDC1CA',
                '&.Mui-focused': {
                  color: '#8E44AD',
                },
              },
            }}
          />
          
          <TextField
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1E1F22',
                color: '#BDC1CA',
                '& fieldset': {
                  borderColor: '#4A4B4F',
                },
                '&:hover fieldset': {
                  borderColor: '#8E44AD',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#8E44AD',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#BDC1CA',
                '&.Mui-focused': {
                  color: '#8E44AD',
                },
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
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#8E44AD',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#7B3F98',
            },
            '&:disabled': {
              backgroundColor: '#4A4B4F',
              color: '#6C6D70',
            }
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditBoardDialog;