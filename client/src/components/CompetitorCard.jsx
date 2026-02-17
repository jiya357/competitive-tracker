import React, { useState } from 'react';
import HistoryModal from './HistoryModal';
import '../styles/CompetitorCard.css';

function CompetitorCard({ competitor, onCheckNow, onDelete }) {
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckNow = async () => {
    setLoading(true);
    try {
      await onCheckNow();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="competitor-card">
        <div className="card-header">
          <h3>{competitor.name}</h3>
          <button className="delete-btn" onClick={onDelete} title="Delete">
            ✕
          </button>
        </div>

        <div className="card-url">
          <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="url-link">
            {competitor.url}
          </a>
        </div>

        {competitor.tags && competitor.tags.length > 0 && (
          <div className="card-tags">
            {competitor.tags.map((tag, idx) => (
              <span key={idx} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="card-stats">
          <div className="stat">
            <span className="label">Checks</span>
            <span className="value">{competitor.check_count || 0}</span>
          </div>
          {competitor.last_check && (
            <div className="stat">
              <span className="label">Last Check</span>
              <span className="value">{formatDate(competitor.last_check)}</span>
            </div>
          )}
        </div>

        <div className="card-actions">
          <button
            className="check-btn"
            onClick={handleCheckNow}
            disabled={loading}
          >
            {loading ? '⏳ Checking...' : '🔄 Check Now'}
          </button>
          <button
            className="history-btn"
            onClick={() => setShowHistory(true)}
            disabled={competitor.check_count === 0}
          >
            📋 History
          </button>
        </div>
      </div>

      {showHistory && (
        <HistoryModal
          competitorId={competitor.id}
          competitorName={competitor.name}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}

export default CompetitorCard;
