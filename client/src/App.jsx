import React, { useState, useEffect } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import StatusPage from './pages/StatusPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    // Check backend health on load
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(data);
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus(null);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🔍 Competitive Intelligence Tracker</h1>
          <nav className="nav">
            <button 
              onClick={() => setCurrentPage('home')}
              className={currentPage === 'home' ? 'active' : ''}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentPage('status')}
              className={currentPage === 'status' ? 'active' : ''}
            >
              Status
            </button>
          </nav>
        </div>
        <div className="health-indicator">
          {backendStatus && (
            <span className={`indicator ${backendStatus.status}`}>
              ● {backendStatus.status.toUpperCase()}
            </span>
          )}
        </div>
      </header>

      <main className="main">
        {currentPage === 'home' && <HomePage onStatusUpdate={checkBackendHealth} />}
        {currentPage === 'status' && <StatusPage backendStatus={backendStatus} />}
      </main>

      <footer className="footer">
        <p>Built with React • Competitive Intelligence Tracker © 2026</p>
      </footer>
    </div>
  );
}

export default App;
