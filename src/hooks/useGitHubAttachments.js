import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../services/api';
import socketService from '../services/socketService';

export const useGitHubAttachments = (boardId, cardId, taskId) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttachments = useCallback(async () => {
    if (!boardId || !cardId || !taskId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await tasksAPI.getTaskGithubAttachments(boardId, cardId, taskId);
      
      if (response.data.success) {
        setAttachments(response.data.githubAttachments || []);
      } else {
        setAttachments([]);
      }
    } catch (err) {
      console.error('Failed to fetch GitHub attachments:', err);
      setError(err.response?.data?.message || 'Failed to fetch GitHub attachments');
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [boardId, cardId, taskId]);

  const addAttachment = useCallback(async (attachmentData) => {
    if (!boardId || !cardId || !taskId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await tasksAPI.attachGithubToTask(boardId, cardId, taskId, attachmentData);
      
      if (response.data.success) {
        await fetchAttachments();
        return response.data.attachment;
      }
      
      return null;
    } catch (err) {
      console.error('Failed to add GitHub attachment:', err);
      setError(err.response?.data?.message || 'Failed to add GitHub attachment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [boardId, cardId, taskId, fetchAttachments]);

  const removeAttachment = useCallback(async (attachmentId) => {
    if (!boardId || !cardId || !taskId || !attachmentId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await tasksAPI.removeGithubAttachment(boardId, cardId, taskId, attachmentId);
      
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      
      return true;
    } catch (err) {
      console.error('Failed to remove GitHub attachment:', err);
      setError(err.response?.data?.message || 'Failed to remove GitHub attachment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [boardId, cardId, taskId]);

  useEffect(() => {
    if (!boardId || !taskId) return;

    const handleAttachmentAdded = (data) => {
      if (data.taskId === taskId && data.boardId === boardId) {
        fetchAttachments();
      }
    };

    const handleAttachmentRemoved = (data) => {
      if (data.taskId === taskId && data.boardId === boardId) {
        setAttachments(prev => prev.filter(att => att.id !== data.attachmentId));
      }
    };

    if (socketService.socket) {
      socketService.socket.on('github_attachment_added', handleAttachmentAdded);
      socketService.socket.on('github_attachment_removed', handleAttachmentRemoved);
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('github_attachment_added', handleAttachmentAdded);
        socketService.socket.off('github_attachment_removed', handleAttachmentRemoved);
      }
    };
  }, [boardId, taskId, fetchAttachments]);
  return {
    attachments,
    loading,
    error,
    fetchAttachments,
    addAttachment,
    removeAttachment,
    clearError: () => setError(null)
  };
};

export default useGitHubAttachments;
