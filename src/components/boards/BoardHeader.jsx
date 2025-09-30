import React from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as ExitToAppIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

function BoardHeader({ 
  board, 
  currentUser, 
  onInviteMember, 
  onEditBoard, 
  onDeleteBoard, 
  onLeaveBoard 
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEditBoard?.(board);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDeleteBoard?.(board);
  };

  const handleLeaveClick = () => {
    handleMenuClose();
    setLeaveDialogOpen(true);
  };

  const handleLeaveConfirm = () => {
    setLeaveDialogOpen(false);
    console.log('Leaving board:', board); 
    onLeaveBoard?.(board);
  };

  const handleLeaveCancel = () => {
    setLeaveDialogOpen(false);
  };

  const isOwner = currentUser && board && board.ownerId === currentUser.id;

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#1E1F22',
          mb: 3,
          padding: 2.5,
          borderRadius: 2,
          border: '1px solid #4A4B4F',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#BDC1CA',
              fontWeight: 600,
              fontSize: '1.5rem'
            }}
          >
            {board?.name || 'Board'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={onInviteMember}
            sx={{
              backgroundColor: '#8E44AD',
              color: '#FFFFFF',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              py: 1,
              '&:hover': {
                backgroundColor: '#7B3F98',
              }
            }}
          >
            Invite Members
          </Button>

          <IconButton
            onClick={handleMenuOpen}
            sx={{
              color: '#BDC1CA',
              '&:hover': {
                backgroundColor: 'rgba(189, 193, 202, 0.1)',
              }
            }}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: '#2B2D31',
                border: '1px solid #4A4B4F',
                '& .MuiMenuItem-root': {
                  color: '#BDC1CA',
                  '&:hover': {
                    backgroundColor: 'rgba(189, 193, 202, 0.1)',
                  },
                },
              },
            }}
          >
            {isOwner ? (
              [
                <MenuItem key="edit" onClick={handleEdit}>
                  <ListItemIcon>
                    <EditIcon sx={{ color: '#BDC1CA' }} />
                  </ListItemIcon>
                  <ListItemText>Edit Board</ListItemText>
                </MenuItem>,
                <MenuItem key="delete" onClick={handleDelete}>
                  <ListItemIcon>
                    <DeleteIcon sx={{ color: '#E74C3C' }} />
                  </ListItemIcon>
                  <ListItemText sx={{ color: '#E74C3C' }}>Delete Board</ListItemText>
                </MenuItem>
              ]
            ) : (
              <MenuItem onClick={handleLeaveClick}>
                <ListItemIcon>
                  <ExitToAppIcon sx={{ color: '#F39C12' }} />
                </ListItemIcon>
                <ListItemText sx={{ color: '#F39C12' }}>Leave Board</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Box>

      {/* Confirmation Dialog for Leaving Board */}
      <Dialog
        open={leaveDialogOpen}
        onClose={handleLeaveCancel}
        PaperProps={{
          sx: {
            backgroundColor: '#1E1F22',
            border: '1px solid #4A4B4F',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ color: '#BDC1CA', borderBottom: '1px solid #4A4B4F' }}>
          Leave Board
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#8E8E93', mt: 2 }}>
            Are you sure you want to leave the board "<strong style={{ color: '#BDC1CA' }}>{board?.name}</strong>"? 
            You will lose access to this board and all its content. You can only rejoin if someone invites you again.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #4A4B4F' }}>
          <Button 
            onClick={handleLeaveCancel}
            sx={{ 
              color: '#BDC1CA',
              '&:hover': {
                backgroundColor: 'rgba(189, 193, 202, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLeaveConfirm}
            variant="contained"
            sx={{ 
              backgroundColor: '#F39C12',
              '&:hover': {
                backgroundColor: '#E67E22'
              }
            }}
          >
            Leave Board
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BoardHeader;