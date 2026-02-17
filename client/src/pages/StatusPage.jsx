import React from 'react';
import '../styles/StatusPage.css';

function StatusPage({ backendStatus }) {
  if (!backendStatus) {
    return (
      <div className="status-page">
        <h2>System Status</h2>
        <div className="status-card error">
          <h3>Backend Connection Error</h3>
          <p>Unable to connect to backend server. Make sure it's running on port 5000.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status === 'ok') return 'ok';
    if (status === 'running' || status === 'connected' || status === 'configured') return 'ok';
    if (status === 'degraded') return 'warning';
    return 'error';
  };

  return (
    <div className="status-page">
      <h2>System Status</h2>

      <div className="status-grid">
        <div className={`status-card ${getStatusColor(backendStatus.status)}`}>
          <h3>Overall Status</h3>
          <p className="status-value">{backendStatus.status.toUpperCase()}</p>
          <p className="timestamp">Last checked: {new Date(backendStatus.timestamp).toLocaleTimeString()}</p>
        </div>

        <div className={`status-card ${getStatusColor(backendStatus.backend)}`}>
          <h3>Backend Service</h3>
          <p className="status-value">{backendStatus.backend}</p>
        </div>

        <div className={`status-card ${getStatusColor(backendStatus.database)}`}>
          <h3>Database</h3>
          <p className="status-value">{backendStatus.database}</p>
        </div>

        <div className={`status-card ${getStatusColor(backendStatus.llm)}`}>
          <h3>LLM Connection</h3>
          <p className="status-value">{backendStatus.llm}</p>
          {backendStatus.llm === 'configured' && (
            <p className="note">OpenAI API is properly configured</p>
          )}
        </div>
      </div>

      <div className="status-info">
        <h3>What This Means</h3>
        <ul>
          <li><strong>Backend Service:</strong> Express server handling API requests</li>
          <li><strong>Database:</strong> SQLite database storing competitors and check history</li>
          <li><strong>LLM Connection:</strong> OpenAI API for generating AI summaries of changes</li>
        </ul>
      </div>

      <div className="status-troubleshooting">
        <h3>Troubleshooting</h3>
        <ul>
          <li>If Backend shows error: Start the server with <code>npm start</code> in the server directory</li>
          <li>If Database shows error: Check file permissions in the server directory</li>
          <li>If LLM shows not configured: Set OPENAI_API_KEY in the server's .env file</li>
        </ul>
      </div>
    </div>
  );
}

export default StatusPage;
