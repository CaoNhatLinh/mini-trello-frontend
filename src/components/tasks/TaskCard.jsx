import React, { memo, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import './TaskCard.css';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreVertIcon,
  GitHub as GitHubIcon,
  AccountTree as BranchIcon,
  Code as CommitIcon,
  BugReport as IssueIcon,
  CallMerge as PullRequestIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { format, isAfter } from 'date-fns';
import TaskDetailDialog from './TaskDetailDialog';

const ITEM_TYPE = 'TASK';

const PRIORITY_COLORS = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

function TaskCard({ task, boardId, cardId, onClick, onDelete, onEdit, onTaskMove, onAttachmentUpdated, onTaskUpdate, boardMembers = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  if (!task) return null;

  const taskId = task.id || task._id;
  if (!taskId) {
    console.warn('TaskCard: Task has no valid ID:', task);
    return null;
  }

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    handleMenuClose();
    setTaskDetailOpen(true);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete && onDelete();
  };

  const handleCardClick = (event) => {
    event.stopPropagation();
    setTaskDetailOpen(true);
  };

  const handleTaskSave = (updatedTaskData) => {
    if (onTaskUpdate) {
      onTaskUpdate(task.id || task._id, updatedTaskData);
    }
    setTaskDetailOpen(false);
  };

  const getGitHubIcon = (type) => {
    switch (type) {
      case 'branch': return <BranchIcon sx={{ fontSize: 12 }} />;
      case 'commit': return <CommitIcon sx={{ fontSize: 12 }} />;
      case 'issue': return <IssueIcon sx={{ fontSize: 12 }} />;
      case 'pull_request': return <PullRequestIcon sx={{ fontSize: 12 }} />;
      default: return <LinkIcon sx={{ fontSize: 12 }} />;
    }
  };
  const dragConfig = useMemo(() => ({
    type: ITEM_TYPE,
    item: {
      type: 'task',
      id: taskId,
      taskId: taskId,
      cardId: task.cardId,
      title: task.title,
      sourceCardId: task.cardId,
      position: task.position || 0
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.type === 'task-drop' && onTaskMove) {
        const { taskId, sourceCardId, position: originalPosition } = item;
        const { cardId: targetCardId, position: newPosition } = dropResult;
        onTaskMove(taskId, sourceCardId, targetCardId, newPosition !== undefined ? newPosition : originalPosition);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [taskId, task.cardId, task.title, task.position, onTaskMove]);

  const [{ isDragging }, drag] = useDrag(dragConfig);

  const isOverdue = useMemo(() => 
    task.dueDate && isAfter(new Date(), new Date(task.dueDate)), 
    [task.dueDate]
  );
  
  const hasAssignees = useMemo(() => 
    task.assignedTo && task.assignedTo.length > 0, 
    [task.assignedTo]
  );

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#4A4B4F';
    }
  };

  return (
    <Card
      ref={drag}
      onClick={handleCardClick}
      className="task-card"
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: '#0E0F05',
        borderRadius: 3,
        border: isOverdue ? '2px solid #E74C3C' : '1px solid #2D2E31',
        borderLeftWidth: 5,
        borderLeftColor: task.priority ? getPriorityColor() : '#4A4B4F',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(142,68,173,0.3)',
          borderColor: '#8E44AD',
          borderLeftColor: task.priority ? getPriorityColor() : '#4A4B4F',
        },
      }}
    >


      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: task.description ? 1.5 : 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: '#BDC1CA',
              fontSize: '0.95rem',
              lineHeight: 1.4,
              wordBreak: 'break-word',
              flex: 1,
              pr: 1
            }}
          >
            {task.title}
          </Typography>
          
          {(onEdit || onDelete) && (
            <IconButton
              size="small"
              onClick={handleMenuClick}
              className="task-menu-button"
              sx={{
                p: 0.25,
                color: '#BDC1CA',
                '&:hover': {
                  backgroundColor: 'rgba(189, 193, 202, 0.1)',
                }
              }}
            >
              <MoreVertIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        {task.description && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#8E8E93',
              fontSize: '0.8rem',
              lineHeight: 1.4,
              display: 'block',
              mb: 1.5,
              fontStyle: 'italic'
            }}
          >
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description
            }
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {task.dueDate && (
            <Chip
              icon={<CalendarIcon sx={{ fontSize: '12px !important' }} />}
              label={format(new Date(task.dueDate), 'MMM dd')}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 500,
                backgroundColor: isOverdue ? '#2D1B2E' : '#1A1D29',
                color: isOverdue ? '#FF6B6B' : '#7B9BFF',
                border: isOverdue ? '1px solid #E74C3C' : '1px solid #4A5FC7',
                '& .MuiChip-icon': {
                  color: isOverdue ? '#FF6B6B' : '#7B9BFF'
                }
              }}
            />
          )}
        </Box>

        {hasAssignees && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box className="avatar-stack" sx={{ display: 'flex', alignItems: 'center' }}>
              {task.assignedTo.slice(0, 3).map((member, index) => (
                <Avatar
                  key={member.id || index}
                  src={member.photoURL}
                  title={member.displayName || member.name || member.email || 'Unknown User'}
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: '0.7rem',
                    backgroundColor: '#8E44AD',
                    border: '2px solid #0E0F05',
                    marginLeft: index > 0 ? '-10px' : 0,
                    zIndex: 3 - index,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    '&:hover': {
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(142, 68, 173, 0.4)'
                    }
                  }}
                >
                  {member.displayName ? member.displayName.charAt(0).toUpperCase() : 
                   member.name ? member.name.charAt(0).toUpperCase() : 
                   member.email ? member.email.charAt(0).toUpperCase() : '?'}
                </Avatar>
              ))}
              {task.assignedTo.length > 3 && (
                <Box
                  title={`+${task.assignedTo.length - 3} more members`}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: '#4A4B4F',
                    border: '2px solid #0E0F05',
                    marginLeft: '-10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    color: '#BDC1CA',
                    fontWeight: 600,
                    zIndex: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#8E44AD',
                      transform: 'scale(1.1)',
                      zIndex: 10
                    }
                  }}
                >
                  +{task.assignedTo.length - 3}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {isOverdue && (
          <Box 
            className="overdue-indicator"
            sx={{ 
              position: 'absolute',
              top: -5,
              right: -5,
              background: 'linear-gradient(45deg, #E74C3C, #FF6B6B)',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(231, 76, 60, 0.4)',
              border: '2px solid #0E0F05'
            }}
          >
            !
          </Box>
        )}

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            sx: {
              backgroundColor: '#2D2E31',
              border: '1px solid #4A4B4F',
              borderRadius: 2,
              minWidth: 160,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {[
            onEdit && (
              <MenuItem 
                key="edit"
                onClick={handleEdit}
                sx={{
                  py: 1,
                  px: 2,
                  color: '#BDC1CA',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    color: '#8E44AD'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EditIcon sx={{ fontSize: 18, color: 'inherit' }} />
                </ListItemIcon>
                <ListItemText primary="Edit" />
              </MenuItem>
            ),
            onDelete && (
              <MenuItem 
                key="delete"
                onClick={handleDelete}
                sx={{
                  py: 1,
                  px: 2,
                  color: '#BDC1CA',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    color: '#FF6B6B'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <DeleteIcon sx={{ fontSize: 18, color: 'inherit' }} />
                </ListItemIcon>
                <ListItemText primary="Delete" />
              </MenuItem>
            )
          ].filter(Boolean)}
        </Menu>

        <TaskDetailDialog
          task={task}
          boardId={boardId}
          cardId={cardId}
          isOpen={taskDetailOpen}
          onClose={() => setTaskDetailOpen(false)}
          onSave={handleTaskSave}
          onAttachmentUpdated={onAttachmentUpdated}
          boardMembers={boardMembers}
        />
      </CardContent>
    </Card>
  );
}

export default memo(TaskCard);