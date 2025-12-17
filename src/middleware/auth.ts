import { createClerkClient } from "@clerk/backend";
import { Context, Next } from "hono";
import type { Env } from "../types";

export interface AuthEnv {
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  ANALYTICS: AnalyticsEngineDataset;
  ENVIRONMENT: string;
}

export interface AuthContext {
  userId: string;
  sessionId: string;
}

export async function authMiddleware(
  c: Context<{ Bindings: AuthEnv & Env; Variables: AuthContext }>,
  next: Next,
) {
  const start = Date.now();
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Track missing auth header
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["auth_error", "missing_header", c.req.url],
        doubles: [Date.now() - start],
        indexes: ["auth_error"],
      }),
    );

    return c.json(
      {
        error: "Unauthorized",
        message: "Missing or invalid Authorization header",
        code: "AUTH_HEADER_MISSING",
      },
      401,
    );
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

    if (!verifiedToken || !verifiedToken.sub || !verifiedToken.sessionId) {
      // Track invalid token
      c.executionCtx.waitUntil(
        c.env.ANALYTICS.writeDataPoint({
          blobs: ["auth_error", "invalid_token", c.req.url],
          doubles: [Date.now() - start],
          indexes: ["auth_error"],
        }),
      );

      return c.json(
        {
          error: "Unauthorized",
          message: "Invalid authentication token",
          code: "INVALID_TOKEN",
        },
        401,
      );
    }

    // Set user context
    c.set("userId", verifiedToken.sub);
    c.set("sessionId", verifiedToken.sessionId);

    // Track successful authentication
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["auth_success", verifiedToken.sub, c.req.url],
        doubles: [Date.now() - start],
        indexes: ["auth"],
      }),
    );

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    // Track auth error
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["auth_error", "verification_failed", error.message, c.req.url],
        doubles: [Date.now() - start],
        indexes: ["auth_error"],
      }),
    );

    return c.json(
      {
        error: "Unauthorized",
        message: "Token verification failed",
        code: "VERIFICATION_FAILED",
        details:
          c.env.ENVIRONMENT === "development" ? error.message : undefined,
      },
      401,
    );
  }
}
