import React, { useState, useEffect } from 'react';
import CompetitorCard from '../components/CompetitorCard';
import AddCompetitorForm from '../components/AddCompetitorForm';
import '../styles/HomePage.css';

function HomePage({ onStatusUpdate }) {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/competitors');
      if (!response.ok) throw new Error('Failed to fetch competitors');
      const data = await response.json();
      setCompetitors(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async (formData) => {
    try {
      const response = await fetch('http://localhost:3001/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add competitor');
      }

      const newCompetitor = await response.json();
      setCompetitors([newCompetitor, ...competitors]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    }
  };

  const handleDeleteCompetitor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this competitor?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/competitors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete competitor');

      setCompetitors(competitors.filter((c) => c.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    }
  };

  const handleCheckNow = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/competitors/${id}/check`, {
        method: 'POST',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Check failed');
      }

      // Refresh competitor list
      await fetchCompetitors();
      onStatusUpdate?.();
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    }
  };

  return (
    <div className="homepage">
      <section className="add-section">
        <h2>Add Competitor</h2>
        <AddCompetitorForm onSubmit={handleAddCompetitor} />
      </section>

      {error && <div className="error-message">{error}</div>}

      <section className="competitors-section">
        <h2>Your Competitors</h2>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : competitors.length === 0 ? (
          <p className="empty-state">
            No competitors yet. Add your first competitor above to get started.
          </p>
        ) : (
          <div className="competitors-grid">
            {competitors.map((competitor) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                onCheckNow={() => handleCheckNow(competitor.id)}
                onDelete={() => handleDeleteCompetitor(competitor.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
