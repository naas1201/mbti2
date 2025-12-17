import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware, AuthEnv, AuthContext } from "./middleware/auth";
import { getDb, Env as DbEnv } from "./db";
import { calculateMBTI, getDimensionScores, calculateAnswerVariance, getPersonalityDescription } from "./lib/scoring";
import { questions } from "./lib/questions";
import clerkWebhook from "./webhooks/clerk";
import type { Env } from "./types";

type Bindings = Env & AuthEnv & DbEnv;
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

// Mount Clerk webhook routes
app.route("/", clerkWebhook);

app.get("/api/health", (c) => {
  const start = Date.now();

  // Track health check in analytics
  c.executionCtx.waitUntil(
    c.env.ANALYTICS.writeDataPoint({
      blobs: ["health_check", c.req.method, c.req.url],
      doubles: [Date.now() - start],
      indexes: ["health"],
    }),
  );

  return c.json({
    status: "ok",
    message: "Health Check",
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || "development",
  });
});

app.get("/api/questions", (c) => {
  const start = Date.now();

  try {
    // Track question request in analytics
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["questions_request", c.req.method],
        doubles: [Date.now() - start],
        indexes: ["questions"],
      }),
    );

    // Return questions in the format expected by frontend
    const formattedQuestions = questions.map((q, index) => ({
      id: q.id,
      text: q.text,
      dimension: q.dimension,
      weight: q.weight,
      displayOrder: index + 1
    }));

    return c.json({ 
      questions: formattedQuestions,
      total: questions.length,
      version: "v2.0"
    });
  } catch (error) {
    console.error("Error in questions endpoint:", error);

    // Track error in analytics
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["questions_error", c.req.method, error.message],
        doubles: [Date.now() - start],
        indexes: ["error"],
      }),
    );

    return c.json({ error: "Failed to load questions" }, 500);
  }
});

app.post("/api/submit-test", authMiddleware, async (c) => {
  const start = Date.now();

  try {
    const body = await c.req.json();
    const { answers } = body;

    if (!Array.isArray(answers) || answers.length !== questions.length) {
      // Track validation error
      c.executionCtx.waitUntil(
        c.env.ANALYTICS.writeDataPoint({
          blobs: ["test_validation_error", "invalid_format"],
          doubles: [Date.now() - start],
          indexes: ["error"],
        }),
      );

      return c.json({ 
        error: `Invalid answers format. Expected ${questions.length} answers, got ${answers?.length || 0}` 
      }, 400);
    }

    // Validate all answers are numbers between 1 and 5
    const validAnswers = answers.every(
      (answer) => typeof answer === "number" && answer >= 1 && answer <= 5,
    );

    if (!validAnswers) {
      // Track validation error
      c.executionCtx.waitUntil(
        c.env.ANALYTICS.writeDataPoint({
          blobs: ["test_validation_error", "invalid_values"],
          doubles: [Date.now() - start],
          indexes: ["error"],
        }),
      );

      return c.json(
        { error: "All answers must be numbers between 1 and 5" },
        400,
      );
    }

    // Calculate MBTI type with detailed scores
    const mbtiType = calculateMBTI(answers);
    const dimensionScores = getDimensionScores(answers);
    
    // Calculate turbulent/assertive score (based on consistency of answers)
    const answerVariance = calculateAnswerVariance(answers);
    const isTurbulent = answerVariance > 2.5; // Higher variance = more turbulent
    const fullMBTIType = mbtiType + (isTurbulent ? "-T" : "-A");

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
        sql: "INSERT INTO users (clerk_id, email, created_at, updated_at) VALUES (?, ?, unixepoch(), unixepoch())",
        args: [userId, "unknown@example.com"], // Email should ideally come from Clerk user data
      });
      
      // Get the inserted user ID
      const newUserResult = await db.execute({
        sql: "SELECT last_insert_rowid() as id",
        args: [],
      });
      dbUserId = newUserResult.rows[0].id as number;

      // Track new user creation
      c.executionCtx.waitUntil(
        c.env.ANALYTICS.writeDataPoint({
          blobs: ["new_user_created", userId],
          doubles: [Date.now() - start],
          indexes: ["user"],
        }),
      );
    } else {
      dbUserId = userResult.rows[0].id as number;
    }

    // Insert test result with detailed scores
    await db.execute({
      sql: `INSERT INTO test_results (
        user_id, 
        test_id, 
        mbti_type, 
        ei_score, 
        sn_score, 
        tf_score, 
        jp_score, 
        answer_variance, 
        is_turbulent, 
        answers_json, 
        is_completed, 
        completed_at, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, unixepoch(), unixepoch())`,
      args: [
        dbUserId, 
        'mbti-v2', 
        fullMBTIType, 
        dimensionScores.EI, 
        dimensionScores.SN, 
        dimensionScores.TF, 
        dimensionScores.JP, 
        answerVariance,
        isTurbulent,
        JSON.stringify(answers)
      ],
    });

    // Get the inserted test result ID
    const testResult = await db.execute({
      sql: "SELECT last_insert_rowid() as id",
      args: [],
    });
    
    const testResultId = testResult.rows[0].id as number;

    // Insert individual user answers
    for (let i = 0; i < answers.length; i++) {
      const question = questions[i];
      await db.execute({
        sql: `INSERT INTO user_answers (
          test_result_id, 
          question_id, 
          answer_value, 
          answered_at
        ) VALUES (?, ?, ?, unixepoch())`,
        args: [testResultId, question.id, answers[i]],
      });
    }

    // Track successful test submission
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["test_submitted", mbtiType, userId],
        doubles: [Date.now() - start],
        indexes: ["test"],
      }),
    );

    // Get personality description
    const personalityDescription = getPersonalityDescription(fullMBTIType, dimensionScores);
    
    return c.json({
      success: true,
      mbtiType: fullMBTIType,
      baseType: mbtiType,
      dimensionScores,
      isTurbulent,
      answerVariance,
      personalityDescription,
      message: `Your personality type is ${fullMBTIType}`,
      detailedMessage: personalityDescription.summary,
    });
  } catch (error) {
    console.error("Error submitting test:", error);

    // Track error in analytics
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["test_submission_error", error.message],
        doubles: [Date.now() - start],
        indexes: ["error"],
      }),
    );

    return c.json({ error: "Failed to submit test" }, 500);
  }
});

app.all("*", async (c) => {
  const start = Date.now();
  const url = new URL(c.req.url);

  try {
    // Serve static assets
    const response = await c.env.ASSETS.fetch(c.req.raw);

    // Track asset requests in analytics (excluding API routes)
    if (!url.pathname.startsWith("/api/")) {
      c.executionCtx.waitUntil(
        c.env.ANALYTICS.writeDataPoint({
          blobs: ["asset_request", url.pathname, c.req.method],
          doubles: [Date.now() - start],
          indexes: ["asset"],
        }),
      );
    }

    return response;
  } catch (error) {
    console.error("Error serving asset:", error);

    // Track asset error in analytics
    c.executionCtx.waitUntil(
      c.env.ANALYTICS.writeDataPoint({
        blobs: ["asset_error", url.pathname, error.message],
        doubles: [Date.now() - start],
        indexes: ["error"],
      }),
    );

    // Return a fallback response for SPA
    if (url.pathname.startsWith("/api/")) {
      return c.json({ error: "API endpoint not found" }, 404);
    }

    // For SPA, return index.html for any non-API route
    return c.env.ASSETS.fetch(
      new Request(new URL("/index.html", c.req.url), c.req.raw),
    );
  }
});

export default app;
