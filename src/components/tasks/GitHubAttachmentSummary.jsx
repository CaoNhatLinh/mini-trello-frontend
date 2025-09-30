import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  AccountTree as BranchIcon,
  Code as CommitIcon,
  BugReport as IssueIcon,
  CallMerge as PullRequestIcon,
  OpenInNew as OpenInNewIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import GitHubAttachmentIndicator from './GitHubAttachmentIndicator';

const GitHubAttachmentSummary = ({ 
  tasks = [], 
  showRecent = true,
  maxRecentItems = 5,
  onTaskClick
}) => {
  // Collect all GitHub attachments from all tasks
  const allAttachments = tasks.reduce((acc, task) => {
    if (task.githubAttachments && task.githubAttachments.length > 0) {
      task.githubAttachments.forEach(attachment => {
        acc.push({
          ...attachment,
          taskId: task.id ,
          taskTitle: task.title
        });
      });
    }
    return acc;
  }, []);

  // Sort by attached date (most recent first)
  const recentAttachments = allAttachments
    .sort((a, b) => new Date(b.attachedAt) - new Date(a.attachedAt))
    .slice(0, maxRecentItems);

  // Calculate statistics
  const stats = allAttachments.reduce((acc, attachment) => {
    acc.total++;
    acc.byType[attachment.type] = (acc.byType[attachment.type] || 0) + 1;
    
    if (attachment.state === 'open') acc.open++;
    if (attachment.state === 'closed') acc.closed++;
    if (attachment.state === 'merged') acc.merged++;
    
    return acc;
  }, {
    total: 0,
    byType: {},
    open: 0,
    closed: 0,
    merged: 0
  });

  const getTypeIcon = (type) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (type) {
      case 'branch': return <BranchIcon {...iconProps} />;
      case 'commit': return <CommitIcon {...iconProps} />;
      case 'issue': return <IssueIcon {...iconProps} />;
      case 'pull_request': return <PullRequestIcon {...iconProps} />;
      default: return <GitHubIcon {...iconProps} />;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      branch: '#28a745',
      commit: '#0366d6',
      issue: '#d73a49',
      pull_request: '#6f42c1'
    };
    return colors[type] || '#586069';
  };

  const handleTaskClick = (taskId) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    }
  };

  if (allAttachments.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: '#1E1F22',
          border: '1px solid #4A4B4F',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <GitHubIcon sx={{ fontSize: 48, color: '#4A4B4F', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#8E8E93' }}>
            No GitHub attachments found
          </Typography>
          <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mt: 0.5 }}>
            Start attaching GitHub items to tasks to see activity here
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        backgroundColor: '#1E1F22',
        border: '1px solid #4A4B4F',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <GitHubIcon sx={{ fontSize: 24, color: '#58A6FF' }} />
          <Typography variant="h6" sx={{ color: '#BDC1CA', fontWeight: 600 }}>
            GitHub Activity Summary
          </Typography>
          <Chip
            label={`${stats.total} total`}
            size="small"
            sx={{
              backgroundColor: 'rgba(88, 166, 255, 0.1)',
              color: '#58A6FF',
              border: '1px solid rgba(88, 166, 255, 0.3)',
              ml: 'auto'
            }}
          />
        </Box>

        {/* Statistics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#BDC1CA', mb: 1.5 }}>
            Attachment Types
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(stats.byType).map(([type, count]) => (
              <Chip
                key={type}
                icon={getTypeIcon(type)}
                label={`${count} ${type.replace('_', ' ')}`}
                size="small"
                sx={{
                  backgroundColor: `${getTypeColor(type)}20`,
                  color: getTypeColor(type),
                  border: `1px solid ${getTypeColor(type)}40`,
                  textTransform: 'capitalize',
                  '& .MuiChip-icon': {
                    color: getTypeColor(type)
                  }
                }}
              />
            ))}
          </Box>

          {/* State Statistics */}
          {(stats.open > 0 || stats.closed > 0 || stats.merged > 0) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#BDC1CA', mb: 1 }}>
                Status Overview
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {stats.open > 0 && (
                  <Chip
                    label={`${stats.open} open`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(40, 167, 69, 0.1)',
                      color: '#28a745',
                      border: '1px solid rgba(40, 167, 69, 0.3)'
                    }}
                  />
                )}
                {stats.closed > 0 && (
                  <Chip
                    label={`${stats.closed} closed`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(203, 36, 49, 0.1)',
                      color: '#cb2431',
                      border: '1px solid rgba(203, 36, 49, 0.3)'
                    }}
                  />
                )}
                {stats.merged > 0 && (
                  <Chip
                    label={`${stats.merged} merged`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(111, 66, 193, 0.1)',
                      color: '#6f42c1',
                      border: '1px solid rgba(111, 66, 193, 0.3)'
                    }}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Recent Activity */}
        {showRecent && recentAttachments.length > 0 && (
          <>
            <Divider sx={{ my: 2, borderColor: '#4A4B4F' }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 18, color: '#8E8E93' }} />
                <Typography variant="subtitle2" sx={{ color: '#BDC1CA' }}>
                  Recent Activity
                </Typography>
              </Box>
              
              <List sx={{ p: 0 }}>
                {recentAttachments.map((attachment, index) => (
                  <ListItem
                    key={`${attachment.taskId}-${attachment.id || index}`}
                    sx={{
                      px: 0,
                      py: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(189, 193, 202, 0.05)'
                      }
                    }}
                    onClick={() => handleTaskClick(attachment.taskId)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: `${getTypeColor(attachment.type)}20`,
                          color: getTypeColor(attachment.type)
                        }}
                      >
                        {getTypeIcon(attachment.type)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#BDC1CA',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            mb: 0.5
                          }}
                        >
                          {attachment.title || attachment.name || 'Unknown'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: '#8E8E93', display: 'block' }}
                          >
                            {attachment.taskTitle}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: '#8E8E93' }}
                          >
                            {formatDistanceToNow(new Date(attachment.attachedAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (attachment.url) {
                            window.open(attachment.url, '_blank');
                          }
                        }}
                        sx={{
                          color: '#8E8E93',
                          '&:hover': {
                            color: '#58A6FF',
                            backgroundColor: 'rgba(88, 166, 255, 0.1)'
                          }
                        }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubAttachmentSummary;