import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendVerificationCode: (data) => api.post('/auth/send-verification-code', data),
  verifyCode: (data) => api.post('/auth/verify-code', data),
  githubAuth: () => api.get('/auth/github'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  getToken: () => localStorage.getItem('token'),
};

// Boards API
export const boardsAPI = {
  getBoards: () => api.get('/boards'),
  getBoardById: (id) => api.get(`/boards/${id}`),
  createBoard: (boardData) => api.post('/boards', boardData),
  updateBoard: (id, boardData) => api.put(`/boards/${id}`, boardData),
  deleteBoard: (id) => api.delete(`/boards/${id}`),
  
  // Board Members
  getBoardMembers: (boardId) => api.get(`/boards/${boardId}/members`),
  removeMember: (boardId, memberId) => api.delete(`/boards/${boardId}/members/${memberId}`),
  leaveBoard: (boardId) => api.post(`/boards/${boardId}/leave`),
  
  // Board Invitations
  inviteUser: (boardId, email) => api.post(`/boards/${boardId}/invite`, { email }),
  getInvitationStatus: (invitationId) => api.get(`/boards/invitation/${invitationId}/status`),
  respondToInvitation: (invitationId, status) => api.post('/boards/invitation/respond', { invitationId, status }),
  getBoardInvitations: (boardId) => api.get(`/boards/${boardId}/invitations`),
  getPendingInvitations: () => api.get('/boards/invitations/pending'),
  cancelInvitation: (boardId, invitationId) => api.delete(`/boards/${boardId}/invitations/${invitationId}`),
};

// Cards API  
export const cardsAPI = {
  getCards: (boardId) => api.get(`/boards/${boardId}/cards`), // Use boards route for GET
  getCardById: (id) => api.get(`/cards/${id}`),
  createCard: (cardData) => api.post(`/boards/${cardData.boardId}/cards`, cardData), // Use boards route for POST
  updateCard: (boardId, id, cardData) => api.put(`/boards/${boardId}/cards/${id}`, cardData),
  deleteCard: (boardId, id) => api.delete(`/boards/${boardId}/cards/${id}`),
  reorderCards: (boardId, cardPositions) => api.patch(`/boards/${boardId}/cards/reorder`, { cardPositions }),
};
  
// Tasks API - New Board-Card-Task Structure
export const tasksAPI = {
  // 1. Get all tasks for a card
  getTasks: (boardId, cardId) => api.get(`/boards/${boardId}/cards/${cardId}/tasks`),
  
  // 2. Create new task in a card
  createTask: (boardId, cardId, taskData) => api.post(`/boards/${boardId}/cards/${cardId}/tasks`, taskData),
  
  // 3. Get specific task details
  getTaskById: (boardId, cardId, taskId) => api.get(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`),
  
  // 4. Update task details
  updateTask: (boardId, cardId, taskId, taskData) => api.put(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`, taskData),
  
  // 5. Delete task
  deleteTask: (boardId, cardId, taskId) => api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`),
  
  // Task Member Assignment
  assignMemberToTask: (boardId, cardId, taskId, memberId) => api.post(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign-member`, { memberId }),
  getTaskMembers: (boardId, cardId, taskId) => api.get(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/members`),
  removeMemberFromTask: (boardId, cardId, taskId, memberId) => api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/members/${memberId}`),
  
  // GitHub Integration
  attachGithubToTask: (boardId, cardId, taskId, githubData) => api.post(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments`, githubData),
  attachGitHubItem: (boardId, cardId, taskId, attachmentData) => api.post(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments`, attachmentData),
  getTaskGithubAttachments: (boardId, cardId, taskId) => api.get(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments`),
  removeGithubAttachment: (boardId, cardId, taskId, attachmentId) => api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments/${attachmentId}`),
};

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
};

// GitHub API
export const githubAPI = {
  // GitHub Auth
  connectGithub: () => api.get('/auth/github'),
  githubCallback: (code) => api.post('/auth/github/callback', { code }),
  // Repository Info
  getRepositoryInfo: (owner, repo) => api.get(`/github/repositories/${owner}/${repo}/github-info`),
  // GitHub Resource APIs
  getRepositories: () => api.get('/github/repositories'),
  getBranches: (owner, repo) => api.get(`/github/repositories/${owner}/${repo}/branches`),
  getCommits: (owner, repo, branch = 'main') => api.get(`/github/repositories/${owner}/${repo}/commits?branch=${branch}`),
  getIssues: (owner, repo) => api.get(`/github/repositories/${owner}/${repo}/issues`),
  getPullRequests: (owner, repo) => api.get(`/github/repositories/${owner}/${repo}/pulls`),
  // Paginated GitHub Resource APIs
  getBranchesPaginated: (owner, repo, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/github/repositories/${owner}/${repo}/branches/paginated?${queryString}`);
  },
  getCommitsPaginated: (owner, repo, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/github/repositories/${owner}/${repo}/commits/paginated?${queryString}`);
  },
  getIssuesPaginated: (owner, repo, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/github/repositories/${owner}/${repo}/issues/paginated?${queryString}`);
  },
  getPullRequestsPaginated: (owner, repo, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/github/repositories/${owner}/${repo}/pulls/paginated?${queryString}`);
  },
  attachToTask: (boardId, cardId, taskId, attachmentData) => 
    api.post(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments`, attachmentData),
  getTaskAttachments: (boardId, cardId, taskId) => 
    api.get(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments`),
  removeAttachment: (boardId, cardId, taskId, attachmentId) => 
    api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments/${attachmentId}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (limit) => api.get(`/notifications${limit ? `?limit=${limit}` : ''}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default api;