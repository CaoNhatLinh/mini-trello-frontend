import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
    });

    this.socket.on('disconnect', () => {
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Board events
  joinBoard(boardId) {
    if (this.socket) {
      this.socket.emit('join_board', boardId);
    }
  }

  leaveBoard(boardId) {
    if (this.socket) {
      this.socket.emit('leave_board', boardId);
    }
  }

  onBoardCreated(callback) {
    if (this.socket) {
      this.socket.on('board_created', callback);
    }
  }

  onBoardUpdate(callback) {
    if (this.socket) {
      this.socket.on('board_updated', callback);
    }
  }

  onBoardDeleted(callback) {
    if (this.socket) {
      this.socket.on('board_deleted', callback);
    }
  }

  onMemberJoined(callback) {
    if (this.socket) {
      this.socket.on('member_joined', callback);
    }
  }

  onMemberRemoved(callback) {
    if (this.socket) {
      this.socket.on('member_removed', callback);
    }
  }

  onRemovedFromBoard(callback) {
    if (this.socket) {
      this.socket.on('removed_from_board', callback);
    }
  }

  onBoardInvitation(callback) {
    if (this.socket) {
      this.socket.on('board_invitation', callback);
    }
  }

  // Card events
  onCardCreated(callback) {
    if (this.socket) {
      this.socket.on('card_created', callback);
    }
  }

  onCardUpdated(callback) {
    if (this.socket) {
      this.socket.on('card_updated', callback);
    }
  }

  onCardDeleted(callback) {
    if (this.socket) {
      this.socket.on('card_deleted', callback);
    }
  }

  onCardMoved(callback) {
    if (this.socket) {
      this.socket.on('card_moved', callback);
    }
  }

  onCardMembersAssigned(callback) {
    if (this.socket) {
      this.socket.on('card_members_assigned', callback);
    }
  }

  onCardCommentAdded(callback) {
    if (this.socket) {
      this.socket.on('card_comment_added', callback);
    }
  }

  // Task events
  onTaskCreated(callback) {
    if (this.socket) {
      this.socket.on('task_created', callback);
    }
  }

  onTaskUpdated(callback) {
    if (this.socket) {
      this.socket.on('task_updated', callback);
    }
  }

  onTaskDeleted(callback) {
    if (this.socket) {
      this.socket.on('task_deleted', callback);
    }
  }

  onTaskStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('task_status_changed', callback);
    }
  }

  onTaskAssigned(callback) {
    if (this.socket) {
      this.socket.on('task_assigned', callback);
    }
  }

  onTaskCommentAdded(callback) {
    if (this.socket) {
      this.socket.on('task_comment_added', callback);
    }
  }

  // User events
  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Enhanced task update events
  emitTaskUpdate(taskId, updates, boardId) {
    if (this.socket) {
      this.socket.emit('task_updated', {
        taskId,
        updates,
        boardId,
        timestamp: Date.now()
      });
    }
  }

  // Task reordering events
  onTasksReordered(callback) {
    if (this.socket) {
      this.socket.on('tasks_reordered', callback);
    }
  }

  emitTasksReordered(cardId, taskPositions, boardId) {
    if (this.socket) {
      this.socket.emit('tasks_reordered', {
        cardId,
        taskPositions,
        boardId,
        timestamp: Date.now()
      });
    }
  }

  // Card reordering events
  onCardsReordered(callback) {
    if (this.socket) {
      this.socket.on('cards_reordered', callback);
    }
  }

  emitCardsReordered(boardId, cardPositions) {
    if (this.socket) {
      this.socket.emit('cards_reordered', {
        boardId,
        cardPositions,
        timestamp: Date.now()
      });
    }
  }

  // Notification events
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  onNotificationUpdated(callback) {
    if (this.socket) {
      this.socket.on('notification_updated', callback);
    }
  }

  onNotificationDeleted(callback) {
    if (this.socket) {
      this.socket.on('notification_deleted', callback);
    }
  }

  onNotificationMarkedRead(callback) {
    if (this.socket) {
      this.socket.on('notification_marked_read', callback);
    }
  }

  markNotificationRead(notificationId) {
    if (this.socket) {
      this.socket.emit('mark_notification_read', notificationId);
    }
  }

  // GitHub attachment events
  onGitHubAttachmentAdded(callback) {
    if (this.socket) {
      this.socket.on('github_attachment_added', callback);
    }
  }

  onGitHubAttachmentRemoved(callback) {
    if (this.socket) {
      this.socket.on('github_attachment_removed', callback);
    }
  }

  emitGitHubAttachmentAdded(taskId, cardId, boardId, attachment) {
    if (this.socket) {
      this.socket.emit('github_attachment_added', {
        taskId,
        cardId,
        boardId,
        attachment,
        timestamp: Date.now()
      });
    }
  }

  emitGitHubAttachmentRemoved(taskId, cardId, boardId, attachmentId) {
    if (this.socket) {
      this.socket.emit('github_attachment_removed', {
        taskId,
        cardId,
        boardId,
        attachmentId,
        timestamp: Date.now()
      });
    }
  }

  // Generic methods
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();