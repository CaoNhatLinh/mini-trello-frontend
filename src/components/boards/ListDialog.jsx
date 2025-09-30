import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, PlaylistAdd as PlaylistAddIcon, Close as CloseIcon } from '@mui/icons-material';

function ListDialog({ 
  open, 
  onClose, 
  editingList, 
  listForm, 
  onFormChange, 
  onSubmit, 
  loading 
}) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: '#0E0F05',
          border: '1px solid #2D2E31',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
        }
      }}
    >
      <form onSubmit={onSubmit}>
        {/* Header */}
        <DialogTitle 
          sx={{ 
            p: 3,
            pb: 2,
            backgroundColor: '#0E0F05',
            color: '#BDC1CA',
            borderBottom: '1px solid #2D2E31',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
            {editingList ? (
              <EditIcon sx={{ fontSize: 28, color: '#8E44AD', mt: 0.5 }} />
            ) : (
              <PlaylistAddIcon sx={{ fontSize: 28, color: '#8E44AD', mt: 0.5 }} />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.4rem', color: '#BDC1CA', mb: 1 }}>
                {editingList ? 'Edit List' : 'Create New List'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#8E8E93', lineHeight: 1.5 }}>
                {editingList ? 'Update your list information and description' : 'Add a new list to organize and manage your tasks effectively'}
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            onClick={onClose}
            sx={{
              color: '#BDC1CA',
              backgroundColor: '#2D2E31',
              '&:hover': {
                backgroundColor: '#3A3B3F',
              },
              flexShrink: 0
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 3 }}>
          {/* List Name Field */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#BDC1CA', fontWeight: 600, mb: 1.5 }}>
              List Name *
            </Typography>
            <TextField
              autoFocus
              name="name"
              placeholder="Enter a name for your list (e.g., To Do, In Progress, Done...)"
              fullWidth
              variant="outlined"
              value={listForm.name}
              onChange={onFormChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#2D2E31',
                  borderRadius: 2,
                  color: '#BDC1CA',
                  '& fieldset': {
                    borderColor: '#4A4B4F',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6C7B7F',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8E44AD',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  fontSize: '1rem',
                  '&::placeholder': {
                    color: '#8E8E93',
                    opacity: 1,
                  }
                }
              }}
            />
          </Box>
          
          {/* Description Field */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#BDC1CA', fontWeight: 600, mb: 1.5 }}>
              Description
              <Typography component="span" variant="body2" sx={{ color: '#8E8E93', ml: 1, fontWeight: 400 }}>
                (Optional)
              </Typography>
            </Typography>
            <TextField
              name="description"
              placeholder="Add a description to help your team understand this list's purpose..."
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={listForm.description}
              onChange={onFormChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#2D2E31',
                  borderRadius: 2,
                  color: '#BDC1CA',
                  '& fieldset': {
                    borderColor: '#4A4B4F',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6C7B7F',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8E44AD',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  '&::placeholder': {
                    color: '#8E8E93',
                    opacity: 1,
                  }
                }
              }}
            />
          </Box>

          {/* Preview Section */}
          <Fade in={listForm.name} timeout={300}>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#BDC1CA', fontWeight: 600, mb: 1.5 }}>
                Preview
              </Typography>
              <Card
                sx={{
                  backgroundColor: '#1A1B1E',
                  borderRadius: 2,
                  border: '1px solid #2D2E31',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 24,
                        borderRadius: 1,
                        backgroundColor: '#8E44AD',
                        flexShrink: 0,
                        mt: 0.5
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#BDC1CA', fontWeight: 600, mb: 1 }}>
                        {listForm.name}
                      </Typography>
                      {listForm.description && (
                        <Typography variant="body2" sx={{ color: '#8E8E93', lineHeight: 1.5 }}>
                          {listForm.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ p: 3, pt: 2, gap: 2, backgroundColor: '#0E0F05', borderTop: '1px solid #2D2E31' }}>
          <Button 
            onClick={onClose}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontSize: '1rem',
              color: '#BDC1CA',
              backgroundColor: '#2D2E31',
              minWidth: '100px',
              '&:hover': {
                backgroundColor: '#3A3B3F'
              }
            }}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading || !listForm.name.trim()}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: '#8E44AD',
              color: 'white',
              minWidth: '140px',
              '&:hover': {
                backgroundColor: '#7B3F98',
              },
              '&:disabled': {
                backgroundColor: '#4A4B4F',
                color: '#8E8E93'
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                <span>Processing...</span>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {editingList ? <EditIcon sx={{ fontSize: 18 }} /> : <PlaylistAddIcon sx={{ fontSize: 18 }} />}
                {editingList ? 'Update List' : 'Create List'}
              </Box>
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ListDialog;