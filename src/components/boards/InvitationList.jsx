import React, { useState, useEffect } from 'react';
import { boardsAPI } from '../../services/api';
import './InvitationList.css';

const InvitationList = ({ boardId, isOpen, onClose }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && boardId) {
      fetchInvitations();
    }
  }, [isOpen, boardId]);

  const fetchInvitations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await boardsAPI.getBoardInvitations(boardId);
      setInvitations(response.data.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError(error.response?.data?.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    if (!confirm('Are you sure you want to decline this invitation? This will mark it as declined instead of canceling it.')) {
      return;
    }

    try {
      await boardsAPI.respondToInvitation(invitationId, 'declined');
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'declined', updatedAt: new Date().toISOString() }
            : inv
        )
      );
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert(error.response?.data?.message || 'Failed to decline invitation');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending', icon: '⏳' },
      accepted: { class: 'status-accepted', text: 'Accepted', icon: '✅' },
      declined: { class: 'status-declined', text: 'Declined', icon: '❌' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled', icon: '🚫' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="invitation-list-overlay">
      <div className="invitation-list-modal">
        <div className="invitation-list-header">
          <h3>Board Invitations</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="invitation-list-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading invitations...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchInvitations}
              >
                Try Again
              </button>
            </div>
          ) : invitations.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📧</span>
              <p>No invitations found</p>
              <small>Invite members to see them here</small>
            </div>
          ) : (
            <div className="invitations-list">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="invitation-item">
                  <div className="invitation-info">
                    <div className="invitation-email">
                      {invitation.memberEmail}
                    </div>
                    <div className="invitation-meta">
                      <span className="invitation-date">
                        Sent {formatDate(invitation.createdAt)}
                      </span>
                      {invitation.updatedAt !== invitation.createdAt && (
                        <span className="invitation-updated">
                          Updated {formatDate(invitation.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="invitation-actions">
                    {getStatusBadge(invitation.status)}
                    {invitation.status === 'pending' && (
                      <button
                        className="decline-invitation-btn"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        title="Decline invitation"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="invitation-list-footer">
          <button 
            className="close-footer-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationList;