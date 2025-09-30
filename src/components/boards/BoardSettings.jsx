import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

function BoardSettings({ board, isOpen, onClose, onUpdate, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [boardData, setBoardData] = useState({
    name: board?.name || '',
    description: board?.description || '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (board) {
      setBoardData({
        name: board.name || '',
        description: board.description || '',
      });
    }
  }, [board]);

  const handleSave = async () => {
    if (!boardData.name.trim()) {
      setError('Board name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onUpdate(boardData);
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to update board');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete board');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEditMode(false);
      setConfirmDelete(false);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          Board Settings
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Board Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Board Information
          </Typography>
          
          <TextField
            fullWidth
            label="Board Name"
            value={boardData.name}
            onChange={(e) => setBoardData({ ...boardData, name: e.target.value })}
            disabled={!editMode || loading}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            value={boardData.description}
            onChange={(e) => setBoardData({ ...boardData, description: e.target.value })}
            disabled={!editMode || loading}
            multiline
            rows={3}
            placeholder="Add a description for this board..."
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Danger Zone */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
            Danger Zone
          </Typography>
          
          {!confirmDelete ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setConfirmDelete(true)}
              disabled={loading}
              sx={{ mb: 1 }}
            >
              Delete Board
            </Button>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Are you sure you want to delete this board?</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This action cannot be undone. All lists, cards, and tasks will be permanently deleted.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleDelete}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
                >
                  {loading ? 'Deleting...' : 'Delete Board'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setConfirmDelete(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Alert>
          )}
          
          <Typography variant="caption" color="text.secondary">
            Once you delete a board, there is no going back. Please be certain.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {editMode ? (
          <>
            <Button
              onClick={() => {
                setEditMode(false);
                setBoardData({
                  name: board?.name || '',
                  description: board?.description || '',
                });
                setError('');
              }}
              disabled={loading}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading || !boardData.name.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleClose}
              disabled={loading}
            >
              Close
            </Button>
            <Button
              onClick={() => setEditMode(true)}
              variant="contained"
              disabled={loading}
              startIcon={<EditIcon />}
            >
              Edit Board
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default BoardSettings;
