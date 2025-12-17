# stack.md - Tech Stack Manifesto

## Core Technologies
- **Runtime**: Cloudflare Workers
- **Framework**: Hono v4.0.0
- **Database**: Turso (libSQL) v0.5.0
- **Authentication**: Clerk v1.0.0
- **Language**: TypeScript v5.0.0
- **Build Tool**: Wrangler v3.80.0

## Frontend (Next.js Integration)
- **Framework**: Next.js 14 App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: @clerk/nextjs

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

## Cloudflare Services Used
1. **Workers**: Serverless compute
2. **Workers KV**: Key-value storage (if needed)
3. **Analytics Engine**: Request analytics
4. **Observability**: Logging and monitoring

## External Services
1. **Turso**: Edge database (libSQL)
2. **Clerk**: Authentication and user management
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
├── drizzle/             # Database migrations
├── nextjs-integration/  # Frontend Next.js app
└── wrangler.toml        # Cloudflare configuration
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

## Security Standards
- All API keys stored as environment variables
- Clerk for authentication (never custom auth)
- Turso with secure connections
- HTTPS enforced for all endpoints
- CORS properly configured for frontend

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
- Manual testing for authentication flows
