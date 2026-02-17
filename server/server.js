const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { Pool } = require('pg');
const path = require('path');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build (production)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// PostgreSQL Pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/competitor_tracker',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

console.log(`Database: ${process.env.DATABASE_URL ? 'PostgreSQL (production)' : 'PostgreSQL (local development)'}`);

// Initialize database tables
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS competitors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS checks (
        id SERIAL PRIMARY KEY,
        competitor_id INTEGER NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
        content TEXT,
        hash TEXT,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        summary TEXT,
        diff TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_competitor_checks ON checks(competitor_id);
    `);
    
    console.log('Database tables initialized successfully');
    client.release();
  } catch (err) {
    console.error('Database initialization error:', err.message);
    process.exit(1);
  }
}

// Initialize on startup
initializeDatabase();

// OpenAI client
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Helper: Fetch and extract content from URL
async function fetchContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    throw new Error(`Failed to fetch content from ${url}`);
  }
}

// Helper: Generate diff summary
function generateDiff(oldContent, newContent) {
  if (!oldContent) return 'Initial check';
  if (oldContent === newContent) return 'No changes detected';

  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  
  const changes = [];
  const maxLines = Math.min(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    if (oldLines[i] !== newLines[i]) {
      changes.push(`Line ${i + 1}: Changed`);
    }
  }
  
  if (oldLines.length !== newLines.length) {
    changes.push(`Content length changed from ${oldLines.length} to ${newLines.length} lines`);
  }

  return changes.slice(0, 5).join('\n');
}

// Helper: Generate summary using Claude
async function generateSummary(content, diffInfo) {
  if (!openai) {
    return 'AI summary generation not available (API key not configured)';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a competitive intelligence analyst. Summarize website changes concisely in 2-3 sentences with specific details.',
        },
        {
          role: 'user',
          content: `Summarize these changes:\n\nDiff:\n${diffInfo}\n\nContent:\n${content.substring(0, 1000)}`,
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error.message);
    return 'Summary generation failed: ' + error.message;
  }
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'running',
    database: 'connected',
    llm: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
  };

  try {
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (e) {
    health.database = 'error';
    health.status = 'degraded';
  }

  if (!process.env.OPENAI_API_KEY) {
    health.llm = 'not configured';
    health.status = 'degraded';
  }

  res.json(health);
});

// Get all competitors
app.get('/api/competitors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.url, c.tags, c.created_at, c.updated_at,
             COUNT(ch.id) as check_count,
             MAX(ch.checked_at) as last_check
      FROM competitors c
      LEFT JOIN checks ch ON c.id = ch.competitor_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    const enriched = result.rows.map((c) => ({
      ...c,
      tags: c.tags || [],
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add competitor
app.post('/api/competitors', async (req, res) => {
  try {
    const { name, url, tags } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL required' });
    }

    const result = await pool.query(
      'INSERT INTO competitors (name, url, tags) VALUES ($1, $2, $3) RETURNING id, name, url, tags',
      [name, url, JSON.stringify(tags || [])]
    );

    const row = result.rows[0];
    res.json({ 
      id: row.id, 
      name: row.name, 
      url: row.url, 
      tags: row.tags 
    });
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'URL already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete competitor
app.delete('/api/competitors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM competitors WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check competitor (fetch and diff)
app.post('/api/competitors/:id/check', async (req, res) => {
  try {
    const { id } = req.params;

    const competitorResult = await pool.query(
      'SELECT * FROM competitors WHERE id = $1',
      [id]
    );

    if (competitorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    const competitor = competitorResult.rows[0];

    // Fetch new content
    const content = await fetchContent(competitor.url);
    const hash = require('crypto')
      .createHash('md5')
      .update(content)
      .digest('hex');

    // Get last check
    const lastCheckResult = await pool.query(
      'SELECT * FROM checks WHERE competitor_id = $1 ORDER BY checked_at DESC LIMIT 1',
      [id]
    );

    const lastCheck = lastCheckResult.rows[0];

    // Generate diff
    const diffInfo = generateDiff(lastCheck?.content, content);

    // Generate summary
    const summary = await generateSummary(content, diffInfo);

    // Store check
    const checkResult = await pool.query(
      'INSERT INTO checks (competitor_id, content, hash, summary, diff) VALUES ($1, $2, $3, $4, $5) RETURNING id, checked_at',
      [id, content, hash, summary, diffInfo]
    );

    const check = checkResult.rows[0];

    res.json({
      id: check.id,
      hash,
      diff: diffInfo,
      summary,
      checked_at: check.checked_at,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get competitor history (last 5 checks)
app.get('/api/competitors/:id/history', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, checked_at, summary, diff, hash 
       FROM checks 
       WHERE competitor_id = $1 
       ORDER BY checked_at DESC 
       LIMIT 5`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback to React for client-side routing (must be after all API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
