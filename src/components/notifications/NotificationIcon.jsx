import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { notificationsAPI, boardsAPI } from '../../services/api';
import socketService from '../../services/socketService';

const NotificationIcon = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionsLoading, setActionsLoading] = useState({});
  const intervalRef = useRef(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    socketService.onNewNotification(handleNewNotification);
    socketService.on('connect', () => {
      fetchUnreadCount();
    });

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    socketService.onNotificationUpdated(({ notificationId, notification, updates, action }) => {
      if (notificationId === 'all') {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
      } else if (action === 'deleted') {
        setNotifications(prev => {
          const deletedNotif = prev.find(n => n.id === notificationId);
          if (deletedNotif && !deletedNotif.read) {
            setUnreadCount(count => Math.max(0, count - 1));
          }
          return prev.filter(notif => notif.id !== notificationId);
        });
      } else {
        setNotifications(prev => {
          const updated = prev.map(notif => {
            if (notif.id === notificationId) {
              const updatedNotif = { ...notif, ...(notification || updates) };
              return updatedNotif;
            }
            return notif;
          });
          return updated;
        });
        const isNowRead = notification?.read || updates?.read;
        if (isNowRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    });

    socketService.onNotificationDeleted(({ notificationId }) => {
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(notif => notif.id !== notificationId);
      });
    });

    socketService.on('notification_updated', ({ notificationId, action }) => {
      if (action === 'deleted') {
        setNotifications(prev => {
          const notification = prev.find(n => n.id === notificationId);
          if (notification && !notification.isRead) {
            setUnreadCount(count => Math.max(0, count - 1));
          }
          return prev.filter(notif => notif.id !== notificationId);
        });
      } else if (action === 'updated') {
        fetchNotifications();
        fetchUnreadCount();
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socketService.removeAllListeners();
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications(20);
      const notifications = response.data.notifications || [];
      setNotifications(notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && notification.type === 'board_invitation') {
        const invitationId = notification.data?.invitationId; 
        const currentStatus = notification.data?.status;
        if (invitationId && (!currentStatus || currentStatus === 'pending')) {
          try {
            await boardsAPI.respondToInvitation(invitationId, 'declined');
          } catch (invitationError) {
            console.warn('Failed to auto-decline invitation:', invitationError);
          }
        } 
      }

      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleInvitationAction = async (notificationId, action, invitationId) => {
    setActionsLoading(prev => ({ ...prev, [notificationId]: true }));
    try {
      await boardsAPI.respondToInvitation(invitationId, action);
      
      setNotifications(prev => prev.map(notification => {
        if (notification.id === notificationId) {
          const updatedNotification = {
            ...notification,
            data: { ...notification.data, status: action },
            read: true
          };
          
          if (action === 'accepted') {
            updatedNotification.type = 'board_invitation_accepted';
            updatedNotification.message = notification.message.replace('invited you to join', 'You accepted the invitation to join');
          } else if (action === 'declined') {
            updatedNotification.message = notification.message.replace('invited you to join', 'You declined the invitation to join');
          }
          return updatedNotification;
        }
        return notification;
      }));
      if (!notifications.find(n => n.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (action === 'accepted') {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error(`Failed to ${action} invitation:`, error);
    } finally {
      setActionsLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'board_invitation':
        return <PersonAddIcon sx={{ color: '#7B9BFF' }} />;
      case 'task_assigned':
        return <AssignmentIcon sx={{ color: '#F39C12' }} />;
      case 'board_member_added':
        return <GroupIcon sx={{ color: '#9C27B0' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#BDC1CA' }} />;
    }
  };

  const renderNotificationContent = (notification) => {
    if (notification.type === 'board_invitation') {
      const invitationId = notification.data?.invitationId; 
      const invitationStatus = notification.data?.status; 
      const isLoading = actionsLoading[notification.id];
      return (
        <Box>
          <Typography variant="body2" sx={{ color: '#BDC1CA', mb: 2 }}>
            {notification.message}
          </Typography>
          {invitationStatus === 'accepted' ? (
            <Chip
              label="✓ Accepted"
              size="small"
              sx={{
                backgroundColor: '#27AE60',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                height: 24
              }}
            />
          ) : invitationStatus === 'declined' ? (
            <Chip
              label="✗ Declined"
              size="small"
              sx={{
                backgroundColor: '#E74C3C',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                height: 24
              }}
            />
          ) : invitationStatus === 'pending' || !invitationStatus ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                disabled={isLoading}
                onClick={() => handleInvitationAction(notification.id, 'accepted', invitationId)}
                sx={{
                  backgroundColor: '#8E44AD',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': { backgroundColor: '#7B3F98' }
                }}
              >
                {isLoading ? <CircularProgress size={12} /> : 'Accept'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={isLoading}
                onClick={() => handleInvitationAction(notification.id, 'declined', invitationId)}
                sx={{
                  borderColor: '#4A4B4F',
                  color: '#BDC1CA',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': { borderColor: '#6C7B7F', backgroundColor: 'rgba(189, 193, 202, 0.1)' }
                }}
              >
                Decline
              </Button>
            </Box>
          ) : (
            <Chip
              label={`Status: ${invitationStatus}`}
              size="small"
              sx={{
                backgroundColor: '#6C7B7F',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                height: 24
              }}
            />
          )}
        </Box>
      );
    }

    if (notification.type === 'board_invitation_accepted') {
      return (
        <Box>
          <Typography variant="body2" sx={{ color: '#BDC1CA', mb: 1 }}>
            {notification.message}
          </Typography>
          <Chip
            label="✓ Accepted"
            size="small"
            sx={{
              backgroundColor: '#27AE60',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 600,
              height: 24
            }}
          />
        </Box>
      );
    }

    return (
      <Typography variant="body2" sx={{ color: '#BDC1CA' }}>
        {notification.message}
      </Typography>
    );
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        sx={{ 
          color: '#BDC1CA',
          '&:hover': { backgroundColor: 'rgba(189, 193, 202, 0.1)' }
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

   <Menu
  anchorEl={anchorEl}
  open={open}
  onClose={handleClose}
  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  PaperProps={{
    sx: {
      backgroundColor: '#1E1F22',
      border: '1px solid #4A4B4F',
      borderRadius: 3,
      minWidth: 380,
      maxWidth: 450,
      maxHeight: 600,
      mt: 1,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      '& .MuiList-root': {
        p: 0
      }
    }
  }}
>
  {/* Header */}
  <Box sx={{ p: 2, borderBottom: '1px solid #4A4B4F' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6" sx={{ color: '#BDC1CA', fontWeight: 600 }}>
        Notifications
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={handleMarkAllAsRead}
            startIcon={<MarkEmailReadIcon sx={{ fontSize: 14 }} />}
            sx={{
              color: '#8E44AD',
              fontSize: '0.75rem',
              minWidth: 'auto',
              textTransform: 'none'
            }}
          >
            Mark all read
          </Button>
        )}
        <Chip
          label={unreadCount}
          size="small"
          sx={{
            backgroundColor: unreadCount > 0 ? '#E74C3C' : '#4A4B4F',
            color: '#FFFFFF',
            fontSize: '0.7rem',
            height: 20
          }}
        />
      </Box>
    </Box>
  </Box>

  {/* Notifications List */}
  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} sx={{ color: '#8E44AD' }} />
      </Box>
    ) : notifications.length === 0 ? (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <NotificationsNoneIcon sx={{ fontSize: 48, color: '#8E8E93', mb: 1 }} />
        <Typography variant="body2" sx={{ color: '#8E8E93' }}>
          No notifications yet
        </Typography>
      </Box>
    ) : (
      <List sx={{ p: 0 }}>
        {notifications.map((notification, index) => (
          <Box key={notification.id}>
            <ListItem
              sx={{
                p: 2,
                backgroundColor: notification.read ? 'transparent' : 'rgba(142, 68, 173, 0.05)',
                borderLeft: notification.read ? 'none' : '3px solid #8E44AD',
                '&:hover': { backgroundColor: 'rgba(189, 193, 202, 0.05)' }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: 'transparent', width: 32, height: 32 }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ flex: 1, mr: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#BDC1CA', fontWeight: 600, fontSize: '0.85rem' }}>
                    {notification.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {!notification.read && (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(notification.id)}
                        sx={{ 
                          color: '#8E44AD', 
                          width: 24, 
                          height: 24,
                          '&:hover': { backgroundColor: 'rgba(142, 68, 173, 0.1)' }
                        }}
                      >
                        <MarkEmailReadIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteNotification(notification.id)}
                      sx={{ 
                        color: '#FF6B6B', 
                        width: 24, 
                        height: 24,
                        '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
                
                {renderNotificationContent(notification)}
                
                <Typography variant="caption" sx={{ color: '#8E8E93', fontSize: '0.7rem', mt: 1, display: 'block' }}>
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
            </ListItem>
            {index < notifications.length - 1 && (
              <Divider sx={{ borderColor: '#4A4B4F' }} />
            )}
          </Box>
        ))}
      </List>
    )}
  </Box>
</Menu>
    </>
  );
};

export default NotificationIcon;