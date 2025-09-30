import React, { useState, useEffect } from 'react';
import {
  Menu,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Typography,
  Box,
  Badge,
  IconButton,
  Divider,
  Button,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationImportant as NotificationImportantIcon,
  Person as PersonIcon,
  Task as TaskIcon,
  Comment as CommentIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { notificationsAPI, boardsAPI } from '../../services/api';
import socketService from '../../services/socketService';

const NotificationList = ({ anchorEl, open, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsRes, countsRes] = await Promise.all([
        notificationsAPI.getAll(),
        notificationsAPI.getCounts()
      ]);

      setNotifications(notificationsRes.data.notifications || []);
      setUnreadCount(countsRes.data.counts?.unread || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Listen for new notifications
  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socketService.onNewNotification(handleNewNotification);
    socketService.onBoardInvitation(handleNewNotification);

    return () => {
      // Don't remove all listeners here since NotificationManager also uses them
    };
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId || n.notificationId === notificationId 
            ? { ...n, read: true } 
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);
      
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId || n.notificationId === notificationId);
        const newNotifications = prev.filter(n => n.id !== notificationId && n.notificationId !== notificationId);
        
        // Update unread count if deleted notification was unread
        if (notification && !notification.read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        
        return newNotifications;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await handleMarkAsRead(notification.id || notification.notificationId);
    }

    // Handle different notification types
    if (notification.type === 'board_invitation' && notification.data?.boardId) {
      // Close dropdown and handle invitation
      onClose();
      // Could redirect to board or show invitation dialog here
    }

    // Close dropdown
    onClose();
  };

  // Handle invitation actions
  const handleInvitationAction = async (invitationId, action, notificationId) => {
    try {
      await boardsAPI.respondToInvitation(invitationId, action);
      
      // Mark notification as read
      if (notificationId) {
        await handleMarkAsRead(notificationId);
      }
      
      // Remove from list
      setNotifications(prev => 
        prev.filter(n => 
          n.data?.invitationId !== invitationId && 
          n.invitationId !== invitationId
        )
      );

      if (action === 'accepted') {
        alert('Invitation accepted! Page will refresh to show new board.');
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      alert(`Failed to ${action} invitation. Please try again.`);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'board_invitation':
        return <PersonIcon sx={{ fontSize: 20 }} />;
      case 'task_assigned':
        return <TaskIcon sx={{ fontSize: 20 }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 20 }} />;
    }
  };

  // Format notification time
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now - date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  // Render notification item
  const renderNotificationItem = (notification, index) => {
    const isUnread = !notification.read;
    const isInvitation = notification.type === 'board_invitation';

    return (
      <React.Fragment key={notification.id || notification.notificationId || index}>
        <ListItem
          sx={{
            px: 2,
            py: 1,
            backgroundColor: isUnread ? 'rgba(123, 155, 255, 0.1)' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(189, 193, 202, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              backgroundColor: isUnread ? '#7B9BFF' : '#4A4B4F' 
            }}>
              {getNotificationIcon(notification.type)}
            </Avatar>
          </ListItemIcon>

          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isUnread ? '#FFFFFF' : '#BDC1CA',
                    fontWeight: isUnread ? 600 : 400,
                    flex: 1,
                  }}
                >
                  {notification.title || notification.message}
                </Typography>
                {isUnread && (
                  <Chip
                    size="small"
                    label="New"
                    sx={{
                      backgroundColor: '#7B9BFF',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      height: 18,
                    }}
                  />
                )}
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                  {notification.message && notification.title ? notification.message : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6C7B7F', display: 'block' }}>
                  {formatTime(notification.createdAt || notification.timestamp)}
                </Typography>
              </Box>
            }
            onClick={() => handleNotificationClick(notification)}
            sx={{ cursor: 'pointer' }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
            {/* Mark as read button */}
            {isUnread && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead(notification.id || notification.notificationId);
                }}
                sx={{ color: '#7B9BFF' }}
              >
                <MarkEmailReadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}

            {/* Delete button */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNotification(notification.id || notification.notificationId);
              }}
              sx={{ color: '#8E8E93' }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </ListItem>

        {/* Invitation actions */}
        {isInvitation && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleInvitationAction(
                  notification.invitationId || notification.data?.invitationId,
                  'accepted',
                  notification.id || notification.notificationId
                )}
                sx={{
                  backgroundColor: '#8E44AD',
                  '&:hover': { backgroundColor: '#7B3F98' },
                  minWidth: 70,
                }}
              >
                Accept
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleInvitationAction(
                  notification.invitationId || notification.data?.invitationId,
                  'declined',
                  notification.id || notification.notificationId
                )}
                sx={{
                  borderColor: '#4A4B4F',
                  color: '#BDC1CA',
                  '&:hover': {
                    borderColor: '#6C7B7F',
                    backgroundColor: 'rgba(189, 193, 202, 0.1)',
                  },
                  minWidth: 70,
                }}
              >
                Decline
              </Button>
            </Box>
          </Box>
        )}

        {index < notifications.length - 1 && (
          <Divider sx={{ borderColor: '#4A4B4F' }} />
        )}
      </React.Fragment>
    );
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: '#2D2E31',
          color: '#BDC1CA',
          border: '1px solid #4A4B4F',
          borderRadius: 2,
          minWidth: 400,
          maxWidth: 500,
          maxHeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #4A4B4F' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ color: '#7B9BFF', textTransform: 'none' }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        {unreadCount > 0 && (
          <Typography variant="caption" sx={{ color: '#8E8E93' }}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
          <NotificationsIcon sx={{ fontSize: 48, color: '#4A4B4F', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#8E8E93' }}>
            No notifications yet
          </Typography>
        </Box>
      ) : (
        <List sx={{ py: 0, maxHeight: 450, overflow: 'auto' }}>
          {notifications.map(renderNotificationItem)}
        </List>
      )}
    </Menu>
  );
};

export default NotificationList;