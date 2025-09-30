import React, { useState, useEffect } from 'react';
import { boardsAPI } from '../../services/api';
import './PendingInvitations.css';

const PendingInvitations = ({ isOpen, onClose, onInvitationHandled }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchPendingInvitations();
    }
  }, [isOpen]);

  const fetchPendingInvitations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await boardsAPI.getPendingInvitations();
      setInvitations(response.data.invitations || []);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      setError(error.response?.data?.message || 'Failed to load pending invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationResponse = async (invitationId, response) => {
    setProcessingIds(prev => new Set([...prev, invitationId]));
    
    try {
      await boardsAPI.respondToInvitation(invitationId, response);
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      if (onInvitationHandled) {
        onInvitationHandled(invitationId, response);
      }
      
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert(error.response?.data?.message || `Failed to ${response} invitation`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
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
    <div className="pending-invitations-overlay">
      <div className="pending-invitations-modal">
        <div className="pending-invitations-header">
          <h3>Pending Invitations</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="pending-invitations-content">
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
                onClick={fetchPendingInvitations}
              >
                Try Again
              </button>
            </div>
          ) : invitations.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📬</span>
              <p>No pending invitations</p>
              <small>You're all caught up!</small>
            </div>
          ) : (
            <div className="invitations-list">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="invitation-item">
                  <div className="invitation-info">
                    <div className="board-name">
                      {invitation.boardName || 'Untitled Board'}
                    </div>
                    <div className="invitation-details">
                      <span className="invited-by">
                        Invited by: {invitation.boardOwnerEmail || 'Board Owner'}
                      </span>
                      <span className="invitation-date">
                        {formatDate(invitation.createdAt)}
                      </span>
                    </div>
                    {invitation.message && (
                      <div className="invitation-message">
                        "{invitation.message}"
                      </div>
                    )}
                  </div>
                  
                  <div className="invitation-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                      disabled={processingIds.has(invitation.id)}
                    >
                      {processingIds.has(invitation.id) ? (
                        <>
                          <span className="spinner"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="action-icon">✓</span>
                          Accept
                        </>
                      )}
                    </button>
                    
                    <button
                      className="decline-btn"
                      onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                      disabled={processingIds.has(invitation.id)}
                    >
                      {processingIds.has(invitation.id) ? (
                        <>
                          <span className="spinner"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="action-icon">✕</span>
                          Decline
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && invitations.length > 0 && (
          <div className="pending-invitations-footer">
            <p className="footer-note">
              💡 Accepting an invitation will add you to the board
            </p>
          </div>
        )}
        
        <div className="modal-footer">
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

export default PendingInvitations;