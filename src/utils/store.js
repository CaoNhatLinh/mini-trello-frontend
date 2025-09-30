import { create } from 'zustand';
import { boardsAPI, cardsAPI, tasksAPI } from '../services/api';

// Boards Store
export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all boards
  fetchBoards: async () => {
    set({ loading: true, error: null });
    try {
      const response = await boardsAPI.getBoards();
      const boards = response.data?.boards || response.data || [];
      set({ boards: Array.isArray(boards) ? boards : [], loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch boards', loading: false, boards: [] });
    }
  },

  // Fetch board by ID
  fetchBoardById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await boardsAPI.getBoardById(id);
      set({ currentBoard: response.data.board, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch board', loading: false });
    }
  },

  // Create new board
  createBoard: async (boardData) => {
    set({ loading: true, error: null });
    try {
      const response = await boardsAPI.createBoard(boardData);
      const newBoard = response.data;
      set((state) => ({
        boards: [...state.boards, newBoard],
        loading: false,
      }));
      return newBoard;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create board', loading: false });
      throw error;
    }
  },

  // Update board
  updateBoard: async (id, boardData) => {
    set({ loading: true, error: null });
    try {
      const response = await boardsAPI.updateBoard(id, boardData);
      const updatedBoard = response.data;
      set((state) => ({
        boards: state.boards.map((board) =>
          board.id === id ? updatedBoard : board
        ),
        currentBoard: state.currentBoard?.id === id ? updatedBoard : state.currentBoard,
        loading: false,
      }));
      return updatedBoard;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update board', loading: false });
      throw error;
    }
  },

  // Delete board
  deleteBoard: async (id) => {
    set({ loading: true, error: null });
    try {
      await boardsAPI.deleteBoard(id);
      set((state) => ({
        boards: state.boards.filter((board) => board.id !== id),
        currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete board', loading: false });
      throw error;
    }
  },

  // Set current board
  setCurrentBoard: (board) => set({ currentBoard: board }),
}));

// Cards Store
export const useCardStore = create((set, get) => ({
  cards: [],
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch cards for a board
  // Fetch cards (lists/columns) for a board
  fetchCards: async (boardId) => {
    set({ loading: true, error: null });
    try {
      const response = await cardsAPI.getCards(boardId);
      const cards = response.data?.cards || response.data || [];
      set({ cards: Array.isArray(cards) ? cards : [], loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch lists', loading: false });
    }
  },

  // Create new card
  createCard: async (cardData) => {
    set({ loading: true, error: null });
    try {
      const response = await cardsAPI.createCard(cardData);
      const newCard = response.data?.card || response.data;
      set((state) => ({
        cards: [...state.cards, newCard],
        loading: false,
      }));
      return newCard;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create card', loading: false });
      throw error;
    }
  },

  // Update card
  updateCard: async (boardId, id, cardData) => {
    set({ loading: true, error: null });
    try {
      const response = await cardsAPI.updateCard(boardId, id, cardData);
      const updatedCard = response.data?.card || response.data;
      set((state) => ({
        cards: state.cards.map((card) =>
          (card.id ) === id ? updatedCard : card
        ),
        loading: false,
      }));
      return updatedCard;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update card', loading: false });
      throw error;
    }
  },

  // Delete card
  deleteCard: async (boardId, id) => {
    set({ loading: true, error: null });
    try {
      await cardsAPI.deleteCard(boardId, id);
      set((state) => ({
        cards: state.cards.filter((card) => (card.id) !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete card', loading: false });
      throw error;
    }
  },

  // Update card position (for drag and drop)
  updateCardPosition: (cardId, newStatus, newPosition) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        (card.id ) === cardId
          ? { ...card, status: newStatus, position: newPosition }
          : card
      ),
    }));
  },

  // Update card directly (for real-time updates)
  updateCardDirect: (cardId, updatedCard) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        (card.id) === cardId ? { ...card, ...updatedCard } : card
      ),
    }));
  },

  // Add new card directly (for real-time updates)
  addCard: (newCard) => {
    set((state) => ({
      cards: [...state.cards, newCard],
    }));
  },

  // Remove card directly (for real-time updates)
  removeCard: (cardId) => {
    set((state) => ({
      cards: state.cards.filter((card) => (card.id) !== cardId),
    }));
  },

  // Reorder cards with position support
  reorderCards: async (boardId, cardPositions) => {
    try {
      await cardsAPI.reorderCards(boardId, cardPositions);
      
      // Update local state
      set((state) => {
        const updatedCards = [...state.cards];
        cardPositions.forEach(({ cardId, position }) => {
          const cardIndex = updatedCards.findIndex(card => card.id === cardId);
          if (cardIndex !== -1) {
            updatedCards[cardIndex] = { ...updatedCards[cardIndex], position };
          }
        });
        
        // Sort by position
        updatedCards.sort((a, b) => (a.position || 0) - (b.position || 0));
        
        return { cards: updatedCards };
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to reorder cards' });
      throw error;
    }
  },
}));

// Tasks Store
export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Get tasks for a specific card
  getTasksForCard: (cardId) => {
    const state = get();
    const tasks = Array.isArray(state.tasks) ? state.tasks : [];
    return tasks.filter(task => task.cardId === cardId).sort((a, b) => (a.position || 0) - (b.position || 0));
  },

  // Fetch tasks for a card
  fetchTasks: async (cardId, boardId) => {
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.getTasks(boardId, cardId);
      set((state) => {
        const existingTasks = Array.isArray(state.tasks) ? state.tasks.filter(task => task.cardId !== cardId) : [];
        const newTasks = Array.isArray(response.data) ? response.data : [];
        const updatedTasks = [...existingTasks, ...newTasks];
        return {
          tasks: updatedTasks,
          loading: false
        };
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch tasks', loading: false });
    }
  },

  // Create new task
  createTask: async ( taskData) => {
    
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.createTask(taskData.boardId, taskData.cardId, taskData);
      const newTask = response.data;
      set((state) => ({
        tasks: [...state.tasks, newTask],
        loading: false,
      }));
      return newTask;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create task', loading: false });
      throw error;
    }
  },

  // Update task with new API structure
  updateTask: async (boardId, cardId, taskId, taskData) => {
  set({ loading: true, error: null });
  try {
    const response = await tasksAPI.updateTask(boardId, cardId, taskId, taskData);
    const updatedTask = response.data;
    
    set((state) => {
      const currentTasks = Array.isArray(state.tasks) ? state.tasks : [];
      
      if (taskData.targetCardId && taskData.targetCardId !== cardId) {
        updatedTask.cardId = taskData.targetCardId;
      }

      const existingTask = currentTasks.find(t => (t.id) === taskId);

      let finalTask;
      if (existingTask) {
        finalTask = {
          ...existingTask,
          ...updatedTask,
          assignedTo: updatedTask.assignedTo || existingTask.assignedTo,
          dueDate: updatedTask.dueDate || existingTask.dueDate,
          priority: updatedTask.priority || existingTask.priority,
          labels: updatedTask.labels || existingTask.labels,
          attachments: updatedTask.attachments || existingTask.attachments,
          githubAttachments: updatedTask.githubAttachments || existingTask.githubAttachments,
        };
      } else {
        finalTask = updatedTask;
      }
      
      const updatedTasks = currentTasks.map((task) =>
        (  task.id) === taskId ? finalTask : task
      );
      
      return {
        tasks: updatedTasks,
        loading: false,
      };
    });
    
    return updatedTask;
  } catch (error) {
    set({ error: error.response?.data?.message || 'Failed to update task', loading: false });
    throw error;
  }
},

  deleteTask: async (boardId, cardId, taskId) => {
    set({ loading: true, error: null });
    try {
      await tasksAPI.deleteTask(boardId, cardId, taskId);
      set((state) => ({
        tasks: state.tasks.filter((task) => (task.id) !== taskId),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete task', loading: false });
      throw error;
    }
  },

  moveTask: async (boardId, taskId, targetCardId, newPosition) => {
    try {
      const currentState = get();
      const task = currentState.tasks.find(t => (t.id) === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      const updatedTask = await currentState.updateTask(boardId, task.cardId, taskId, {
        targetCardId: targetCardId,
        position: newPosition,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        completed: task.completed
      });
      
      return updatedTask;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to move task' });
      throw error;
    }
  },

  reorderTasks: async (boardId, cardId, taskPositions) => {
    try {
      await tasksAPI.reorderTasks(boardId, cardId, taskPositions);
      set((state) => {
        const updatedTasks = [...state.tasks];
        taskPositions.forEach(({ taskId, position }) => {
          const taskIndex = updatedTasks.findIndex(task => (task.id) === taskId);
          if (taskIndex !== -1) {
            updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], position };
          }
        });
        
        updatedTasks.sort((a, b) => {
          if (a.cardId !== b.cardId) return 0;
          return (a.position || 0) - (b.position || 0);
        });
        
        return { tasks: updatedTasks };
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to reorder tasks' });
      throw error;
    }
  },

  updateTaskDirect: (taskId, updatedTask) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        (task.id) === taskId ? updatedTask : task
      ),
    }));
  },

  addTask: (newTask) => {
    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
  },

  removeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => (task.id) !== taskId),
    }));
  },
}));

