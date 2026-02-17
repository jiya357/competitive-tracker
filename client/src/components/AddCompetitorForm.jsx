import React, { useState } from 'react';
import '../styles/AddCompetitorForm.css';

function AddCompetitorForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.name.trim() || !formData.url.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate URL
    try {
      new URL(formData.url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onSubmit({
        name: formData.name,
        url: formData.url,
        tags,
      });

      // Reset form
      setFormData({ name: '', url: '', tags: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-competitor-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Competitor Name *</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="e.g., TechCorp"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="url">URL to Track *</label>
        <input
          id="url"
          type="url"
          name="url"
          placeholder="e.g., https://competitor.com/pricing"
          value={formData.url}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          name="tags"
          placeholder="e.g., pricing, important, watchlist"
          value={formData.tags}
          onChange={handleChange}
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Adding...' : 'Add Competitor'}
      </button>
    </form>
  );
}

export default AddCompetitorForm;
