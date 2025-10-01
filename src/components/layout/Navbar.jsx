import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ExitToApp,
  GitHub,
  CheckCircle,
  Menu as MenuIcon,
} from '@mui/icons-material';
import NotificationIcon from '../notifications/NotificationIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, boardsAPI } from '../../services/api';
import { useInvitationStore, useTaskMemberStore } from '../../utils/store';
import PendingInvitations from '../boards/PendingInvitations';
import { logos } from '../../assets';

function Navbar({ onMenuToggle, sidebarOpen }) { // Nhận prop sidebarOpen
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLinkingGitHub, setIsLinkingGitHub] = useState(false);
  const [pendingInvitationsOpen, setPendingInvitationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    fetchPendingInvitations,
  } = useInvitationStore();

  const { boardMembers = {}, fetchBoardMembers } = useTaskMemberStore();

  const boardMatch = location.pathname.match(/\/board\/([^\/]+)/);
  const currentBoardId = boardMatch ? boardMatch[1] : null;
  const isInBoardView = !!currentBoardId;

  useEffect(() => {
    if (user) {
      fetchPendingInvitations();
    }
  }, [user, fetchPendingInvitations]);

  useEffect(() => {
    if (isInBoardView && currentBoardId) {
      fetchBoardMembers(currentBoardId);
    }
  }, [isInBoardView, currentBoardId, fetchBoardMembers]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.email) return user.email;
    if (user.displayName) return user.displayName;
    return 'User';
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleLinkGitHub = async () => {
    try {
      setIsLinkingGitHub(true);
      const response = await authAPI.githubAuth();
      const data = response.data;
      
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        console.error('GitHub auth failed:', data.message || 'Failed to initiate GitHub authentication');
      }
    } catch (error) {
      console.error('GitHub linking error:', error);
      setIsLinkingGitHub(false);
    }
  };

  const handleInvitationResponse = async (invitationId, response) => {
    try {
      await boardsAPI.respondToInvitation(invitationId, response);
      await fetchPendingInvitations();
    } catch (error) {
      console.error('Error responding to invitation:', error);
    }
  };

  const isGitHubLinked = user?.githubProfile && user?.githubProfile?.id;

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: '#FFFFFF'
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleDashboard}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                mr: 2
              }}
            >
              <img 
                src={logos.main} 
                alt="Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
             
            </Avatar>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                fontSize: '1.5rem',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                letterSpacing: '0.5px'
              }}
            >
              Trello
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ '& .MuiIconButton-root': { color: 'rgba(255,255,255,0.9)' } }}>
              <NotificationIcon />
            </Box>
            
            {isGitHubLinked && (
              <IconButton 
                sx={{ 
                  color: '#FFFFFF',
                  backgroundColor: '#4CAF50',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': { 
                    backgroundColor: '#45A049',
                    transform: 'scale(1.05)'
                  }
                }}
                title="GitHub Account Connected"
              >
                <GitHub />
              </IconButton>
            )}
            
            <IconButton
              onClick={handleMenu}
              sx={{ 
                ml: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  backgroundColor: '#8E44AD',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '2px solid rgba(255,255,255,0.2)'
                }}
              >
                {getUserDisplayName().charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  background: 'linear-gradient(135deg, rgba(30, 31, 34, 0.95) 0%, rgba(45, 46, 49, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  color: '#BDC1CA',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  mt: 1
                },
              }}
            >
              {/* User Info */}
              <MenuItem 
                disabled 
                sx={{ 
                  opacity: 0.8, 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5
                }}
              >
                {getUserDisplayName()}
              </MenuItem>
              
              <MenuItem 
                onClick={isGitHubLinked ? undefined : handleLinkGitHub}
                disabled={isLinkingGitHub}
                sx={{ 
                  mx: 1,
                  borderRadius: 2,
                  '&:hover': { 
                    backgroundColor: isGitHubLinked 
                    ? 'rgba(123, 255, 123, 0.1)' 
                    : 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                  },
                  cursor: isGitHubLinked ? 'default' : 'pointer',
                  color: isGitHubLinked ? '#4CAF50' : '#BDC1CA', 
                  fontWeight: isGitHubLinked ? 600 : 400
                }}
              >
                {isGitHubLinked ? (
                  <>
                    <CheckCircle sx={{ mr: 1, color: '#4CAF50' }} />
                    <span style={{ color: '#4CAF50', fontWeight: 600 }}>GitHub Linked</span>
                  </>
                ) : (
                  <>
                    <GitHub sx={{ mr: 1, color: '#BDC1CA' }} />
                    {isLinkingGitHub ? 'Linking...' : 'Link GitHub'}
                  </>
                )}
              </MenuItem>
              
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  mx: 1,
                  borderRadius: 2,
                  color: '#FF6B6B',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    backdropFilter: 'blur(10px)'
                  } 
                }}
              >
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Pending Invitations Modal */}
      <PendingInvitations 
        open={pendingInvitationsOpen}
        onClose={() => setPendingInvitationsOpen(false)}
        onInvitationResponse={handleInvitationResponse}
      />
    </>
  );
}

Navbar.defaultProps = {
  onMenuToggle: () => {},
  sidebarOpen: false,
};

export default Navbar;