export const useInvitationStore = create((set, get) => ({
  pendingInvitations: [],
  boardInvitations: {},
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchPendingInvitations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await boardsAPI.getPendingInvitations();
      const invitations = response.data?.invitations || [];
      set({ pendingInvitations: invitations, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch pending invitations', loading: false });
    }
  },

  fetchBoardInvitations: async (boardId) => {
    set({ loading: true, error: null });
    try {
      const response = await boardsAPI.getBoardInvitations(boardId);
      const invitations = response.data?.invitations || [];
      set((state) => ({
        boardInvitations: {
          ...state.boardInvitations,
          [boardId]: invitations
        },
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch board invitations', loading: false });
    }
  },

  sendInvitation: async (boardId, email) => {
    set({ loading: true, error: null });
    try {
      const response = await boardsAPI.inviteUser(boardId, email);
      const newInvitation = response.data;
      
      set((state) => ({
        boardInvitations: {
          ...state.boardInvitations,
          [boardId]: [...(state.boardInvitations[boardId] || []), newInvitation]
        },
        loading: false
      }));
      
      return newInvitation;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to send invitation', loading: false });
      throw error;
    }
  },

  respondToInvitation: async (invitationId, response) => {
    set({ loading: true, error: null });
    try {
      await boardsAPI.respondToInvitation(invitationId, response);
      
      set((state) => ({
        pendingInvitations: state.pendingInvitations.filter(inv => inv.id !== invitationId),
        loading: false
      }));
      
    } catch (error) {
      set({ error: error.response?.data?.message || `Failed to ${response} invitation`, loading: false });
      throw error;
    }
  },

  cancelInvitation: async (boardId, invitationId) => {
    set({ loading: true, error: null });
    try {
      await boardsAPI.cancelInvitation(boardId, invitationId);
      
      set((state) => ({
        boardInvitations: {
          ...state.boardInvitations,
          [boardId]: (state.boardInvitations[boardId] || []).filter(inv => inv.id !== invitationId)
        },
        loading: false
      }));
      
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to cancel invitation', loading: false });
      throw error;
    }
  },

  getBoardInvitations: (boardId) => {
    const state = get();
    return state.boardInvitations[boardId] || [];
  },
}));

// Task Members Store
export const useTaskMemberStore = create((set, get) => ({
  taskMembers: {}, 
  boardMembers: {}, 
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchBoardMembers: async (boardId) => {
    set({ loading: true, error: null });
    try {
      const response = await boardsAPI.getBoardMembers(boardId);
      const members = response.data?.members || [];
      set((state) => ({
        boardMembers: {
          ...state.boardMembers,
          [boardId]: members
        },
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch board members', loading: false });
    }
  },

  fetchTaskMembers: async (boardId, cardId, taskId) => {
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.getTaskMembers(boardId, cardId, taskId);
      const members = response.data?.members || [];
      set((state) => ({
        taskMembers: {
          ...state.taskMembers,
          [taskId]: members
        },
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch task members', loading: false });
    }
  },

  assignMemberToTask: async (boardId, cardId, taskId, memberId) => {
    set({ loading: true, error: null });
    try {
      await tasksAPI.assignMemberToTask(boardId, cardId, taskId, memberId);
      
      const state = get();
      const boardMembers = state.boardMembers[boardId] || [];
      const member = boardMembers.find(m => (m.id || m.uid) === memberId);
      
      if (member) {
        set((state) => ({
          taskMembers: {
            ...state.taskMembers,
            [taskId]: [...(state.taskMembers[taskId] || []), member]
          },
          loading: false
        }));
      }
      
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to assign member to task', loading: false });
      throw error;
    }
  },

  removeMemberFromTask: async (boardId, cardId, taskId, memberId) => {
    set({ loading: true, error: null });
    try {
      await tasksAPI.removeMemberFromTask(boardId, cardId, taskId, memberId);
      
      set((state) => ({
        taskMembers: {
          ...state.taskMembers,
          [taskId]: (state.taskMembers[taskId] || []).filter(m => (m.id || m.uid) !== memberId)
        },
        loading: false
      }));
      
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to remove member from task', loading: false });
      throw error;
    }
  },

  getTaskMembers: (taskId) => {
    const state = get();
    return state.taskMembers[taskId] || [];
  },

  // Get board members for a specific board
  getBoardMembers: (boardId) => {
    const state = get();
    return state.boardMembers[boardId] || [];
  },
}));

export const useGitHubStore = create((set, get) => ({
  repositories: {}, 
  taskAttachments: {}, 
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch repository information
  fetchRepositoryInfo: async (repositoryId) => {
    set({ loading: true, error: null });
    try {
      const [owner, repo] = repositoryId.split('/');
      const response = await githubAPI.getRepositoryInfo(owner, repo);
      const repoInfo = response.data?.githubInfo;
      
      set((state) => ({
        repositories: {
          ...state.repositories,
          [repositoryId]: repoInfo
        },
        loading: false
      }));
      
      return repoInfo;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch repository information', loading: false });
      throw error;
    }
  },

  fetchTaskAttachments: async (boardId, cardId, taskId) => {
    set({ loading: true, error: null });
    try {
      const response = await githubAPI.getTaskAttachments(boardId, cardId, taskId);
      const attachments = response.data?.githubAttachments || [];
      
      set((state) => ({
        taskAttachments: {
          ...state.taskAttachments,
          [taskId]: attachments
        },
        loading: false
      }));
      
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch GitHub attachments', loading: false });
    }
  },

  attachToTask: async (boardId, cardId, taskId, attachmentData) => {
    set({ loading: true, error: null });
    try {
      const response = await githubAPI.attachToTask(boardId, cardId, taskId, attachmentData);
      const newAttachment = response.data?.attachment;
      
      set((state) => ({
        taskAttachments: {
          ...state.taskAttachments,
          [taskId]: [...(state.taskAttachments[taskId] || []), newAttachment]
        },
        loading: false
      }));
      
      return newAttachment;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to attach GitHub item', loading: false });
      throw error;
    }
  },

  removeAttachment: async (boardId, cardId, taskId, attachmentId) => {
    set({ loading: true, error: null });
    try {
      await githubAPI.removeAttachment(boardId, cardId, taskId, attachmentId);
      
      set((state) => ({
        taskAttachments: {
          ...state.taskAttachments,
          [taskId]: (state.taskAttachments[taskId] || []).filter(att => att.id !== attachmentId)
        },
        loading: false
      }));
      
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to remove GitHub attachment', loading: false });
      throw error;
    }
  },

  getRepositoryInfo: (repositoryId) => {
    const state = get();
    return state.repositories[repositoryId] || null;
  },

  getTaskAttachments: (taskId) => {
    const state = get();
    return state.taskAttachments[taskId] || [];
  },
}));