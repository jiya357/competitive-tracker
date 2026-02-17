# Competitive Intelligence Tracker

A real-time web application for tracking competitor websites, detecting changes, and generating AI-powered summaries of what changed and why it matters.

## Features

✅ **Core Features (Implemented)**
- Add 5-10 competitor website links to track
- Click "Check Now" to fetch latest content from URLs
- Automatic diff generation showing what changed since last check
- AI-powered summaries using OpenAI GPT-4 explaining the changes
- View change history (last 5 checks) per competitor with full summaries
- Add tags to competitors for better organization
- Real-time health status page showing backend, database, and LLM connection status

✅ **Enhancements (Added)**
- Tag-based organization of competitors
- Persistent storage of all checks with timestamps
- Content hash tracking for efficient change detection
- Visual status indicators for system health
- Clean, responsive UI with Tailwind CSS

## Project Structure

```
competitor-tracker/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/         # HomePage, StatusPage
│   │   ├── components/    # CompetitorCard, AddCompetitorForm, HistoryModal
│   │   ├── styles/        # Component CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Node.js/Express backend
│   ├── server.js          # Main server logic
│   ├── data.db            # SQLite database (created at runtime)
│   ├── .env.example       # Environment variables template
│   └── package.json
├── README.md              # This file
├── AI_NOTES.md            # AI usage documentation
├── ABOUTME.md             # Developer info
└── PROMPTS_USED.md        # Prompts used for development
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (for AI summaries)

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd competitor-tracker
   ```

2. **Setup Backend:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   npm install
   npm start
   # Server runs on http://localhost:3001
   ```

3. **In a new terminal, setup Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   # App runs on http://localhost:5173
   ```

4. **Open in browser:**
   - Navigate to http://localhost:5173

## How It Works

### Adding a Competitor
1. Enter competitor name (e.g., "Stripe")
2. Paste the URL you want to track (e.g., https://stripe.com/pricing)
3. Optionally add tags (e.g., "pricing", "important")
4. Click "Add Competitor"

### Checking for Changes
1. Click "Check Now" button on a competitor card
2. The app fetches current content from the URL
3. Compares with the last stored version
4. Generates an AI summary of changes
5. Stores the check in history

### Viewing History
1. Click "History" button on competitor card
2. View last 5 checks with:
   - Timestamps
   - AI-generated summaries
   - Line-by-line changes
   - Content hash for deduplication

### System Status
- Click "Status" tab in navigation
- View health of backend, database, and LLM connection
- Troubleshooting tips for each component

## API Endpoints

### GET /api/health
Returns system health status:
```json
{
  "status": "ok|degraded|error",
  "backend": "running",
  "database": "connected",
  "llm": "configured|not configured"
}
```

### GET /api/competitors
List all competitors with check counts and last check time

### POST /api/competitors
Add a new competitor:
```json
{
  "name": "Competitor Name",
  "url": "https://...",
  "tags": ["pricing", "important"]
}
```

### DELETE /api/competitors/:id
Delete a competitor and all its checks

### POST /api/competitors/:id/check
Manually trigger a check for a competitor

### GET /api/competitors/:id/history
Get the last 5 checks for a competitor

## Database Schema

### competitors
- `id`: Auto-incrementing primary key
- `name`: Competitor name
- `url`: URL being tracked (unique)
- `tags`: JSON array of tags
- `created_at`: Timestamp
- `updated_at`: Timestamp

### checks
- `id`: Auto-incrementing primary key
- `competitor_id`: Foreign key to competitors
- `content`: Full content fetched from URL
- `hash`: MD5 hash of content for deduplication
- `checked_at`: Timestamp of check
- `summary`: AI-generated summary of changes
- `diff`: Text diff of what changed

## What's NOT Included

- ❌ Advanced visualization of changes (heatmaps, side-by-side HTML diffs)
- ❌ Scheduled automatic checks (manual "Check Now" only)
- ❌ Email notifications of changes
- ❌ Multi-user support or auth
- ❌ Fine-grained change filtering beyond tags
- ❌ Screenshots or visual diffing
- ❌ Export to reports (CSV, PDF)
- ❌ Competitor benchmarking or comparison tools

## Troubleshooting

### Backend not connecting
- Ensure server is running: `npm start` in server directory
- Check port 5000 is not in use
- Verify OPENAI_API_KEY is set in .env

### LLM not responding
- Check OPENAI_API_KEY is valid
- Verify OpenAI API account has credits
- Check Status page in app

### Database errors
- Delete `server/data.db` and restart server to reset
- Check file permissions in server directory

## Environment Variables

Required in `server/.env`:
```
PORT=5000
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

## Tech Stack

**Frontend:**
- React 19
- Vite (build tool)
- CSS (custom, no framework)

**Backend:**
- Node.js / Express
- SQLite 3 (better-sqlite3)
- OpenAI API (GPT-4)
- Axios (HTTP requests)
- Cheerio (HTML parsing)

**Deployment:**
- Hosted on [Vercel/Heroku/Railway/etc - specify in ABOUTME.md]

## License

MIT

## Contact

See ABOUTME.md for developer information.
