import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Avatar,
  Chip,
  Link,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Button,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  AccountTree as BranchIcon,
  Code as CommitIcon,
  BugReport as IssueIcon,
  CallMerge as PullRequestIcon,
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Merge as MergeIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useGitHubAttachments } from '../../hooks/useGitHubAttachments';
import './GitHubIntegration.css';

const GitHubAttachmentList = ({ 
  boardId, 
  cardId, 
  taskId, 
  attachments: propAttachments, 
  onAttachmentRemoved,
  showHeader = true,
  maxDisplayCount = null,
  autoFetch = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const fetchedRef = useRef(false); // Track if we've already fetched

  // Use the new GitHub attachments hook
  const {
    attachments: hookAttachments,
    loading,
    error: fetchError,
    fetchAttachments,
    removeAttachment
  } = useGitHubAttachments(boardId, cardId, taskId);

  // Use prop attachments if provided, otherwise use hook attachments
  const attachments = propAttachments || hookAttachments;

  // Fetch attachments when autoFetch is enabled - only once per task
  useEffect(() => {
    if (autoFetch && boardId && cardId && taskId && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchAttachments();
    }
  }, [autoFetch, boardId, cardId, taskId, fetchAttachments]);

  // Reset fetchedRef when task changes
  useEffect(() => {
    fetchedRef.current = false;
  }, [boardId, cardId, taskId]);

  const handleMenuOpen = (event, attachment) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedAttachment(attachment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAttachment(null);
  };

  const handleRemoveAttachment = async () => {
    if (!selectedAttachment) return;
    
    try {
      const success = await removeAttachment(selectedAttachment.id);
      
      if (success && onAttachmentRemoved) {
        onAttachmentRemoved(selectedAttachment.id);
      }
      
      handleMenuClose();
    } catch (error) {
      console.error('Error removing GitHub attachment:', error);
      alert('Failed to remove attachment');
    }
  };

  const getAttachmentIcon = (type, state) => {
    const iconProps = { sx: { fontSize: 20 } };
    
    switch (type) {
      case 'branch':
        return <BranchIcon {...iconProps} />;
      case 'commit':
        return <CommitIcon {...iconProps} />;
      case 'issue':
        return <IssueIcon {...iconProps} />;
      case 'pull_request':
        return <PullRequestIcon {...iconProps} />;
      default:
        return <GitHubIcon {...iconProps} />;
    }
  };

  const getStateIcon = (type, state) => {
    const iconProps = { sx: { fontSize: 16 } };
    
    if (type === 'issue') {
      return state === 'open' ? 
        <CheckCircleIcon {...iconProps} sx={{ color: '#28a745' }} /> :
        <CancelIcon {...iconProps} sx={{ color: '#cb2431' }} />;
    }
    
    if (type === 'pull_request') {
      if (state === 'open') return <CheckCircleIcon {...iconProps} sx={{ color: '#28a745' }} />;
      if (state === 'merged') return <MergeIcon {...iconProps} sx={{ color: '#6f42c1' }} />;
      return <CancelIcon {...iconProps} sx={{ color: '#cb2431' }} />;
    }
    
    return null;
  };

  const getAttachmentColor = (type, state) => {
    const colors = {
      branch: { primary: '#28a745', bg: 'rgba(40, 167, 69, 0.1)', border: 'rgba(40, 167, 69, 0.3)' },
      commit: { primary: '#0366d6', bg: 'rgba(3, 102, 214, 0.1)', border: 'rgba(3, 102, 214, 0.3)' },
      issue: { 
        primary: state === 'open' ? '#28a745' : '#cb2431', 
        bg: state === 'open' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(203, 36, 49, 0.1)',
        border: state === 'open' ? 'rgba(40, 167, 69, 0.3)' : 'rgba(203, 36, 49, 0.3)'
      },
      pull_request: { 
        primary: state === 'open' ? '#28a745' : state === 'merged' ? '#6f42c1' : '#cb2431',
        bg: state === 'open' ? 'rgba(40, 167, 69, 0.1)' : 
            state === 'merged' ? 'rgba(111, 66, 193, 0.1)' : 'rgba(203, 36, 49, 0.1)',
        border: state === 'open' ? 'rgba(40, 167, 69, 0.3)' : 
                state === 'merged' ? 'rgba(111, 66, 193, 0.3)' : 'rgba(203, 36, 49, 0.3)'
      }
    };
    
    return colors[type] || colors.commit;
  };

  const formatAttachmentDate = (dateString) => {
    const date = new Date(dateString);
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      absolute: format(date, 'MMM dd, yyyy HH:mm')
    };
  };

  const getRepositoryName = (attachment) => {
    if (attachment.repository) {
      return attachment.repository.fullName || `${attachment.repository.owner}/${attachment.repository.name}`;
    }
    return `${attachment.repoOwner}/${attachment.repoName}`;
  };

  const displayAttachments = maxDisplayCount ? attachments.slice(0, maxDisplayCount) : attachments;
  const remainingCount = maxDisplayCount && attachments.length > maxDisplayCount ? 
    attachments.length - maxDisplayCount : 0;

  // Loading state
  if (loading && attachments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3, color: '#8E8E93' }}>
        <Box className="github-attachment-loading" sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
          <GitHubIcon sx={{ fontSize: 48, opacity: 0.3 }} />
        </Box>
        <Typography variant="body2">
          Loading GitHub attachments...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <Box sx={{ textAlign: 'center', py: 3, color: '#FF6B6B' }}>
        <GitHubIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2" sx={{ mb: 1 }}>
          Error loading attachments
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
          {fetchError}
        </Typography>
        {autoFetch && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={fetchAttachments}
            sx={{ 
              color: '#58A6FF', 
              borderColor: '#58A6FF',
              '&:hover': { borderColor: '#7B9BFF', backgroundColor: 'rgba(88, 166, 255, 0.1)' }
            }}
          >
            Retry
          </Button>
        )}
      </Box>
    );
  }

  // Empty state
  if (attachments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3, color: '#8E8E93' }}>
        <GitHubIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">
          No GitHub attachments
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
          Attach issues, pull requests, commits, or branches to track related work
        </Typography>
        {autoFetch && (
          <Button 
            variant="text" 
            size="small" 
            onClick={fetchAttachments}
            sx={{ 
              color: '#58A6FF', 
              mt: 1,
              '&:hover': { backgroundColor: 'rgba(88, 166, 255, 0.1)' }
            }}
          >
            Refresh
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {showHeader && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <GitHubIcon sx={{ fontSize: 20, color: '#BDC1CA' }} />
          <Typography variant="h6" sx={{ color: '#BDC1CA' }}>
            GitHub Attachments
          </Typography>
          <Badge 
            badgeContent={attachments.length} 
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#8E44AD',
                color: 'white'
              }
            }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {displayAttachments.map((attachment, index) => {
          const colors = getAttachmentColor(attachment.type, attachment.state);
          const dateInfo = formatAttachmentDate(attachment.attachedAt);
          
          return (
            <Card
              key={attachment.id || index}
              sx={{
                backgroundColor: '#1E1F22',
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#25262A',
                  boxShadow: `0 2px 8px ${colors.bg}`,
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Icon and Type */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    color: colors.primary,
                    flexShrink: 0
                  }}>
                    {getAttachmentIcon(attachment.type)}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Title and State */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Link
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: '#BDC1CA',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          '&:hover': {
                            color: colors.primary,
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {attachment.title || attachment.name || 'Unknown'}
                      </Link>
                      {getStateIcon(attachment.type, attachment.state)}
                      <OpenInNewIcon sx={{ fontSize: 14, color: '#8E8E93', ml: 'auto' }} />
                    </Box>

                    {/* Repository and Type Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={getRepositoryName(attachment)}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(189, 193, 202, 0.1)',
                          color: '#BDC1CA',
                          border: '1px solid rgba(189, 193, 202, 0.2)'
                        }}
                      />
                      <Chip
                        label={attachment.type.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: colors.bg,
                          color: colors.primary,
                          border: `1px solid ${colors.border}`,
                          textTransform: 'capitalize'
                        }}
                      />
                      {attachment.state && (
                        <Chip
                          label={attachment.state}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: colors.bg,
                            color: colors.primary,
                            border: `1px solid ${colors.border}`,
                            textTransform: 'capitalize'
                          }}
                        />
                      )}
                    </Box>

                    {/* Description */}
                    {attachment.description && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#8E8E93',
                          display: 'block',
                          mb: 1,
                          lineHeight: 1.4
                        }}
                      >
                        {attachment.description.length > 150 
                          ? `${attachment.description.substring(0, 150)}...`
                          : attachment.description
                        }
                      </Typography>
                    )}

                    {/* Metadata */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', color: '#8E8E93' }}>
                      <Tooltip title={`Attached ${dateInfo.absolute}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 12 }} />
                          {dateInfo.relative}
                        </Box>
                      </Tooltip>
                      
                      {attachment.attachedBy && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 12 }} />
                          Attached by {attachment.attachedBy}
                        </Box>
                      )}

                      {/* GitHub specific metadata */}
                      {attachment.metadata?.author && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 12 }} />
                          {attachment.metadata.author}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, attachment)}
                      sx={{
                        color: '#8E8E93',
                        '&:hover': {
                          backgroundColor: 'rgba(189, 193, 202, 0.1)',
                          color: '#BDC1CA'
                        }
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {remainingCount > 0 && (
          <Card
            sx={{
              backgroundColor: '#1E1F22',
              border: '1px solid #4A4B4F',
              borderRadius: 2,
              borderStyle: 'dashed'
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                +{remainingCount} more attachment{remainingCount > 1 ? 's' : ''}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#2D2E31',
            border: '1px solid #4A4B4F',
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedAttachment?.url) {
              window.open(selectedAttachment.url, '_blank');
            }
            handleMenuClose();
          }}
          sx={{
            py: 1,
            px: 2,
            color: '#BDC1CA',
            '&:hover': {
              backgroundColor: 'rgba(142, 68, 173, 0.1)',
              color: '#8E44AD'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <OpenInNewIcon sx={{ fontSize: 18, color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary="Open in GitHub" />
        </MenuItem>
        
        <Divider sx={{ borderColor: '#4A4B4F' }} />
        
        <MenuItem
          onClick={handleRemoveAttachment}
          disabled={loading}
          sx={{
            py: 1,
            px: 2,
            color: '#BDC1CA',
            '&:hover': {
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              color: '#FF6B6B'
            },
            '&.Mui-disabled': {
              opacity: 0.5
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <DeleteIcon sx={{ fontSize: 18, color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary={loading ? "Removing..." : "Remove"} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GitHubAttachmentList;