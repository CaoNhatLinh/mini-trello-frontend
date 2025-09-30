import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  AccountTree as BranchIcon,
  Code as CommitIcon,
  BugReport as IssueIcon,
  CallMerge as PullRequestIcon,
} from '@mui/icons-material';

const GitHubAttachmentIndicator = ({ 
  attachments = [], 
  maxVisible = 3,
  showTotal = true,
  variant = 'default', // 'default', 'compact', 'minimal'
  onClick
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const getAttachmentIcon = (type) => {
    const iconProps = { sx: { fontSize: variant === 'minimal' ? 12 : 14 } };
    
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

  const getAttachmentColor = (type, state) => {
    const colors = {
      branch: { 
        bg: 'rgba(40, 167, 69, 0.15)', 
        text: '#28a745', 
        border: 'rgba(40, 167, 69, 0.4)',
        hoverBg: 'rgba(40, 167, 69, 0.25)'
      },
      commit: { 
        bg: 'rgba(3, 102, 214, 0.15)', 
        text: '#0366d6', 
        border: 'rgba(3, 102, 214, 0.4)',
        hoverBg: 'rgba(3, 102, 214, 0.25)'
      },
      issue: { 
        bg: state === 'open' ? 'rgba(40, 167, 69, 0.15)' : 'rgba(203, 36, 49, 0.15)', 
        text: state === 'open' ? '#28a745' : '#cb2431', 
        border: state === 'open' ? 'rgba(40, 167, 69, 0.4)' : 'rgba(203, 36, 49, 0.4)',
        hoverBg: state === 'open' ? 'rgba(40, 167, 69, 0.25)' : 'rgba(203, 36, 49, 0.25)'
      },
      pull_request: { 
        bg: state === 'open' ? 'rgba(40, 167, 69, 0.15)' : 
            state === 'merged' ? 'rgba(111, 66, 193, 0.15)' : 'rgba(203, 36, 49, 0.15)',
        text: state === 'open' ? '#28a745' : 
              state === 'merged' ? '#6f42c1' : '#cb2431',
        border: state === 'open' ? 'rgba(40, 167, 69, 0.4)' : 
                state === 'merged' ? 'rgba(111, 66, 193, 0.4)' : 'rgba(203, 36, 49, 0.4)',
        hoverBg: state === 'open' ? 'rgba(40, 167, 69, 0.25)' : 
                 state === 'merged' ? 'rgba(111, 66, 193, 0.25)' : 'rgba(203, 36, 49, 0.25)'
      }
    };
    
    return colors[type] || colors.commit;
  };

  // Group attachments by type
  const typeCount = attachments.reduce((acc, attachment) => {
    acc[attachment.type] = (acc[attachment.type] || 0) + 1;
    return acc;
  }, {});

  const handleAttachmentClick = (attachment, event) => {
    event.stopPropagation();
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  const handleIndicatorClick = (event) => {
    event.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  if (variant === 'minimal') {
    return (
      <Tooltip title={`${attachments.length} GitHub attachment${attachments.length > 1 ? 's' : ''}`}>
        <Badge 
          badgeContent={attachments.length} 
          color="primary"
          sx={{
            cursor: onClick ? 'pointer' : 'default',
            '& .MuiBadge-badge': {
              backgroundColor: '#58A6FF',
              color: 'white',
              fontSize: '0.65rem',
              height: 16,
              minWidth: 16
            }
          }}
          onClick={handleIndicatorClick}
        >
          <GitHubIcon sx={{ fontSize: 16, color: '#58A6FF' }} />
        </Badge>
      </Tooltip>
    );
  }

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="GitHub Attachments">
          <Chip
            icon={<GitHubIcon sx={{ fontSize: '12px !important' }} />}
            label={attachments.length}
            size="small"
            onClick={handleIndicatorClick}
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              backgroundColor: 'rgba(88, 166, 255, 0.15)',
              color: '#58A6FF',
              border: '1px solid rgba(88, 166, 255, 0.3)',
              cursor: onClick ? 'pointer' : 'default',
              '&:hover': onClick ? {
                backgroundColor: 'rgba(88, 166, 255, 0.25)',
                borderColor: 'rgba(88, 166, 255, 0.5)'
              } : {},
              '& .MuiChip-icon': {
                color: '#58A6FF'
              }
            }}
          />
        </Tooltip>
      </Box>
    );
  }

  // Default variant - show type breakdown
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {showTotal && (
        <Tooltip title="View all GitHub attachments">
          <Chip
            icon={<GitHubIcon sx={{ fontSize: '12px !important' }} />}
            label={`${attachments.length} attachment${attachments.length > 1 ? 's' : ''}`}
            size="small"
            onClick={handleIndicatorClick}
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 500,
              backgroundColor: 'rgba(88, 166, 255, 0.1)',
              color: '#58A6FF',
              border: '1px solid rgba(88, 166, 255, 0.3)',
              cursor: onClick ? 'pointer' : 'default',
              '&:hover': onClick ? {
                backgroundColor: 'rgba(88, 166, 255, 0.2)',
                borderColor: 'rgba(88, 166, 255, 0.5)'
              } : {},
              '& .MuiChip-icon': {
                color: '#58A6FF'
              }
            }}
          />
        </Tooltip>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {Object.entries(typeCount).slice(0, maxVisible).map(([type, count]) => {
          const attachment = attachments.find(att => att.type === type);
          const colors = getAttachmentColor(type, attachment?.state);
          
          return (
            <Tooltip 
              key={type} 
              title={`${count} ${type.replace('_', ' ')}${count > 1 ? 's' : ''} - Click to open`}
            >
              <Chip
                icon={getAttachmentIcon(type)}
                label={count}
                size="small"
                onClick={(e) => handleAttachmentClick(attachment, e)}
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  minWidth: 36,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: colors.hoverBg,
                    borderColor: colors.border,
                    transform: 'scale(1.05)'
                  },
                  '& .MuiChip-icon': {
                    color: colors.text,
                    fontSize: '12px !important'
                  },
                  '& .MuiChip-label': {
                    fontWeight: 600
                  }
                }}
              />
            </Tooltip>
          );
        })}

        {Object.keys(typeCount).length > maxVisible && (
          <Tooltip title={`${Object.keys(typeCount).length - maxVisible} more types`}>
            <Chip
              label={`+${Object.keys(typeCount).length - maxVisible}`}
              size="small"
              onClick={handleIndicatorClick}
              sx={{
                height: 18,
                fontSize: '0.65rem',
                backgroundColor: 'rgba(189, 193, 202, 0.1)',
                color: '#8E8E93',
                border: '1px solid rgba(189, 193, 202, 0.3)',
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? {
                  backgroundColor: 'rgba(189, 193, 202, 0.2)',
                  borderColor: 'rgba(189, 193, 202, 0.5)'
                } : {}
              }}
            />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default GitHubAttachmentIndicator;