# Turso Database Setup

Your Turso database is already configured!

## Database Information
- **Database Name**: MBTI
- **URL**: `libsql://mbti-naas1201.aws-ap-northeast-1.turso.io`
- **Region**: AWS ap-northeast-1 (Tokyo)

## Initialize Database Schema

Run the SQL migration to create the tables:

```bash
# Install Turso CLI if not already installed
# brew install tursodatabase/tap/turso  # macOS
# curl -sSfL https://get.tur.so/install.sh | bash  # Linux

# Login to Turso
turso auth login

# Apply the schema
turso db shell mbti-naas1201 < drizzle/schema.sql
```

Or manually run the SQL:

```bash
turso db shell mbti-naas1201
```

Then paste the contents of `drizzle/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  mbti_type TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
```

## Verify Setup

Check if tables were created:

```bash
turso db shell mbti-naas1201 "SELECT name FROM sqlite_master WHERE type='table';"
```

You should see:
- users
- test_results

## Environment Variables

Your `.dev.vars` file is configured with:
- ✅ TURSO_DATABASE_URL
- ✅ TURSO_AUTH_TOKEN
- ✅ CLERK_SECRET_KEY

## Production Deployment

When deploying to Cloudflare, set the secrets:

```bash
wrangler secret put TURSO_DATABASE_URL
# Paste: libsql://mbti-naas1201.aws-ap-northeast-1.turso.io

wrangler secret put TURSO_AUTH_TOKEN
# Paste: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

wrangler secret put CLERK_SECRET_KEY
# Paste: sk_test_Pkn7aJ0ijhpbdSA6dmWGToQ4yc0O0hllUSioOdX930
```

## Test the Connection

After setting up, test the database connection:

```bash
npm run dev
```

Then in another terminal:

```bash
curl http://localhost:8787/api/health
```

You should see: `{"status":"ok","message":"Health Check"}`
