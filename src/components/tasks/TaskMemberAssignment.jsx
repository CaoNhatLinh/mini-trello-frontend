import React, { useState, useEffect } from 'react';
import { tasksAPI, boardsAPI } from '../../services/api';
import './TaskMemberAssignment.css';

const TaskMemberAssignment = ({ 
  boardId, 
  cardId, 
  taskId, 
  isOpen, 
  onClose, 
  onMembersUpdated 
}) => {
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    if (isOpen && boardId && cardId && taskId) {
      fetchData();
    }
  }, [isOpen, boardId, cardId, taskId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [boardMembersRes, taskMembersRes] = await Promise.all([
        boardsAPI.getBoardMembers(boardId),
        tasksAPI.getTaskMembers(boardId, cardId, taskId)
      ]);

      const allBoardMembers = boardMembersRes.data.members || [];
      const currentTaskMembers = taskMembersRes.data.members || [];

      setAssignedMembers(currentTaskMembers);

      const assignedIds = new Set(currentTaskMembers.map(member => member.id || member.uid));
      const available = allBoardMembers.filter(member => 
        !assignedIds.has(member.id || member.uid)
      );
      setAvailableMembers(available);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMember = async (member) => {
    const memberId = member.id || member.uid;
    setProcessingIds(prev => new Set([...prev, memberId]));
    
    try {
      await tasksAPI.assignMemberToTask(boardId, cardId, taskId, memberId);
      
      setAssignedMembers(prev => [...prev, member]);
      setAvailableMembers(prev => prev.filter(m => (m.id || m.uid) !== memberId));
      
      if (onMembersUpdated) {
        onMembersUpdated([...assignedMembers, member]);
      }
      
    } catch (error) {
      console.error('Error assigning member:', error);
      alert(error.response?.data?.message || 'Failed to assign member');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const handleRemoveMember = async (member) => {
    const memberId = member.id || member.uid;
    
    if (!confirm(`Remove ${member.name || member.email} from this task?`)) {
      return;
    }

    setProcessingIds(prev => new Set([...prev, memberId]));
    
    try {
      await tasksAPI.removeMemberFromTask(boardId, cardId, taskId, memberId);
      
      setAssignedMembers(prev => prev.filter(m => (m.id || m.uid) !== memberId));
      setAvailableMembers(prev => [...prev, member]);
      
      if (onMembersUpdated) {
        onMembersUpdated(assignedMembers.filter(m => (m.id || m.uid) !== memberId));
      }
      
    } catch (error) {
      console.error('Error removing member:', error);
      alert(error.response?.data?.message || 'Failed to remove member from task');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const getMemberDisplayInfo = (member) => ({
    id: member.id || member.uid,
    name: member.name || member.displayName || 'Unknown',
    email: member.email,
    avatar: member.photoURL || member.avatar_url || null,
    initials: (member.name || member.displayName || member.email || '?')
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  });

  if (!isOpen) return null;

  return (
    <div className="task-member-assignment-overlay">
      <div className="task-member-assignment-modal">
        <div className="assignment-header">
          <h3>Manage Task Members</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="assignment-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading members...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchData}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Assigned Members Section */}
              <div className="members-section">
                <h4 className="section-title">
                  Assigned Members ({assignedMembers.length})
                </h4>
                
                {assignedMembers.length === 0 ? (
                  <div className="empty-section">
                    <span className="empty-icon">👤</span>
                    <p>No members assigned to this task</p>
                  </div>
                ) : (
                  <div className="members-list">
                    {assignedMembers.map((member) => {
                      const memberInfo = getMemberDisplayInfo(member);
                      const isProcessing = processingIds.has(memberInfo.id);
                      
                      return (
                        <div key={memberInfo.id} className="member-item assigned">
                          <div className="member-info">
                            <div className="member-avatar">
                              {memberInfo.avatar ? (
                                <img src={memberInfo.avatar} alt={memberInfo.name} />
                              ) : (
                                <div className="avatar-initials">
                                  {memberInfo.initials}
                                </div>
                              )}
                            </div>
                            <div className="member-details">
                              <div className="member-name">{memberInfo.name}</div>
                              <div className="member-email">{memberInfo.email}</div>
                            </div>
                          </div>
                          
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveMember(member)}
                            disabled={isProcessing}
                            title="Remove from task"
                          >
                            {isProcessing ? (
                              <span className="spinner-small"></span>
                            ) : (
                              '×'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="members-section">
                <h4 className="section-title">
                  Available Members ({availableMembers.length})
                </h4>
                
                {availableMembers.length === 0 ? (
                  <div className="empty-section">
                    <span className="empty-icon">✨</span>
                    <p>All board members are assigned to this task</p>
                  </div>
                ) : (
                  <div className="members-list">
                    {availableMembers.map((member) => {
                      const memberInfo = getMemberDisplayInfo(member);
                      const isProcessing = processingIds.has(memberInfo.id);
                      
                      return (
                        <div key={memberInfo.id} className="member-item available">
                          <div className="member-info">
                            <div className="member-avatar">
                              {memberInfo.avatar ? (
                                <img src={memberInfo.avatar} alt={memberInfo.name} />
                              ) : (
                                <div className="avatar-initials">
                                  {memberInfo.initials}
                                </div>
                              )}
                            </div>
                            <div className="member-details">
                              <div className="member-name">{memberInfo.name}</div>
                              <div className="member-email">{memberInfo.email}</div>
                            </div>
                          </div>
                          
                          <button
                            className="assign-btn"
                            onClick={() => handleAssignMember(member)}
                            disabled={isProcessing}
                            title="Assign to task"
                          >
                            {isProcessing ? (
                              <span className="spinner-small"></span>
                            ) : (
                              '+'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="assignment-footer">
          <button 
            className="close-footer-btn"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskMemberAssignment;