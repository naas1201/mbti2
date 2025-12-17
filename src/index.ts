import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware, AuthEnv, AuthContext } from "./middleware/auth";
import { getDb, Env as DbEnv } from "./db";
import { calculateMBTI } from "./lib/scoring";
import { questions } from "./lib/questions";

type Bindings = {
  ASSETS: Fetcher;
} & AuthEnv &
  DbEnv;

type Variables = AuthContext;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS middleware for API routes (allows requests from custom domain)
app.use(
  "/api/*",
  cors({
    origin: [
      "https://type.va-n.com",
      "https://mbti-app.qmpro.workers.dev",
      "http://localhost:8787",
    ],
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/api/health", (c) => {
  return c.json({ status: "ok", message: "Health Check" });
});

app.get("/api/questions", (c) => {
  return c.json({ questions });
});

app.post("/api/submit-test", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { answers } = body;

    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return c.json({ error: "Invalid answers format" }, 400);
    }

    // Validate all answers are numbers between 1 and 5
    const validAnswers = answers.every(
      (answer) => typeof answer === "number" && answer >= 1 && answer <= 5,
    );

    if (!validAnswers) {
      return c.json(
        { error: "All answers must be numbers between 1 and 5" },
        400,
      );
    }

    // Calculate MBTI type
    const mbtiType = calculateMBTI(answers);

    // Get user ID from auth context
    const userId = c.get("userId");

    // Save to database
    const db = getDb(c.env);

    // First, ensure user exists or get user_id from clerk_id
    const userResult = await db.execute({
      sql: "SELECT id FROM users WHERE clerk_id = ?",
      args: [userId],
    });

    let dbUserId: number;

    if (userResult.rows.length === 0) {
      // User doesn't exist, create them
      const insertUser = await db.execute({
        sql: "INSERT INTO users (clerk_id, email, created_at) VALUES (?, ?, unixepoch()) RETURNING id",
        args: [userId, "unknown@example.com"], // Email should ideally come from Clerk user data
      });
      dbUserId = insertUser.rows[0].id as number;
    } else {
      dbUserId = userResult.rows[0].id as number;
    }

    // Insert test result
    await db.execute({
      sql: "INSERT INTO test_results (user_id, mbti_type, answers_json, created_at) VALUES (?, ?, ?, unixepoch())",
      args: [dbUserId, mbtiType, JSON.stringify(answers)],
    });

    return c.json({
      success: true,
      mbtiType,
      message: `Your personality type is ${mbtiType}`,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    return c.json({ error: "Failed to submit test" }, 500);
  }
});

app.all("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
