import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Alert,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useBoardStore, useCardStore, useTaskStore, useInvitationStore, useTaskMemberStore } from '../utils/store';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';
import BoardHeader from '../components/boards/BoardHeader';
import ListDialog from '../components/boards/ListDialog';
import TaskDetailDialog from '../components/tasks/TaskDetailDialog';
import BoardColumns from '../components/boards/BoardColumns';
import InviteMember from '../components/boards/InviteMember';
import InvitationList from '../components/boards/InvitationList';
import BoardSettings from '../components/boards/BoardSettings';
import EditBoardDialog from '../components/boards/EditBoardDialog';
import DeleteBoardDialog from '../components/boards/DeleteBoardDialog';

function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    currentBoard,
    loading: boardLoading,
    error: boardError,
    fetchBoardById,
    clearError: clearBoardError,
  } = useBoardStore();

  const {
    boardMembers,
    fetchBoardMembers,
    getBoardMembers,
  } = useTaskMemberStore();

  const {
    cards,
    loading: cardsLoading,
    error: cardsError,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    updateCardPosition,
    clearError: clearCardsError,
  } = useCardStore();

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksForCard,
    clearError: clearTasksError,
  } = useTaskStore();

  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [TaskDetailDialogOpen, setTaskDetailDialogOpen] = useState(false);
  const [quickAddTaskOpen, setQuickAddTaskOpen] = useState(null); 
  const [editingList, setEditingList] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [invitationListOpen, setInvitationListOpen] = useState(false);
  
  const [boardSettingsOpen, setBoardSettingsOpen] = useState(false);
  
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  
  const [listForm, setListForm] = useState({
    name: '',
    description: '',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: [],
    dueDate: '',
  });

  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const handleAddTask = useCallback((cardId) => {
    setSelectedCard(cardId);
    setQuickAddTaskOpen(cardId);
    setQuickTaskTitle('');
  }, []);

  const handleQuickTaskCancel = useCallback(() => {
    setQuickAddTaskOpen(null);
    setQuickTaskTitle('');
  }, []);

  const handleTaskMove = useCallback(async (taskId, sourceCardId, targetCardId, newPosition) => {
    
    if (!taskId) {
      console.error('taskId is undefined/null:', taskId);
      return;
    }
    
    try {
      const sourceTasks = getTasksForCard(sourceCardId);
      const task = sourceTasks.find(t => (t.id) === taskId);
      
      if (task) {
        let calculatedPosition = newPosition;
        if (calculatedPosition === undefined) {
          const targetTasks = getTasksForCard(targetCardId);
          calculatedPosition = targetTasks.length;
        }
        
        await moveTask(boardId, taskId, targetCardId, calculatedPosition);
        socketService.emitTaskUpdate(taskId, {
          cardId: targetCardId,
          position: calculatedPosition,
          sourceCardId
        }, boardId);
        
      } else {
        console.error('Task not found in source card');
      }
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  }, [boardId, getTasksForCard, moveTask]);

  const handleInviteMember = useCallback(() => {
    setInviteMemberOpen(true);
  }, []);

  const handleInviteMemberClose = useCallback(() => {
    setInviteMemberOpen(false);
  }, []);


  const handleInvitationListClose = useCallback(() => {
    setInvitationListOpen(false);
  }, []);

  const handleInvitationSent = useCallback((invitation) => {
    if (invitationListOpen) {
    }
  }, [invitationListOpen]);

  const handleBoardSettingsClose = useCallback(() => {
    setBoardSettingsOpen(false);
  }, []);

  const handleEditBoard = useCallback((board) => {
    setEditBoardOpen(true);
  }, []);

  const handleDeleteBoard = useCallback((board) => {
    setDeleteBoardOpen(true);
  }, []);

  const handleLeaveBoard = useCallback(async (board) => {
    try {
      const confirmed = window.confirm(`Are you sure you want to leave "${board.name}"?`);
      if (confirmed) {
        const { leaveBoard } = useBoardStore.getState();
        await leaveBoard( board.id);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to leave board:', error);
      setError('Failed to leave board. Please try again.');
    }
  }, [navigate]);

  const handleBoardSave = useCallback(async (boardData) => {
    try {
      const { updateBoard } = useBoardStore.getState();
      await updateBoard(boardId, boardData);
      setEditBoardOpen(false);
      fetchBoardById(boardId);
    } catch (error) {
      console.error('Failed to update board:', error);
      throw error;
    }
  }, [boardId, fetchBoardById]);

  const handleBoardDeleteConfirm = useCallback(async (board) => {
    try {
      const { deleteBoard } = useBoardStore.getState();
      await deleteBoard(boardId);
      setDeleteBoardOpen(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete board:', error);
      throw error;
    }
  }, [boardId, navigate]);
  const handleAttachmentUpdated = useCallback(() => {
    if (boardId) {
      fetchBoardById(boardId);
      fetchCards(boardId);
    }
  }, [boardId, fetchBoardById, fetchCards]);

  const loading = useMemo(() => boardLoading || cardsLoading, [boardLoading, cardsLoading]);
  const error = useMemo(() => boardError || cardsError, [boardError, cardsError]);

  useRealTimeUpdates(boardId);

  useEffect(() => {
    if (boardId) {
      fetchBoardById(boardId);
      fetchCards(boardId);
      fetchBoardMembers(boardId); 
    }
  }, [boardId, fetchBoardById, fetchCards, fetchBoardMembers]);

  useEffect(() => {
    if (cards && cards.length > 0) {
      cards.forEach(card => {
        const cardId = card.id ;
        if (cardId) {
          fetchTasks(cardId, boardId); 
        }
      });
    }
  }, [cards, fetchTasks, boardId]); 

  const handleOpenListDialog = (card = null) => {
    if (card) {
      setEditingList(card);
      setListForm({
        name: card.name,
        description: card.description || '',
      });
    } else {
      setEditingList(null);
      setListForm({
        name: '',
        description: '',
      });
    }
    setListDialogOpen(true);
    clearCardsError();
  };

  const handleCloseListDialog = () => {
    setListDialogOpen(false);
    setEditingList(null);
  };



  const handleOpenTaskDetailDialog = (task) => {
    setEditingTask(task);
    setSelectedCard(task.cardId);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      assignedTo: task.assignedTo || [],
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setTaskDetailDialogOpen(true);
    clearTasksError();
  };

  const handleCloseTaskDetailDialog = () => {
    setTaskDetailDialogOpen(false);
    setEditingTask(null);
    setSelectedCard(null);
  };

  const handleListFormChange = (e) => {
    const { name, value } = e.target;
    setListForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({
      ...prev,
      [name]: name === 'assignedTo' ? [value] : value,
    }));
  };

  const handleListSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    try {
      const listData = {
        ...listForm,
        boardId,
        position: cards.length,
      };

      if (editingList) {
        const cardId = editingList.id;
        await updateCard(boardId, cardId, listData);
      } else {
        await createCard(listData);
      }
      handleCloseListDialog();
    } catch (error) {
    }
  }, [listForm, boardId, cards.length, editingList, updateCard, createCard, handleCloseListDialog]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...taskForm,
        cardId: selectedCard,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
      };
      if (editingTask) {
        await updateTask(boardId, selectedCard, editingTask.id, taskData);
      } else {
        await createTask(boardId, selectedCard, taskData);
      }
      handleCloseTaskDetailDialog();
    } catch (error) {
    }
  };

  const handleTaskUpdate = useCallback(async (taskId, taskData) => {
    try {
      const task = tasks.find(t => (t.id ) === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      const cardId = task.cardId;
      await updateTask(boardId, cardId, taskId, taskData);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, [boardId, tasks, updateTask]);

  const handleDeleteTask = useCallback(async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const task = tasks.find(t => (t.id ) === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      const cardId = task.cardId;
      await deleteTask(boardId, cardId, taskId);
      socketService.emitTaskUpdate(taskId, { deleted: true }, boardId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [boardId, tasks, deleteTask]);

  const handleDeleteCard = useCallback(async (card) => {
    const cardName = card.name || card.title || 'this card';
    if (!window.confirm(`Are you sure you want to delete "${cardName}"? This will also delete all tasks in this card.`)) {
      return;
    }

    try {
      const cardId = card.id;
      await deleteCard(boardId, cardId);
      
      socketService.emit('card_deleted', { 
        cardId, 
        boardId, 
        deletedBy: user?.uid || user?.id 
      });
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  }, [boardId, deleteCard, user]);

  if (loading && !currentBoard) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#0E0F05',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <CircularProgress sx={{ color: '#BDC1CA' }} />
      </Box>
    );
  }

  if (!currentBoard) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#b3b3adff' 
      }}>
        <Alert 
          severity="error" 
          sx={{ backgroundColor: '#2D1B2E', color: '#BDC1CA', border: '1px solid #8E44AD' }}
        >
          Board not found
        </Alert>
      </Box>
    );
  }

  const handleQuickTaskSubmit = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    try {
      const taskData = {
        title: quickTaskTitle.trim(),
        cardId: quickAddTaskOpen,
        boardId: boardId,
        description: '',
        priority: 'medium',
        assignedTo: [],
        dueDate: null,
      };

      await createTask(taskData);
      setQuickAddTaskOpen(null);
      setQuickTaskTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{  backgroundColor: '#edededff', minHeight: '100vh' }}>
        {/* Board Header */}
        <BoardHeader 
          board={currentBoard}
          currentUser={user}
          onInviteMember={handleInviteMember}
          onEditBoard={handleEditBoard}
          onDeleteBoard={handleDeleteBoard}
          onLeaveBoard={handleLeaveBoard}
        />

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => {
              clearBoardError();
              clearCardsError();
            }}
          >
            {error}
          </Alert>
        )}

        {/* Board Columns */}
        {cards && cards.length > 0 ? (
          <BoardColumns
            cards={cards}
            getTasksForCard={getTasksForCard}
            onTaskClick={handleOpenTaskDetailDialog}
            onEditTask={handleOpenTaskDetailDialog}
            onDeleteTask={handleDeleteTask}
            onTaskUpdate={handleTaskUpdate}
            onAddTask={handleAddTask}
            onAddList={() => handleOpenListDialog()}
            onEditCard={handleOpenListDialog}
            onDeleteCard={handleDeleteCard}
            boardId={boardId}
            onAttachmentUpdated={handleAttachmentUpdated}
            quickAddOpen={quickAddTaskOpen}
            quickTaskTitle={quickTaskTitle}
            onQuickTaskChange={setQuickTaskTitle}
            onQuickTaskSubmit={handleQuickTaskSubmit}
            onQuickTaskCancel={handleQuickTaskCancel}
            onTaskMove={handleTaskMove}
            boardMembers={getBoardMembers(boardId) || []}
          />
        ) : (
          <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
            <Box sx={{ minWidth: 280 }}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  textAlign: 'center',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">
                  {cardsLoading ? 'Loading lists...' : 'No lists found. Create your first list!'}
                </Typography>
              </Paper>
            </Box>

            {/* Add another list button */}
            <Box sx={{ minWidth: 280 }}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  },
                }}
                onClick={() => handleOpenListDialog()}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  + Add another list
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}

        {/* Create/Edit List Dialog */}
        <ListDialog
          open={listDialogOpen}
          onClose={handleCloseListDialog}
          editingList={editingList}
          listForm={listForm}
          onFormChange={handleListFormChange}
          onSubmit={handleListSubmit}
          loading={cardsLoading}
        />

        {/* Create/Edit Task Dialog */}
        <TaskDetailDialog
          open={TaskDetailDialogOpen}
          onClose={handleCloseTaskDetailDialog}
          editingTask={editingTask}
          taskForm={taskForm}
          onFormChange={handleTaskFormChange}
          onSubmit={handleTaskSubmit}
          loading={tasksLoading}
          cards={cards}
          selectedCard={selectedCard}
          boardId={boardId}
        />

        {/* Invite Member Dialog */}
        <InviteMember
          boardId={boardId}
          isOpen={inviteMemberOpen}
          onClose={handleInviteMemberClose}
          onInviteSent={handleInvitationSent}
        />

        {/* Board Invitations List */}
        <InvitationList
          boardId={boardId}
          isOpen={invitationListOpen}
          onClose={handleInvitationListClose}
        />

        {/* Board Settings Dialog */}
        <BoardSettings
          board={currentBoard}
          isOpen={boardSettingsOpen}
          onClose={handleBoardSettingsClose}
          onUpdate={handleBoardSave}
          onDelete={handleBoardDeleteConfirm}
        />

        {/* Edit Board Dialog */}
        <EditBoardDialog
          open={editBoardOpen}
          onClose={() => setEditBoardOpen(false)}
          board={currentBoard}
          onSave={handleBoardSave}
        />

        {/* Delete Board Dialog */}
        <DeleteBoardDialog
          open={deleteBoardOpen}
          onClose={() => setDeleteBoardOpen(false)}
          board={currentBoard}
          onDelete={handleBoardDeleteConfirm}
        />
      </Box>
    </DndProvider>
  );
}

export default BoardView;