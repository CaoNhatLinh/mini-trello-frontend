import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import socketService from "../services/socketService";
import { useBoardStore, useCardStore, useTaskStore } from "../utils/store";

export function useRealTimeUpdates(boardId) {
  const { token, isAuthenticated, user } = useAuth();
  const { fetchBoards, fetchBoardById } = useBoardStore();
  const { fetchCards, cards, updateCardDirect, addCard, removeCard } =
    useCardStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    socketService.connect(token);

    if (boardId) {
      socketService.joinBoard(boardId);
    }

    socketService.onBoardCreated((newBoard) => {
      fetchBoards();
    });

    socketService.onBoardUpdate((updatedBoard) => {
      if (boardId && updatedBoard.id === boardId) {
        fetchBoardById(boardId);
      } else {
        fetchBoards();
      }
    });

    socketService.onBoardDeleted((data) => {
      fetchBoards();
    });

    socketService.onMemberJoined((data) => {
      if (boardId && data.boardId === boardId) {
        fetchBoardById(boardId);
      }
    });

    socketService.onMemberRemoved((data) => {
      if (boardId && data.boardId === boardId) {
        fetchBoardById(boardId);
      }
    });

    socketService.onRemovedFromBoard((data) => {
      fetchBoards();
    });

    socketService.onCardCreated((newCard) => {
      if (boardId && newCard.boardId === boardId) {
        const currentUserId = user?.uid || user?.id;
        const cardCreatorId = newCard.createdBy || newCard.ownerId;

        if (currentUserId !== cardCreatorId) {
          addCard(newCard);
        }
      }
    });

    socketService.onCardUpdated((updatedCard) => {
      if (boardId && updatedCard.boardId === boardId) {
        const existingCard = cards.find((c) => c.id === updatedCard.id);
        if (existingCard) {
          updateCardDirect(updatedCard.id, updatedCard);
        } else {
          fetchCards(boardId);
        }
      }
    });

    socketService.onCardDeleted((data) => {
      if (boardId && data.boardId === boardId) {
        removeCard(data.cardId);
      }
    });

    socketService.onCardMoved((updatedCard) => {
      if (boardId && updatedCard.boardId === boardId) {
        updateCardDirect(updatedCard.id , updatedCard);
      }
    });

    socketService.onCardMembersAssigned((data) => {
      if (boardId && data.card.boardId === boardId) {
        updateCardDirect(
          data.card.id  || data.cardId,
          data.card
        );
      }
    });

    socketService.onTaskCreated((data) => {
      if (boardId && data.boardId === boardId) {
        // Use task store instead of refetching all cards
        const { addTask } = useTaskStore.getState();
        if (data.task) {
          addTask(data.task);
        } else {
          // Fallback to refreshing cards if task data is missing
          fetchCards(boardId);
        }
      }
    });

    socketService.onTaskUpdated((data) => {
      if (boardId && data.boardId === boardId) {
        const { updateTaskDirect, tasks } = useTaskStore.getState();

        if (data.task && (data.task.id )) {
          const taskId = data.task.id ;

          const existingTask = tasks.find((t) => (t.id ) === taskId);

          if (existingTask) {
            const mergedTask = {
              ...existingTask,
              ...data.task,
              assignedTo:
                data.task.assignedTo !== undefined
                  ? data.task.assignedTo
                  : existingTask.assignedTo,
              dueDate:
                data.task.dueDate !== undefined
                  ? data.task.dueDate
                  : existingTask.dueDate,
              priority:
                data.task.priority !== undefined
                  ? data.task.priority
                  : existingTask.priority,
              labels:
                data.task.labels !== undefined
                  ? data.task.labels
                  : existingTask.labels,
              attachments:
                data.task.attachments !== undefined
                  ? data.task.attachments
                  : existingTask.attachments,
              githubAttachments:
                data.task.githubAttachments !== undefined
                  ? data.task.githubAttachments
                  : existingTask.githubAttachments,
            };

            updateTaskDirect(taskId, mergedTask);
          } else {
            updateTaskDirect(taskId, data.task);
          }
        }
      }
    });

    socketService.onTaskDeleted((data) => {
      if (boardId && data.boardId === boardId) {
        const { removeTask } = useTaskStore.getState();
        if (data.taskId) {
          removeTask(data.taskId);
        } else {
          fetchCards(boardId);
        }
      }
    });

    socketService.onTaskStatusChanged((data) => {
      if (boardId && data.boardId === boardId) {
        fetchCards(boardId);
      }
    });

    socketService.onTaskAssigned((data) => {
      if (boardId && data.boardId === boardId) {
        fetchCards(boardId);
      }
    });

    socketService.onTasksReordered((data) => {
      if (boardId && data.boardId === boardId) {
        const { reorderTasks } = useTaskStore.getState();
        if (data.taskPositions && data.cardId) {
          try {
            const { tasks } = useTaskStore.getState();
            data.taskPositions.forEach(({ taskId, position }) => {
              const task = tasks.find((t) => (t.id ) === taskId);
              if (task) {
                useTaskStore
                  .getState()
                  .updateTaskDirect(taskId, { ...task, position });
              }
            });
          } catch (error) {
            console.warn(
              "Failed to update task positions locally, falling back to refresh:",
              error
            );
            fetchCards(boardId);
          }
        } else {
          fetchCards(boardId);
        }
      }
    });

    socketService.onCardsReordered((data) => {
      if (boardId && data.boardId === boardId) {
        fetchCards(boardId);
      }
    });

    socketService.onUserJoined((user) => {
    });

    socketService.onUserLeft((user) => {
    });

    return () => {
      if (boardId) {
        socketService.leaveBoard(boardId);
      }
      socketService.removeAllListeners();
    };
  }, [
    isAuthenticated,
    token,
    boardId,
    fetchBoards,
    fetchBoardById,
    fetchCards,
    cards,
    updateCardDirect,
    addCard,
    removeCard,
    user,
  ]);

  return socketService;
}
