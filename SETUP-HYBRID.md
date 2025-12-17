# Hybrid Setup: Next.js Auth + Cloudflare Workers API

This project uses **Next.js for authentication** and **Cloudflare Workers for the API/backend**.

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐
│   Next.js App   │ ◄─────► │  Cloudflare Worker   │
│  (Port 3000)    │         │    (Port 8787)       │
│                 │         │                      │
│  - Clerk Auth   │         │  - API Routes        │
│  - Sign In/Up   │         │  - Database (Turso)  │
│  - Session Mgmt │         │  - MBTI Logic        │
└─────────────────┘         └──────────────────────┘
```

## Setup Steps

### 1. Next.js App (Authentication)

Create an API route to expose the session token to the Worker:

**File: `app/api/auth/session/route.ts`**

```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { getToken, userId } = await auth();

  if (!userId) {
    return Response.json({ token: null }, { status: 401 });
  }

  const token = await getToken();

  return Response.json({ token }, {
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:8787', // Your Worker URL
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}
```

**Update your Next.js CORS middleware:**

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 2. Cloudflare Worker (API)

The Worker is already set up! Just configure CORS:

**Update `src/index.ts`** to add CORS middleware:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Add CORS middleware
app.use('/api/*', cors({
  origin: 'http://localhost:3000', // Your Next.js URL
  credentials: true,
}));

// ... rest of your routes
```

### 3. Frontend Configuration

**Update `public/index.html`** to use the hybrid app:

Replace the script tag:
```html
<!-- Change from: -->
<script src="/app.js"></script>

<!-- To: -->
<script src="/app-hybrid.js"></script>
```

**Configure URLs in `public/app-hybrid.js`:**

```javascript
// Line 19-20
const NEXTJS_AUTH_URL = 'http://localhost:3000'; // Your Next.js app
const WORKER_API_URL = 'http://localhost:8787';  // Your Worker
```

For production:
```javascript
const NEXTJS_AUTH_URL = 'https://your-nextjs-app.vercel.app';
const WORKER_API_URL = 'https://your-worker.workers.dev';
```

## Running the Apps

### Terminal 1: Next.js (Port 3000)
```bash
cd your-nextjs-app
npm run dev
```

### Terminal 2: Cloudflare Worker (Port 8787)
```bash
cd mbti2
npm install
npm run dev
```

### Access the App

1. **Authentication**: Go to `http://localhost:3000` to sign in
2. **MBTI Test**: Access `http://localhost:8787` to take the test
3. The apps will communicate via API calls

## How It Works

1. User visits the Worker app at `http://localhost:8787`
2. Worker serves the static HTML/JS from `public/` folder
3. When user clicks "Sign In", they're redirected to Next.js at `http://localhost:3000/sign-in`
4. After signing in, user is redirected back to the Worker app
5. Worker app calls Next.js API route to get the session token
6. Worker app sends test results to Worker API with the token
7. Worker validates the token with Clerk and saves to database

## Production Deployment

### Deploy Next.js to Vercel
```bash
vercel deploy
```

### Deploy Worker to Cloudflare
```bash
# Set production secrets
wrangler secret put CLERK_SECRET_KEY
wrangler secret put TURSO_DATABASE_URL
wrangler secret put TURSO_AUTH_TOKEN

# Deploy
wrangler deploy
```

### Update Production URLs

In `public/app-hybrid.js`, update:
```javascript
const NEXTJS_AUTH_URL = 'https://your-app.vercel.app';
const WORKER_API_URL = 'https://your-worker.workers.dev';
```

## Alternative: Same Domain Setup

If you want both on the same domain, use Cloudflare Workers to proxy Next.js:

- `yourdomain.com/*` → Cloudflare Worker (MBTI test)
- `yourdomain.com/auth/*` → Next.js app (authentication)

This eliminates CORS issues!
