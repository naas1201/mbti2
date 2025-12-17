# AI.md - Project Brain

## Project Overview

MBTI Personality Test Application built with Cloudflare Workers, Turso database, and Clerk authentication.

## Architecture Decisions

1. **Cloudflare Workers**: Primary runtime environment for serverless functions
2. **Turso Database**: SQLite-based edge database for user data and test results
3. **Clerk Authentication**: User authentication and session management
4. **Hono Framework**: Lightweight web framework for Cloudflare Workers

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono v4
- **Database**: Turso (libSQL)
- **Authentication**: Clerk
- **Language**: TypeScript

## Authentication Flow

1. User clicks login button
2. Clerk authentication modal should open
3. User authenticates via Clerk
4. Clerk webhook updates user in Turso database
5. Session established via Clerk cookies

## Known Issues

1. **Clerk Sign-in Not Working**: Login button doesn't launch Clerk authentication modal
   - Root Cause: HTML file has broken structure with malformed tags
   - Status: BLOCKED - File has unsaved changes in editor
   - Solution: Need to fix HTML structure and ensure Clerk SDK loads correctly
2. **Missing Frontend Integration**: Using Clerk JS SDK in static HTML instead of Next.js
   - Status: Using current architecture (Cloudflare Worker + static HTML)
   - Solution: Enhanced Clerk initialization with retry logic and error handling

## Lessons Learned

- Clerk requires proper frontend integration for authentication UI
- Cloudflare Workers need specific configuration for Clerk webhooks
- Turso database connections must be properly configured with environment variables
- HTML structure integrity is critical for Clerk SDK to work
- Always enable Cloudflare free tier features (analytics, observability) from start
- TypeScript types should be defined before implementation to prevent errors
- Clerk webhook verification needs Svix signature validation (TODO)

## Endpoint Map

### Authentication Endpoints

- `GET /api/health` - Health check with analytics
- `POST /api/submit-test` - Submit MBTI test (requires authentication)
- `POST /api/webhooks/clerk` - Clerk webhook for user sync
- `GET /api/webhooks/clerk/health` - Webhook health check

### Data Endpoints

- `GET /api/questions` - Get MBTI test questions

### User Endpoints

- `GET /api/users/me` - Get current user profile (TODO)
- User sync handled via Clerk webhook: `POST /api/webhooks/clerk`

### Test Endpoints

- `GET /api/questions` - Get MBTI test questions
- `POST /api/submit-test` - Submit test answers (authenticated)
- Test results returned immediately in submission response

## Environment Variables Required

- `TURSO_DATABASE_URL` - Turso database connection URL ✅ Configured
- `TURSO_AUTH_TOKEN` - Turso authentication token ✅ Configured
- `CLERK_SECRET_KEY` - Clerk backend secret key ✅ Configured
- `CLERK_PUBLISHABLE_KEY` - Clerk frontend publishable key ✅ Configured
- `ENVIRONMENT` - Deployment environment (development/staging/production) ✅ Configured

## Database Schema (See databasestructure.md for details)

- `users` - User profiles synced from Clerk (via webhook)
- `tests` - MBTI test definitions
- `test_results` - User test submissions and results
- `questions` - Test questions
- `answer_options` - Available answer options
- `user_answers` - User answers to questions

## Deployment Checklist

- [x] Configure all environment variables in wrangler.toml
- [x] Set up Clerk webhook endpoint (`/api/webhooks/clerk`)
- [ ] Fix HTML file structure (BLOCKED - unsaved changes)
- [ ] Test authentication flow end-to-end
- [ ] Deploy to Cloudflare Workers
- [ ] Configure Clerk webhook URL in Clerk dashboard
- [ ] Run database migrations in Turso

## Pending Tasks

1. **HIGH**: Fix HTML file structure (index.html has broken tags)
2. **HIGH**: Save unsaved changes in editor to allow file fixes
3. **MEDIUM**: Implement proper Svix signature verification for Clerk webhooks
4. **MEDIUM**: Create database migration scripts for Turso
5. **MEDIUM**: Implement GET /api/users/me endpoint
6. **LOW**: Add more comprehensive error states in frontend
7. **LOW**: Implement user profile editing functionality
