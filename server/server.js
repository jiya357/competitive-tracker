const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS competitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL,
    content TEXT,
    hash TEXT,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,
    diff TEXT,
    FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_competitor_checks ON checks(competitor_id);
`);

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
      model: 'gpt-4',
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
app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'running',
    database: 'connected',
    llm: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
  };

  try {
    db.prepare('SELECT 1').get();
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
app.get('/api/competitors', (req, res) => {
  try {
    const competitors = db
      .prepare(
        `SELECT c.*, 
                COUNT(ch.id) as check_count,
                MAX(ch.checked_at) as last_check
         FROM competitors c
         LEFT JOIN checks ch ON c.id = ch.competitor_id
         GROUP BY c.id
         ORDER BY c.created_at DESC`
      )
      .all();

    const enriched = competitors.map((c) => ({
      ...c,
      tags: JSON.parse(c.tags || '[]'),
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add competitor
app.post('/api/competitors', (req, res) => {
  try {
    const { name, url, tags } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL required' });
    }

    const stmt = db.prepare(
      'INSERT INTO competitors (name, url, tags) VALUES (?, ?, ?)'
    );
    const result = stmt.run(name, url, JSON.stringify(tags || []));

    res.json({ id: result.lastInsertRowid, name, url, tags: tags || [] });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'URL already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete competitor
app.delete('/api/competitors/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM competitors WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check competitor (fetch and diff)
app.post('/api/competitors/:id/check', async (req, res) => {
  try {
    const { id } = req.params;

    const competitor = db
      .prepare('SELECT * FROM competitors WHERE id = ?')
      .get(id);

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    // Fetch new content
    const content = await fetchContent(competitor.url);
    const hash = require('crypto')
      .createHash('md5')
      .update(content)
      .digest('hex');

    // Get last check
    const lastCheck = db
      .prepare(
        'SELECT * FROM checks WHERE competitor_id = ? ORDER BY checked_at DESC LIMIT 1'
      )
      .get(id);

    // Generate diff
    const diffInfo = generateDiff(lastCheck?.content, content);

    // Generate summary
    const summary = await generateSummary(content, diffInfo);

    // Store check
    const stmt = db.prepare(
      'INSERT INTO checks (competitor_id, content, hash, summary, diff) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(id, content, hash, summary, diffInfo);

    res.json({
      id: result.lastInsertRowid,
      hash,
      diff: diffInfo,
      summary,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get competitor history (last 5 checks)
app.get('/api/competitors/:id/history', (req, res) => {
  try {
    const { id } = req.params;

    const history = db
      .prepare(
        `SELECT id, checked_at, summary, diff, hash 
         FROM checks 
         WHERE competitor_id = ? 
         ORDER BY checked_at DESC 
         LIMIT 5`
      )
      .all(id);

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
