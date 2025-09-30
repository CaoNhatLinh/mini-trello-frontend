import React, { useState } from 'react';
import { boardsAPI } from '../../services/api';
import './InviteMember.css';

const InviteMember = ({ boardId, isOpen, onClose, onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await boardsAPI.inviteUser(boardId, email.trim());
      setSuccess('Invitation sent successfully!');
      setEmail('');
      
      if (onInviteSent) {
        onInviteSent(response.data);
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="invite-member-overlay">
      <div className="invite-member-modal">
        <div className="invite-member-header">
          <h3>Invite Member to Board</h3>
          <button 
            className="close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invite-member-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="email-input"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="invite-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMember;