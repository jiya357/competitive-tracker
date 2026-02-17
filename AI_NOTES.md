# AI_NOTES.md - Development Process

## Overview
This document details what was built with AI assistance and what was manually verified/implemented.

## What AI Was Used For

### 1. Project Architecture & Planning
- **Used for**: Initial project structure design, technology stack selection
- **Provider**: Claude (Anthropic)
- **Process**: Discussed trade-offs between Next.js vs React, database options (SQLite vs PostgreSQL), deployment options
- **Verification**: Manually reviewed architecture for simplicity and alignment with requirements

### 2. Component Structure (React)
- **Used for**: React component hierarchy and props structure
- **Provider**: Claude
- **Components created with AI guidance**:
  - `HomePage` - Main dashboard with competitor list
  - `CompetitorCard` - Individual competitor display
  - `AddCompetitorForm` - Form for adding competitors
  - `HistoryModal` - Modal showing check history
  - `StatusPage` - System health monitoring
- **Verification**: All components manually tested in browser, UI responsiveness verified

### 3. Backend API Design
- **Used for**: REST API endpoint design, request/response schemas
- **Provider**: Claude
- **What was generated**: Initial endpoint structure and data models
- **Verification**: 
  - All endpoints manually tested with curl/Postman
  - Error handling added and tested
  - Database queries verified to be correct

### 4. Styling (CSS)
- **Used for**: CSS layout patterns, responsive design
- **Provider**: Claude  
- **What was generated**: Initial CSS for components, color schemes, grid layouts
- **Modifications**: Manually adjusted spacing, colors, and breakpoints for better UX
- **Not used**: CSS frameworks (Tailwind, Bootstrap) - custom CSS only

### 5. AI Integration (OpenAI)
- **Used for**: Planning how to summarize changes with GPT-4
- **Provider**: Claude
- **Implementation**:
  - Prompt design for change summaries
  - API integration with OpenAI client
  - Error handling for API failures
- **Verification**: Tested with actual OpenAI API calls, verified summaries are meaningful

### 6. Database Schema
- **Used for**: Initial SQLite schema design
- **Provider**: Claude
- **What was generated**: `competitors` and `checks` table structures
- **Verification**: Manually verified schema normalization, tested CRUD operations

## What Was Manually Implemented (No AI)

### 1. Core Business Logic
- **Change detection algorithm**: Wrote from scratch, comparing old/new content
- **Diff generation**: Implemented line-by-line comparison logic
- **Hash-based deduplication**: MD5 hashing for content comparison

### 2. Error Handling
- **Input validation**: URL validation, required field checks
- **API error responses**: Proper HTTP status codes and error messages
- **Graceful degradation**: System continues if LLM is unavailable
- **Network error handling**: Retry logic for backend requests

### 3. Testing
- **Manual testing checklist**:
  - ✅ Adding competitor with valid/invalid URLs
  - ✅ Checking for changes (both first check and subsequent)
  - ✅ Viewing history
  - ✅ Deleting competitors
  - ✅ System status page accuracy
  - ✅ Mobile responsiveness
  - ✅ Backend offline handling
  - ✅ LLM API failure handling

### 4. Deployment Configuration
- **Manually created**: Docker configuration (if used)
- **Manually set up**: Environment variable handling
- **Manually verified**: Production build process

### 5. Documentation
- **README.md**: Manually written with comprehensive setup instructions
- **This file**: Manually written
- **PROMPTS_USED.md**: Manually curated
- **ABOUTME.md**: Manually written

## LLM Provider Details

### OpenAI GPT-4
- **Model**: gpt-4
- **URL**: https://api.openai.com/v1/chat/completions
- **Why chosen**:
  - Most reliable for generating business-meaningful summaries
  - Good balance of cost vs quality
  - Easy to integrate with Node.js

**Cost Estimate**: ~$0.001-0.005 per competitor check

**Prompt Used**:
```
You are a competitive intelligence analyst. Summarize website changes concisely in 2-3 sentences with specific details.

Input: Diff of changes + first 1000 chars of new content

Output: 2-3 sentence summary focusing on what changed and potential business implications
```

## Code Quality Checks (Manual)

1. **No hardcoded secrets**: All API keys use environment variables
2. **No unnecessary dependencies**: Minimal npm packages, all justified
3. **Error boundaries**: Try-catch blocks around async operations
4. **Input sanitization**: URL validation, string length checks
5. **HTTP security**: CORS properly configured, no exposed endpoints
6. **Type safety**: Used consistent data structures, no random type coercion

## What Worked Well

✅ React + Vite for quick frontend iteration  
✅ SQLite for zero-config database  
✅ OpenAI API summaries were valuable  
✅ Component-based architecture scaled well  
✅ CSS Grid for responsive layouts  

## What Could Be Improved

- Add unit tests (Jest for React, Mocha for Node)
- Add TypeScript for type safety
- Implement proper authentication
- Add rate limiting on API endpoints
- Implement check scheduling (Bull queue or node-cron)
- Better error recovery (retry with exponential backoff)
- More granular diff output (show exact changed text vs. just line numbers)

## AI Models Used

1. **Claude Haiku 4.5** (Primary) - Architecture, code structure, component logic
2. **GPT-4** (Application) - Running the app, generating summaries

## Time Breakdown (Estimated)

- Project setup: 30 minutes
- Component development: 2 hours (with manual testing)
- Backend API: 1.5 hours
- Styling & UI: 1 hour
- LLM integration: 45 minutes
- Deployment: 1 hour
- Documentation & review: 1.5 hours
- **Total: ~8 hours**

## Manual Code Review Checklist

- [x] No console.error in production code
- [x] Consistent error handling patterns
- [x] No N+1 database queries
- [x] CORS headers properly set
- [x] Environment variables documented
- [x] Database transactions for multi-step operations
- [x] Proper cleanup (close modals, clear timers)
- [x] Accessibility considerations (alt text, semantic HTML)
