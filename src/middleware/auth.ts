import { createClerkClient } from '@clerk/backend';
import { Context, Next } from 'hono';

export interface AuthEnv {
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
}

export interface AuthContext {
  userId: string;
}

export async function authMiddleware(c: Context<{ Bindings: AuthEnv; Variables: AuthContext }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const clerk = createClerkClient({
      publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    const verifiedToken = await clerk.verifyToken(token, {
      jwtKey: c.env.CLERK_PUBLISHABLE_KEY,
    });

    if (!verifiedToken || !verifiedToken.sub) {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }

    c.set('userId', verifiedToken.sub);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized: Token verification failed' }, 401);
  }
}
