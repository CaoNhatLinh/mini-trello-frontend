import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import socketService from '../../services/socketService';
import { boardsAPI } from '../../services/api';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socketService.onBoardInvitation((invitation) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'board_invitation',
        ...invitation
      }]);
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await boardsAPI.respondToInvitation(invitationId, 'accepted');
      setNotifications(prev => prev.filter(n => n.invitationId !== invitationId));
      window.location.reload(); 
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await boardsAPI.respondToInvitation(invitationId, 'declined');
      setNotifications(prev => prev.filter(n => n.invitationId !== invitationId));
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  const handleCloseNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };
  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={null}
          anchorOrigin={{ 
            vertical: 'top', 
            horizontal: 'right' 
          }}
          sx={{
            position: 'fixed',
            top: 80 + (index * 120), 
            right: 20,
            zIndex: 9999,
          }}
        >
          <Alert
            severity="info"
            sx={{
              backgroundColor: '#2D2E31',
              color: '#BDC1CA',
              border: '1px solid #4A4B4F',
              borderRadius: 2,
              minWidth: 350,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              '& .MuiAlert-icon': {
                color: '#7B9BFF'
              }
            }}
            onClose={() => handleCloseNotification(notification.id)}
          >
            <AlertTitle sx={{ color: '#BDC1CA', fontWeight: 600 }}>
              Board Invitation
            </AlertTitle>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ width: 32, height: 32, backgroundColor: '#8E44AD' }}>
                <PersonIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ color: '#BDC1CA' }}>
                  <strong>{notification.inviterName}</strong> invited you to join
                </Typography>
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {notification.boardName}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleAcceptInvitation(notification.invitationId)}
                sx={{
                  backgroundColor: '#8E44AD',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#7B3F98',
                  },
                }}
              >
                Accept
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleDeclineInvitation(notification.invitationId)}
                sx={{
                  borderColor: '#4A4B4F',
                  color: '#BDC1CA',
                  '&:hover': {
                    borderColor: '#6C7B7F',
                    backgroundColor: 'rgba(189, 193, 202, 0.1)',
                  },
                }}
              >
                Decline
              </Button>
            </Box>
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationManager;