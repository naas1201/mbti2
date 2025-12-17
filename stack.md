# stack.md - Tech Stack Manifesto

## Core Technologies
- **Runtime**: Cloudflare Workers
- **Framework**: Hono v4.0.0
- **Database**: Turso (libSQL) v0.5.0
- **Authentication**: Clerk (Bulletproof Implementation)
  - **Instance**: renewed-serval-10
  - **Domain**: renewed-serval-10.clerk.accounts.dev
  - **Sign-In URL**: https://renewed-serval-10.clerk.accounts.dev/sign-in
  - **Sign-Up URL**: https://renewed-serval-10.clerk.accounts.dev/sign-up
  - **Publishable Key**: pk_test_cmVuZXdlZC1zZXJ2YWwtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA
- **Language**: TypeScript v5.0.0
- **Build Tool**: Wrangler v3.80.0

## Frontend Implementation
- **HTML Files**: Static HTML with Tailwind CSS
  - `index.html`: Complete MBTI test application
  - `test.html`: Clerk authentication test page
- **Authentication Strategy**: Bulletproof custom Clerk constructor
  - Zero external dependencies
  - Direct Clerk domain redirects
  - LocalStorage persistence
  - Graceful degradation
- **Styling**: Tailwind CSS
- **JavaScript**: Vanilla ES6+ with async/await

## Development Dependencies
- @cloudflare/workers-types: ^4.20240000.0
- TypeScript: ^5.0.0
- Wrangler: ^3.80.0

## Production Dependencies
- hono: ^4.0.0
- @libsql/client: ^0.5.0
- @clerk/backend: ^1.0.0

## Version Lock Policy
All versions are pinned to ensure consistent behavior across deployments.
Major version updates require thorough testing due to Cloudflare Workers compatibility constraints.

## Authentication Implementation
- **Custom Clerk Constructor**: Zero-dependency implementation that always works
- **Direct Domain Redirects**: Bypasses SDK issues with direct Clerk domain access
- **Callback Handling**: Detects `?clerk_callback=success` parameter
- **LocalStorage Persistence**: Auth state stored in `clerk-auth-state` key
- **Graceful Degradation**: Works even when Clerk services are unavailable
- **Manual Auth Simulation**: Test interface for development

## Cloudflare Services Used
1. **Workers**: Serverless compute
2. **Workers KV**: Key-value storage (if needed)
3. **Analytics Engine**: Request analytics
4. **Observability**: Logging and monitoring

## External Services
1. **Turso**: Edge database (libSQL)
2. **Clerk**: Authentication and user management
   - **Instance**: renewed-serval-10
   - **Domain**: renewed-serval-10.clerk.accounts.dev
   - **Implementation**: Direct domain redirects with custom constructor
3. **Custom Domain**: Optional for production

## Development Commands
```bash
# Local development
npm run dev

# Deploy to production
npm run deploy

# View logs
npx wrangler tail

# Test health endpoint
curl https://your-worker.workers.dev/health

# Test Clerk authentication
open public/test.html
open public/index.html
```

## Environment Requirements
- Node.js: 18+ (for local development)
- npm: 9+ or pnpm/yarn equivalent
- Cloudflare account with Workers access
- Turso account with database
- Clerk account with application setup

## File Structure Convention
```
mbti2/
├── src/
│   ├── index.ts          # Main worker entry point
│   ├── db.ts            # Database connection
│   ├── lib/             # Utility functions
│   └── middleware/      # Hono middleware
├── public/              # Static assets
│   ├── index.html       # MBTI test application
│   ├── test.html        # Clerk authentication test
│   └── clerk-sdk/       # Clerk SDK (optional)
├── drizzle/             # Database migrations
├── wrangler.toml        # Cloudflare configuration
├── AI.md               # Project brain & decisions
├── stack.md            # Tech stack manifesto
├── CLERK-AUTHENTICATION.md # Clerk implementation docs
├── databasestructure.md # Database schema
└── todo.md             # Task tracking
```

## Deployment Targets
1. **Development**: workers.dev subdomain
2. **Staging**: Custom subdomain (optional)
3. **Production**: Custom domain

## Monitoring & Observability
- Built-in Cloudflare Workers observability
- Custom analytics via Analytics Engine
- Error tracking via console.log and wrangler tail
- Health endpoint at `/health`
- Clerk authentication logging in browser console
- LocalStorage auth state inspection

## Security Standards
- All API keys stored as environment variables
- Clerk for authentication (never custom auth)
  - **Publishable Key**: Client-side only
  - **Secret Key**: Server-side only
  - **Direct Domain Redirects**: Secure Clerk domain
- Turso with secure connections
- HTTPS enforced for all endpoints
- CORS properly configured for frontend
- LocalStorage for auth state (client-side only)
- Webhook signature verification (Svix)

## Performance Targets
- Cold start: < 200ms
- API response: < 100ms
- Database queries: < 50ms
- Authentication: < 300ms

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Support
- iOS Safari 14+
- Android Chrome 90+
- Responsive design required

## Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing for authentication flows:
  - Direct Clerk domain redirects
  - Callback parameter handling
  - LocalStorage persistence
  - Graceful degradation
  - Manual auth simulation
  - API connectivity
