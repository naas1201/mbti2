// src/webhooks/clerk.ts - Clerk Webhook Handler for User Synchronization
import { Hono } from "hono";
import { createClerkClient } from "@clerk/backend";
import type { Env } from "../types";
import { getDb } from "../db";

const app = new Hono<{ Bindings: Env }>();

// Verify Clerk webhook signature
async function verifyClerkWebhook(
  request: Request,
  secretKey: string,
): Promise<boolean> {
  try {
    const payload = await request.text();
    const headers = request.headers;

    // Clerk sends these headers for webhook verification
    const svixId = headers.get("svix-id");
    const svixTimestamp = headers.get("svix-timestamp");
    const svixSignature = headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers for webhook verification");
      return false;
    }

    // In a real implementation, you would use the Svix library to verify the signature
    // For now, we'll accept the webhook if it has the expected headers
    // TODO: Implement proper Svix signature verification
    console.log("Webhook received with Svix headers:", {
      svixId,
      svixTimestamp,
      svixSignature: svixSignature.substring(0, 20) + "...",
    });

    return true;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return false;
  }
}

// Handle user creation/update from Clerk
async function handleUserEvent(event: any, env: Env) {
  try {
    const db = getDb(env);
    const userData = event.data;

    console.log("Processing user event:", {
      type: event.type,
      userId: userData.id,
      email: userData.email_addresses?.[0]?.email_address,
    });

    // Extract user information
    const clerkId = userData.id;
    const primaryEmail = userData.email_addresses?.[0]?.email_address || null;
    const firstName = userData.first_name || null;
    const lastName = userData.last_name || null;
    const imageUrl = userData.image_url || null;
    const createdAt = new Date(userData.created_at * 1000).toISOString();
    const updatedAt = new Date(userData.updated_at * 1000).toISOString();

    // Check if user already exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE clerk_id = ?",
      args: [clerkId],
    });

    if (existingUser.rows.length > 0) {
      // Update existing user
      await db.execute({
        sql: `
          UPDATE users
          SET
            email = COALESCE(?, email),
            first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            image_url = COALESCE(?, image_url),
            updated_at = ?,
            last_login = CURRENT_TIMESTAMP
          WHERE clerk_id = ?
        `,
        args: [
          primaryEmail,
          firstName,
          lastName,
          imageUrl,
          updatedAt,
          clerkId,
        ],
      });

      console.log("Updated existing user:", clerkId);
    } else {
      // Create new user
      await db.execute({
        sql: `
          INSERT INTO users (
            clerk_id,
            email,
            first_name,
            last_name,
            image_url,
            created_at,
            updated_at,
            last_login,
            is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, TRUE)
        `,
        args: [
          clerkId,
          primaryEmail,
          firstName,
          lastName,
          imageUrl,
          createdAt,
          updatedAt,
        ],
      });

      console.log("Created new user:", clerkId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling user event:", error);
    throw error;
  }
}

// Handle user deletion from Clerk
async function handleUserDeletion(event: any, env: Env) {
  try {
    const db = getDb(env);
    const userData = event.data;
    const clerkId = userData.id;

    console.log("Processing user deletion:", { userId: clerkId });

    // Soft delete user (mark as inactive)
    await db.execute({
      sql: "UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE clerk_id = ?",
      args: [clerkId],
    });

    console.log("Soft deleted user:", clerkId);
    return { success: true };
  } catch (error) {
    console.error("Error handling user deletion:", error);
    throw error;
  }
}

// Clerk webhook endpoint
app.post("/api/webhooks/clerk", async (c) => {
  const start = Date.now();
  const request = c.req.raw;

  try {
    // Verify webhook signature
    const isValid = await verifyClerkWebhook(request, c.env.CLERK_SECRET_KEY);
    if (!isValid) {
      // Track webhook verification failure
      c.executionCtx.waitUntil(
        c.env.ANALYTICS.writeDataPoint({
          blobs: ["webhook_error", "verification_failed", c.req.url],
          doubles: [Date.now() - start],
          indexes: ["webhook_error"],
        }),
      );

      return c.json({ error: "Invalid webhook signature" }, 401);
    }

    // Parse webhook payload
    const payload = await request.json();
    const eventType = payload.type;
    const eventData = payload.data;

    console.log("Received Clerk webhook:", { type: eventType, data: eventData });

    // Handle different event types
    let result;
    switch (eventType) {
      case "user.created":
      case "user.updated":
        result = await handleUserEvent(payload, c.env);
        break;

      case "user.deleted":
        result = await handleUserDeletion(payload, c.env);
        break;

      default:
        console.log("Unhandled webhook event type:", eventType);
        // Track unhandled event
        c.executionCtx.waitUntil(
          c.env.ANALYTICS.writeDataPoint({
            blobs: ["webhook_unhandled", eventType, c.req.url],
            doubles: [Date.now() - start],
            indexes: ["webhook"],
          }),
        );

        return c.json({ received: true, message: "Event type not handled" }, 200);
    }

    // Track successful webhook processing
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["webhook_success", eventType, c.req.url],
        doubles: [Date.now() - start],
        indexes: ["webhook"],
      }),
    );

    return c.json({ success: true, event: eventType });
  } catch (error) {
    console.error("Error processing Clerk webhook:", error);

    // Track webhook processing error
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["webhook_error", "processing_failed", error.message, c.req.url],
        doubles: [Date.now() - start],
        indexes: ["webhook_error"],
      }),
    );

    return c.json(
      {
        error: "Failed to process webhook",
        message: error.message,
      },
      500,
    );
  }
});

// Webhook health check endpoint
app.get("/api/webhooks/clerk/health", (c) => {
  return c.json({
    status: "ok",
    message: "Clerk webhook handler is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;
