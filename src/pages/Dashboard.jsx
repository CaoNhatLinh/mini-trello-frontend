import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Fab,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useBoardStore } from '../utils/store';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function Dashboard() {
  const navigate = useNavigate();
  const {
    boards,
    loading,
    error,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    clearError,
  } = useBoardStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [boardForm, setBoardForm] = useState({
    name: '',
    description: '',
  });

  useRealTimeUpdates();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleOpenDialog = (board = null) => {
    if (board) {
      setEditingBoard(board);
      setBoardForm({
        name: board.name,
        description: board.description || '',
      });
    } else {
      setEditingBoard(null);
      setBoardForm({
        name: '',
        description: '',
      });
    }
    setDialogOpen(true);
    clearError();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBoard(null);
    setBoardForm({
      name: '',
      description: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBoardForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBoard) {
        await updateBoard(editingBoard.id, boardForm);
      } else {
        await createBoard(boardForm);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save board:', error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await deleteBoard(boardId);
      } catch (error) {
        console.error('Failed to delete board:', error);
      }
    }
  };

  const handleOpenBoard = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  if (loading && boards.length === 0) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#ECEFF1',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: 'calc(100vh - 64px)',  
      backgroundColor: '#ECEFF1',
      width: '100%'
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3,
          color: '#9AA0A6',
          fontWeight: 500,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        YOUR WORKSPACES
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(boards) && boards.map((board) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={ board.id}>
            <Paper
              sx={{
                p: 3,
                height: 120,
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                border: '1px solid #e8eaed',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => handleOpenBoard(board.id )}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#1a1a1a',
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {board.name}
                </Typography>
                {board.description && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#5f6368',
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 'auto'
                    }}
                  >
                    {board.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                  <PeopleIcon sx={{ fontSize: 14, color: '#5f6368' }} />
                  <Typography variant="caption" sx={{ color: '#5f6368' }}>
                    {board.members?.length || 0} members
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 3,
              height: 120,
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              border: '2px dashed #dadce0',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#f1f3f4',
                borderColor: '#5f6368',
              },
            }}
            onClick={() => handleOpenDialog()}
          >
            <AddIcon sx={{ fontSize: 32, color: '#5f6368', mb: 1 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#5f6368',
                fontWeight: 500,
                textAlign: 'center'
              }}
            >
              Create a new board
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {boards.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <DashboardIcon sx={{ fontSize: 64, color: '#9AA0A6', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No boards found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first board to get started with project management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#2B78E4',
              '&:hover': {
                backgroundColor: '#1a65d1',
              },
            }}
          >
            Create Your First Board
          </Button>
        </Box>
      )}

      {/* Create/Edit Board Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingBoard ? 'Edit Board' : 'Create New Board'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Board Name"
              type="text"
              fullWidth
              variant="outlined"
              value={boardForm.name}
              onChange={handleFormChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description (Optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={boardForm.description}
              onChange={handleFormChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : (editingBoard ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Dashboard;