import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Avatar, 
  Divider, 
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard, 
  People,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationManager from '../notifications/NotificationManager';
import { useTaskMemberStore } from '../../utils/store';

const drawerWidthOpen = 240;
const drawerWidthClosed = 68;

function Layout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { boardMembers = {}, fetchBoardMembers } = useTaskMemberStore();
  
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [boardMembersList, setBoardMembersList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.email) return user.email;
    if (user.displayName) return user.displayName;
    return 'User';
  };

  const menuItems = [
    {
      text: 'Boards',
      icon: <Dashboard />,
      path: '/dashboard',
    }
  ];

  // Handle sidebar toggle - chỉ dùng cho desktop
  const handleSidebarToggle = () => {
    if (!isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Handle mobile drawer toggle
  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Đóng sidebar mobile khi chuyển route
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Tự động điều chỉnh trạng thái sidebar khi thay đổi kích thước màn hình
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setMobileOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Lấy boardId từ URL nếu đang ở trang board
  useEffect(() => {
    const pathMatch = location.pathname.match(/\/board\/([^\/]+)/);
    if (pathMatch) {
      const boardId = pathMatch[1];
      setCurrentBoardId(boardId);
      fetchBoardMembers(boardId);
    } else {
      setCurrentBoardId(null);
      setBoardMembersList([]);
    }
  }, [location.pathname, fetchBoardMembers]);

  // Cập nhật danh sách member khi boardMembers thay đổi
  useEffect(() => {
    if (currentBoardId && boardMembers[currentBoardId]) {
      setBoardMembersList(boardMembers[currentBoardId]);
    } else {
      setBoardMembersList([]);
    }
  }, [currentBoardId, boardMembers]);

  const isInBoardView = !!currentBoardId;

  // Sidebar content component
  const sidebarContent = (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toggle Button - chỉ hiển thị trên desktop */}
      {!isMobile && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: sidebarOpen ? 'flex-end' : 'center',
          mb: 2,
          px: sidebarOpen ? 0 : 1
        }}>
          <Tooltip title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} placement="right">
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                color: '#B0BEC5',
                backgroundColor: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Main Menu */}
      <List sx={{ flexGrow: isInBoardView && sidebarOpen ? 0 : 1 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={!sidebarOpen ? item.text : ''} placement="right">
            <ListItem
              component="button"
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor: location.pathname === item.path ? '#2B78E4' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? '#2B78E4' : 'rgba(255,255,255,0.1)',
                },
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                px: sidebarOpen ? 2 : 1,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                minHeight: 48
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: '#B0BEC5', 
                  minWidth: 'auto',
                  mr: sidebarOpen ? 2 : 0,
                  justifyContent: 'center'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <Collapse in={sidebarOpen} orientation="horizontal">
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: '#ECEFF1',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </Collapse>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {isInBoardView && sidebarOpen && (
        <Box sx={{ mt: 2, flexGrow: 1, overflow: 'hidden' }}>
          <Divider sx={{ borderColor: '#4A5A61', mb: 2 }} />
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2, 
            px: 1,
          }}>
            <People sx={{ 
              fontSize: 18, 
              color: '#B0BEC5', 
              mr: 1 
            }} />
            <Typography
              variant="body2"
              sx={{
                color: '#B0BEC5',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mr: 'auto'
              }}
            >
              Board Members
            </Typography>
            <Chip 
              label={boardMembersList.length}
              size="small"
              sx={{
                backgroundColor: '#2B78E4',
                color: '#FFFFFF',
                fontSize: '0.625rem',
                height: 20,
                minWidth: 20,
              }}
            />
          </Box>

          {/* Danh sách members */}
          <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            {boardMembersList.length > 0 ? (
              boardMembersList.map((member) => (
                <Box
                  key={member.id || member.uid}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: '#8E44AD',
                      fontSize: '0.75rem',
                      mr: 1.5,
                    }}
                  >
                    {(member.displayName || member.email || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ECEFF1',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {member.displayName || member.email}
                    </Typography>
                    {member.role && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#B0BEC5',
                          fontSize: '0.625rem',
                        }}
                      >
                        {member.role}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: '#B0BEC5',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                No members found
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* User Profile Section */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#E53E3E',
              fontSize: '0.875rem',
              mr: 1,
            }}
          >
            {getUserDisplayName().charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          {sidebarOpen && (
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ECEFF1',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getUserDisplayName()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#37474F' }}>
      <Navbar 
        onMenuToggle={handleMobileToggle} 
        sidebarOpen={isMobile ? false : sidebarOpen} 
      />
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidthOpen,
            backgroundColor: '#37474F',
            borderRight: '1px solid #4A5A61',
            paddingTop: '64px',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: sidebarOpen ? drawerWidthOpen : drawerWidthClosed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidthOpen : drawerWidthClosed,
            boxSizing: 'border-box',
            backgroundColor: '#37474F',
            borderRight: '1px solid #4A5A61',
            paddingTop: '64px',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#ECEFF1',
          minHeight: '100vh',
          paddingTop: '64px',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
       
          width: { 
            xs: '100%', 
            md: `calc(100% - ${sidebarOpen ? drawerWidthOpen : drawerWidthClosed}px)`  // ĐÃ SỬA LỖI Ở ĐÂY
          }
        }}
      >
        {children}
      </Box>

      {/* Notification Manager */}
      <NotificationManager />
    </Box>
  );
}

export default Layout;