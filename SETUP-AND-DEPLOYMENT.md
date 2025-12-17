# SETUP-AND-DEPLOYMENT.md - Comprehensive MBTI Test v2.0

## Overview
This document provides complete setup and deployment instructions for the Comprehensive MBTI Personality Test v2.0. The application features 60 questions, turbulent/assertive scoring, and full database integration.

## Prerequisites

### Required Accounts
1. **Cloudflare Account** - For Workers deployment
2. **Turso Account** - For edge database (libSQL)
3. **Clerk Account** - For authentication (Instance: `renewed-serval-10`)

### Required Software
- Node.js 18+ 
- npm 9+ or equivalent
- Turso CLI (`brew install turso` or `curl -sSfL https://get.turso.io | sh`)
- Wrangler CLI (`npm install -g wrangler`)

## Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd mbti2

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login
```

### 2. Database Setup

#### Create Turso Database
```bash
# Create new database (if needed)
turso db create mbti-database

# Get database URL and token
turso db show mbti-database --url
turso db tokens create mbti-database
```

#### Apply Database Migration
```bash
# Connect to your database and run migration
turso db shell mbti-database < migrate_database.sql
```

The migration script will:
- Create all required tables (users, tests, questions, answer_options, test_results, user_answers)
- Insert 60 comprehensive MBTI questions
- Create all necessary indexes for performance
- Set up the v2.0 test structure

### 3. Environment Configuration

#### Update wrangler.toml
Update these values in `wrangler.toml`:

```toml
[vars]
TURSO_DATABASE_URL = "libsql://your-database.turso.io"
TURSO_AUTH_TOKEN = "your-turso-token-here"
CLERK_SECRET_KEY = "your-clerk-secret-key-here"
```

#### Local Development (.dev.vars)
Create/update `.dev.vars` file:
```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token-here
CLERK_SECRET_KEY=your-clerk-secret-key-here
```

### 4. Clerk Configuration

#### Required Clerk Dashboard Settings
1. Go to https://dashboard.clerk.com/apps/renewed-serval-10
2. Navigate to **API Keys** → Copy your Secret Key
3. Navigate to **Redirects** → Add allowed redirect URLs:
   - `https://type.va-n.com/*` (your custom domain)
   - `https://mbti-app.qmpro.workers.dev/*` (workers.dev domain)
   - `http://localhost:8787/*` (local development)

#### Clerk Instance Details
- **Instance**: renewed-serval-10
- **Domain**: renewed-serval-10.accounts.dev
- **Publishable Key**: `pk_test_cmVuZXdlZC1zZXJ2YWwtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA`
- **Sign-In URL**: https://renewed-serval-10.accounts.dev/sign-in
- **Sign-Up URL**: https://renewed-serval-10.accounts.dev/sign-up

## Local Development

### Start Development Server
```bash
# Start local development server
npm run dev

# The application will be available at:
# http://localhost:8787
```

### Test the Application
```bash
# Run comprehensive test suite
./test-mbti.sh

# Or test specific components
./test-mbti.sh health        # Test health endpoint
./test-mbti.sh questions     # Test questions loading
./test-mbti.sh submit        # Test test submission
./test-mbti.sh frontend      # Test frontend loading
./test-mbti.sh all           # Run all tests
```

### Manual Testing
1. Open http://localhost:8787 in your browser
2. Click "Begin Test" to start the 60-question assessment
3. Answer all questions (1-5 scale)
4. View your comprehensive MBTI results with turbulent/assertive scoring
5. Sign in with Clerk to save results to your profile

## Deployment

### 1. Test Deployment
```bash
# Test deployment configuration
npx wrangler deploy --dry-run
```

### 2. Deploy to Staging
```bash
# Deploy to staging environment
npm run deploy:staging
# or
npx wrangler deploy --env staging
```

### 3. Deploy to Production
```bash
# Deploy to production environment
npm run deploy:prod
# or
npx wrangler deploy --env production
```

### 4. Verify Deployment
```bash
# Check deployment status
npx wrangler deployments list

# View logs
npx wrangler tail

# Filter logs by status
npx wrangler tail --status error
npx wrangler tail --method POST
```

## Application URLs

### Development
- **Local**: http://localhost:8787
- **Health Check**: http://localhost:8787/api/health
- **Questions API**: http://localhost:8787/api/questions

### Production
- **Main Application**: https://mbti-app.qmpro.workers.dev
- **Health Check**: https://mbti-app.qmpro.workers.dev/api/health
- **Custom Domain**: https://type.va-n.com (if configured)

## Database Management

### View Database Schema
```bash
# Connect to database shell
turso db shell mbti-database

# Show all tables
SELECT name FROM sqlite_master WHERE type='table';

# Show table structure
PRAGMA table_info(users);
PRAGMA table_info(test_results);
```

