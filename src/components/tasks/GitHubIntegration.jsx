import React, { useState, useEffect } from 'react';
import { githubAPI, tasksAPI } from '../../services/api';
import './GitHubIntegration.css';

const GitHubIntegration = ({ 
  boardId, 
  cardId, 
  taskId, 
  isOpen, 
  onClose, 
  onAttachmentUpdated 
}) => {
  const [attachments, setAttachments] = useState([]);
  const [repositoryId, setRepositoryId] = useState('');
  const [repositoryInfo, setRepositoryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repoLoading, setRepoLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('attachments'); // 'attachments' or 'browse'
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (isOpen && boardId && cardId && taskId) {
      fetchAttachments();
    }
  }, [isOpen, boardId, cardId, taskId]);

  const fetchAttachments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await githubAPI.getTaskAttachments(boardId, cardId, taskId);
      setAttachments(response.data.githubAttachments || []);
    } catch (error) {
      console.error('Error fetching GitHub attachments:', error);
      setError(error.response?.data?.message || 'Failed to load GitHub attachments');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositoryInfo = async () => {
    if (!repositoryId.trim()) {
      alert('Please enter a repository ID (e.g., owner/repo)');
      return;
    }

    setRepoLoading(true);
    setError('');
    
    try {
      const [owner, repo] = repositoryId.trim().split('/');
      const response = await githubAPI.getRepositoryInfo(owner, repo);
      setRepositoryInfo(response.data.githubInfo);
      setActiveTab('browse');
    } catch (error) {
      console.error('Error fetching repository info:', error);
      setError(error.response?.data?.message || 'Failed to load repository information');
      setRepositoryInfo(null);
    } finally {
      setRepoLoading(false);
    }
  };

  const handleAttachItem = async (item, type) => {
    try {
      const attachmentData = {
        type,
        repoOwner: repositoryInfo.owner || repositoryId.split('/')[0],
        repoName: repositoryInfo.repoName || repositoryId.split('/')[1],
        itemNumber: item.number || item.issueNumber || item.pullNumber,
        url: item.html_url || item.url || `https://github.com/${repositoryId}/${type === 'commit' ? 'commit' : type === 'pull_request' ? 'pull' : 'issues'}/${item.number || item.sha}`,
        title: item.title || item.message || `${type} #${item.number}`,
        description: item.body || item.message || ''
      };

      await githubAPI.attachToTask(boardId, cardId, taskId, attachmentData);
      
      // Refresh attachments
      await fetchAttachments();
      
      if (onAttachmentUpdated) {
        onAttachmentUpdated();
      }
      
      // Remove from selected items
      setSelectedItems(prev => prev.filter(selected => 
        !(selected.type === type && selected.id === (item.id || item.sha))
      ));
      
    } catch (error) {
      console.error('Error attaching GitHub item:', error);
      alert(error.response?.data?.message || 'Failed to attach GitHub item');
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    if (!confirm('Remove this GitHub attachment?')) {
      return;
    }

    try {
      await githubAPI.removeAttachment(boardId, cardId, taskId, attachmentId);
      
      // Update local state
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      
      if (onAttachmentUpdated) {
        onAttachmentUpdated();
      }
      
    } catch (error) {
      console.error('Error removing GitHub attachment:', error);
      alert(error.response?.data?.message || 'Failed to remove GitHub attachment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getItemIcon = (type, state) => {
    const icons = {
      issue: state === 'open' ? '🟢' : '🔴',
      pull_request: state === 'open' ? '🟢' : state === 'merged' ? '🟣' : '🔴',
      commit: '📝'
    };
    return icons[type] || '📎';
  };

  const renderRepositoryBrowser = () => {
    if (!repositoryInfo) return null;

    return (
      <div className="repository-browser">
        <div className="repo-info">
          <h4>📁 {repositoryId}</h4>
        </div>

        <div className="repo-sections">
          {/* Issues */}
          {repositoryInfo.issues && repositoryInfo.issues.length > 0 && (
            <div className="repo-section">
              <h5>Issues ({repositoryInfo.issues.length})</h5>
              <div className="items-list">
                {repositoryInfo.issues.slice(0, 10).map((issue) => (
                  <div key={issue.issueNumber} className="item-row">
                    <div className="item-info">
                      <span className="item-icon">{getItemIcon('issue', issue.state)}</span>
                      <div className="item-details">
                        <div className="item-title">#{issue.issueNumber} {issue.title}</div>
                        <div className="item-meta">{issue.state} • {formatDate(issue.createdAt)}</div>
                      </div>
                    </div>
                    <button
                      className="attach-btn"
                      onClick={() => handleAttachItem(issue, 'issue')}
                      title="Attach this issue"
                    >
                      📎
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pull Requests */}
          {repositoryInfo.pulls && repositoryInfo.pulls.length > 0 && (
            <div className="repo-section">
              <h5>Pull Requests ({repositoryInfo.pulls.length})</h5>
              <div className="items-list">
                {repositoryInfo.pulls.slice(0, 10).map((pr) => (
                  <div key={pr.pullNumber} className="item-row">
                    <div className="item-info">
                      <span className="item-icon">{getItemIcon('pull_request', pr.state)}</span>
                      <div className="item-details">
                        <div className="item-title">#{pr.pullNumber} {pr.title}</div>
                        <div className="item-meta">{pr.state} • {formatDate(pr.createdAt)}</div>
                      </div>
                    </div>
                    <button
                      className="attach-btn"
                      onClick={() => handleAttachItem(pr, 'pull_request')}
                      title="Attach this pull request"
                    >
                      📎
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Commits */}
          {repositoryInfo.commits && repositoryInfo.commits.length > 0 && (
            <div className="repo-section">
              <h5>Recent Commits ({repositoryInfo.commits.length})</h5>
              <div className="items-list">
                {repositoryInfo.commits.slice(0, 5).map((commit) => (
                  <div key={commit.sha} className="item-row">
                    <div className="item-info">
                      <span className="item-icon">{getItemIcon('commit')}</span>
                      <div className="item-details">
                        <div className="item-title">{commit.message}</div>
                        <div className="item-meta">
                          {commit.author?.login || 'Unknown'} • {formatDate(commit.date)} • {commit.sha.slice(0, 7)}
                        </div>
                      </div>
                    </div>
                    <button
                      className="attach-btn"
                      onClick={() => handleAttachItem(commit, 'commit')}
                      title="Attach this commit"
                    >
                      📎
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="github-integration-overlay">
      <div className="github-integration-modal">
        <div className="github-header">
          <h3>🐙 GitHub Integration</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="github-tabs">
          <button
            className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
            onClick={() => setActiveTab('attachments')}
          >
            Attachments ({attachments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Repository
          </button>
        </div>

        <div className="github-content">
          {activeTab === 'attachments' && (
            <div className="attachments-tab">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner-large"></div>
                  <p>Loading attachments...</p>
                </div>
              ) : error && activeTab === 'attachments' ? (
                <div className="error-state">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                  <button className="retry-btn" onClick={fetchAttachments}>
                    Try Again
                  </button>
                </div>
              ) : attachments.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🔗</span>
                  <p>No GitHub attachments</p>
                  <small>Browse a repository to attach issues, PRs, or commits</small>
                </div>
              ) : (
                <div className="attachments-list">
                  {attachments.map((attachment) => (
                    <div key={attachment.id || attachment.attachmentId} className="attachment-item">
                      <div className="attachment-info">
                        <span className="attachment-type">
                          {getItemIcon(attachment.type, attachment.state)}
                        </span>
                        <div className="attachment-details">
                          <div className="attachment-title">
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="attachment-link"
                            >
                              {attachment.title}
                            </a>
                          </div>
                          <div className="attachment-meta">
                            {attachment.repoOwner}/{attachment.repoName} • 
                            {attachment.type.replace('_', ' ')} • 
                            {formatDate(attachment.attachedAt)}
                          </div>
                          {attachment.description && (
                            <div className="attachment-description">
                              {attachment.description.slice(0, 100)}
                              {attachment.description.length > 100 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="remove-attachment-btn"
                        onClick={() => handleRemoveAttachment(attachment.id || attachment.attachmentId)}
                        title="Remove attachment"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'browse' && (
            <div className="browse-tab">
              <div className="repo-input-section">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter repository (e.g., facebook/react)"
                    value={repositoryId}
                    onChange={(e) => setRepositoryId(e.target.value)}
                    className="repo-input"
                    onKeyPress={(e) => e.key === 'Enter' && fetchRepositoryInfo()}
                  />
                  <button
                    className="load-repo-btn"
                    onClick={fetchRepositoryInfo}
                    disabled={repoLoading || !repositoryId.trim()}
                  >
                    {repoLoading ? (
                      <>
                        <span className="spinner"></span>
                        Loading...
                      </>
                    ) : (
                      'Load Repository'
                    )}
                  </button>
                </div>
              </div>

              {error && activeTab === 'browse' && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              {renderRepositoryBrowser()}
            </div>
          )}
        </div>

        <div className="github-footer">
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

export default GitHubIntegration;