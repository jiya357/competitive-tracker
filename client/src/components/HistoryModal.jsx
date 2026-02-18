import React, { useState, useEffect } from 'react';
import '../styles/HistoryModal.css';

function HistoryModal({ competitorId, competitorName, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [competitorId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/competitors/${competitorId}/history`
      );
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Check History: {competitorName}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <p className="loading">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="empty">No checks yet</p>
          ) : (
            <div className="history-list">
              {history.map((check, idx) => (
                <div key={check.id} className="history-item">
                  <div
                    className="history-item-header"
                    onClick={() =>
                      setExpandedId(expandedId === check.id ? null : check.id)
                    }
                  >
                    <div className="check-info">
                      <span className="check-number">Check #{history.length - idx}</span>
                      <span className="check-date">
                        {formatDate(check.checked_at)}
                      </span>
                    </div>
                    <span className={`expand-icon ${expandedId === check.id ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>

                  {expandedId === check.id && (
                    <div className="history-item-details">
                      {check.summary && (
                        <div className="detail-section">
                          <h4>Summary</h4>
                          <p>{check.summary}</p>
                        </div>
                      )}

                      {check.diff && (
                        <div className="detail-section">
                          <h4>Changes</h4>
                          <pre>{check.diff}</pre>
                        </div>
                      )}

                      <div className="detail-section">
                        <h4>Hash</h4>
                        <code className="hash">{check.hash}</code>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;