### Backup Database
```bash
# Create backup
turso db backup create mbti-database

# List backups
turso db backup list mbti-database

# Restore from backup
turso db backup restore mbti-database <backup-id>
```

### Monitor Database
```bash
# Show database usage
turso db show mbti-database

# Show replicas
turso db replicate list mbti-database

# Create read replica (for high traffic)
turso db replicate create mbti-database <region>
```

## Monitoring & Observability

### Cloudflare Analytics
- Built-in Analytics Engine tracks all requests
- View analytics in Cloudflare Dashboard
- Free tier: 10M writes/month

### Logging
```bash
# Live tail logs
npx wrangler tail

# Filter by specific path
npx wrangler tail --url /api/submit-test

# Filter by status code
npx wrangler tail --status 200
npx wrangler tail --status 4xx
npx wrangler tail --status 5xx
```

### Health Monitoring
```bash
# Test health endpoint
curl https://mbti-app.qmpro.workers.dev/api/health

# Expected response:
{
  "status": "ok",
  "message": "Health Check",
  "timestamp": "2024-12-17T10:30:00.000Z",
  "environment": "production"
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Test database connection
turso db shell mbti-database "SELECT 1 as test;"

# Verify environment variables
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN
```

#### 2. Clerk Authentication Issues
1. Verify Clerk publishable key in `wrangler.toml`
2. Check allowed redirect URLs in Clerk dashboard
3. Test Clerk URLs directly:
   - https://renewed-serval-10.accounts.dev/sign-in
   - https://renewed-serval-10.accounts.dev/sign-up

#### 3. Frontend Loading Issues
```bash
# Test frontend loading
curl -I https://mbti-app.qmpro.workers.dev/

# Check CSS loading
curl -I https://mbti-app.qmpro.workers.dev/mbti-styles.css
```

#### 4. Test Submission Errors
```bash
# Check test submission endpoint
curl -X POST https://mbti-app.qmpro.workers.dev/api/submit-test \
  -H "Content-Type: application/json" \
  -d '{"answers": [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]}'
```

### Performance Optimization

#### Database Indexes
The migration script creates optimal indexes for:
- User queries by email and clerk_id
- Test results by user_id and completion status
- Questions by test_id and dimension
- User answers by test_result_id

#### Caching Strategy
For high traffic, consider adding:
```toml
# In wrangler.toml
[[kv_namespaces]]
binding = "CACHE"
id = "cache-id"
```

#### Scaling Considerations
- **10,000+ users**: Add read replicas to Turso
- **100,000+ requests/day**: Implement Workers KV caching
- **1M+ requests/month**: Consider D1 database for analytics

## Security

### Environment Variables
- Never commit secrets to version control
- Use `.dev.vars` for local development
- Use Cloudflare Dashboard for production secrets
- Rotate tokens regularly

### Authentication
- All authentication handled by Clerk
- Never store passwords locally
- Use Clerk webhooks for user sync
- Implement proper session management

### Database Security
- Use Turso authentication tokens
- Implement row-level security if needed
- Regular backups and monitoring
- Audit logs for sensitive operations

## Maintenance

### Regular Tasks
1. **Weekly**: Check Cloudflare Analytics for anomalies
2. **Monthly**: Rotate database and API tokens
3. **Quarterly**: Update dependencies
4. **Yearly**: Review and update security practices

### Updates and Upgrades
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Update wrangler
npm install -g wrangler@latest
```

### Backup Strategy
1. **Daily**: Automated Turso backups
2. **Weekly**: Manual backup verification
3. **Monthly**: Full system backup including code

## Support

### Documentation
- `AI.md` - Project decisions and learnings
- `databasestructure.md` - Database schema documentation
- `stack.md` - Technology stack and versions
- `CLERK-AUTHENTICATION.md` - Clerk implementation details

### Testing
- `test-mbti.sh` - Comprehensive test suite
- `test-css-loading.sh` - CSS loading tests
- `test-clerk-urls.sh` - Clerk URL tests

### Monitoring
- Cloudflare Dashboard: https://dash.cloudflare.com
- Turso Dashboard: https://turso.tech
- Clerk Dashboard: https://dashboard.clerk.com

## Success Metrics

### Performance Targets
- **Cold start**: < 200ms
- **API response**: < 100ms
- **Test completion**: < 10 minutes
- **Database queries**: < 50ms

### Business Metrics
- **User signups**: Track via Clerk analytics
- **Test completions**: Database metrics
- **User retention**: Repeat test takers
- **Accuracy**: User feedback on results

## Conclusion

The Comprehensive MBTI Test v2.0 is production-ready with:
- ✅ 60-question comprehensive assessment
- ✅ Turbulent/Assertive scoring
- ✅ Full database integration
- ✅ Clerk authentication
- ✅ Cloudflare Workers deployment
- ✅ Comprehensive testing suite
- ✅ Complete documentation

For questions or issues, refer to the documentation or contact the development team.