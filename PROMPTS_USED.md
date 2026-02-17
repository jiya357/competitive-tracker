# PROMPTS_USED.md - Development Prompts

This document records the key prompts used during development. Responses and API keys are not included.

## Prompt 1: Project Architecture

**Provider**: Claude (Initial Planning)

**Prompt**:
```
I need to build a web app for competitive intelligence tracking. Requirements:
- Add competitor website links (5-10)
- Click "check now" to fetch content
- Show what changed (diff)
- Generate AI summary of changes
- Show history of last 5 checks per competitor
- Add tags and filters as enhancements

What's the best tech stack? Should I use Next.js or pure React? SQLite or PostgreSQL? How should I structure the project?
```

**Key Points from Response**:
- Recommended React + Vite for simplicity
- SQLite acceptable for initial version
- Separate client/server folders
- Keep components small and reusable

---

## Prompt 2: React Component Structure

**Provider**: Claude

**Prompt**:
```
Design React component hierarchy for competitor tracker app:
- Main page with list of competitors
- Add competitor form
- Individual competitor cards showing name, URL, tags, last check time, check count
- History modal showing last 5 checks with summaries and diffs
- Status page showing backend/database/LLM health

How should I pass props? What should be state vs. context? Any hooks I should use?
```

**Key Points from Response**:
- HomePage as main container with state
- CompetitorCard as reusable presentational component
- HistoryModal for showing detailed check history
- useEffect for data fetching
- useState for form handling

---

## Prompt 3: Backend API Design

**Provider**: Claude

**Prompt**:
```
Design Node.js/Express API for competitor tracker:
- Add competitor (POST)
- List competitors (GET)
- Delete competitor (DELETE)
- Check now (fetch content, analyze, store result)
- Get history for a competitor (GET)
- Health check endpoint

What should the request/response format be? How should I structure the Express app? 

For the check endpoint: should I fetch HTML, extract text, or store raw? How do I diff it?
```

**Key Points from Response**:
- RESTful design with /api/competitors endpoints
- Store full HTML content
- Use MD5 hashing for change detection
- Simple diff algorithm (line-by-line comparison)
- Health endpoint for monitoring

---

## Prompt 4: OpenAI Integration

**Provider**: Claude

**Prompt**:
```
How do I integrate OpenAI API to generate summaries of competitor website changes?

The input would be:
- What changed (diff text)
- The new content (first 1000 chars)

Output should be:
- 2-3 sentence summary explaining what changed and why it matters

What model should I use? What's a good prompt? How do I handle API errors gracefully?
```

**Key Points from Response**:
- Use GPT-4 for better quality summaries
- Prompt should ask for business-focused insights
- Use chat completions API (not text-davinci)
- Handle rate limits and API failures
- Store summary with each check for offline viewing

---

## Prompt 5: CSS & Responsive Design

**Provider**: Claude

**Prompt**:
```
Design CSS for competitive intelligence tracker. No CSS frameworks (no Tailwind).

I need:
1. Header with navigation and health indicator
2. Add competitor form
3. Grid of competitor cards (3 columns on desktop, 1 on mobile)
4. Modal for viewing history
5. Status page with 4 status cards

What CSS Grid/Flexbox patterns should I use? Colors? Typography? Mobile breakpoints?
```

**Key Points from Response**:
- CSS variables for theme (colors, spacing, shadows)
- CSS Grid for competitor cards: `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`
- Modal with overlay: `position: fixed` with backdrop
- Max-width: 1200px for main content
- Mobile breakpoint: 768px

---

## Prompt 6: Database Schema

**Provider**: Claude

**Prompt**:
```
Design SQLite schema for competitor tracking app:

Tables needed:
1. competitors - store competitor info (name, URL, tags)
2. checks - store history of fetches (content, timestamp, summary, diff)

What fields do I need? Indexes? Foreign keys? How do I handle tags (array vs. separate table)?

I'm using SQLite for simplicity. Is there any issue I should know about?
```

**Key Points from Response**:
- competitors table: id, name, url (unique), tags (JSON), created_at, updated_at
- checks table: id, competitor_id (FK), content, hash, checked_at, summary, diff
- Index on competitor_id for fast history queries
- Store tags as JSON string (simpler than separate table for this use case)

---

## Prompt 7: Error Handling

**Provider**: Claude

**Prompt**:
```
How should I handle errors in a production React + Node app?

Scenarios:
1. Backend server offline
2. OpenAI API failure
3. Invalid URL (can't fetch)
4. Database connection error
5. Invalid form input

What should the user see? Should I show technical details? How do I retry?
```

**Key Points from Response**:
- Show user-friendly error messages, not stack traces
- Display "Backend offline" status on Status page
- Allow app to work partially if LLM is down
- Retry API calls on network errors with timeout
- Validate input before sending to backend

---

## Prompt 8: Deployment Considerations

**Provider**: Claude

**Prompt**:
```
I'm deploying this app. Considerations:

1. Should SQLite file be on disk or in-memory?
2. How do I handle environment variables?
3. What about CORS for frontend calling backend?
4. Should I dockerize it?
5. Where should I host it?

For hosting: what's good for small Node apps + React?
```

**Key Points from Response**:
- Use persistent SQLite file on disk (not in-memory)
- Use .env file locally, platform env vars in production
- Set CORS origins to allowed domains
- Docker is optional but recommended
- Options: Vercel (frontend), Railway/Heroku (backend), or full-stack on single platform

---

## Prompt 9: Manual Testing Checklist

**Provider**: Claude

**Prompt**:
```
Create a comprehensive testing checklist for this app before submitting.

Focus areas:
1. Happy path (add competitor → check → view history)
2. Error handling (bad URLs, offline backend, LLM failure)
3. UI (mobile, form validation, modals)
4. Performance (check a large URL)
5. Data persistence (restart server, check data still there)
```

**Key Points from Response**:
- Test with 5+ competitors
- Test invalid URLs (should fail gracefully)
- Test with backend offline
- Test mobile responsiveness (Chrome DevTools)
- Test history modal with multiple checks
- Verify data persists after server restart

---

## Prompt 10: UI/UX Details

**Provider**: Claude

**Prompt**:
```
Improve the UX:

1. Should I show loading states? How?
2. Should "Check Now" button disable while loading?
3. History modal - how to show 5 checks, each with expandable details?
4. Status page - what's the best layout?
5. Should there be a home page explanation or just jump to dashboard?
```

**Key Points from Response**:
- Show "Loading..." text and disable buttons during async operations
- History modal: collapsible items, expand on click
- Status page: 4-card grid, color-coded by status
- Skip home page explanation, start with form + empty state
- Show dates/times, not relative times (easier for debugging)

---

## Summary

**Prompts by Category**:
- Architecture: 2 prompts
- Technical Design: 4 prompts
- Implementation Details: 3 prompts
- Deployment: 1 prompt

**Total AI guidance prompts**: 10

**Manual implementation**: Change detection algorithm, error handling edge cases, responsive CSS tweaks, deployment configuration

**Time saved by AI**: ~3-4 hours on architecture/design decisions
**Time spent on manual implementation**: ~4-5 hours on core logic and testing

---

## What Wasn't Asked to AI

1. Specific code syntax (typed it myself)
2. How to debug particular errors (used MDN/StackOverflow)
3. TypeScript considerations (decided not to use)
4. Authentication/security beyond basics
5. Performance optimization (premature for this scope)
