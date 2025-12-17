// src/types.ts - TypeScript Types for Cloudflare Worker
export interface Env {
  // Static Assets
  ASSETS: Fetcher;

  // Analytics Engine (FREE tier)
  ANALYTICS: AnalyticsEngineDataset;

  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;

  // Turso Database
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;

  // Environment
  ENVIRONMENT: string;
}

// User types
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
}

// Test types
export interface Test {
  id: string;
  title: string;
  description: string | null;
  version: number;
  question_count: number;
  estimated_time_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Question types
export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  question_type: string;
  dimension: string;
  weight: number;
  display_order: number;
  created_at: string;
}

// Answer Option types
export interface AnswerOption {
  id: string;
  question_id: string;
  option_text: string;
  option_value: number;
  display_order: number;
  created_at: string;
}

// Test Result types
export interface TestResult {
  id: string;
  user_id: string;
  test_id: string;
  ei_score: number | null;
  sn_score: number | null;
  tf_score: number | null;
  jp_score: number | null;
  mbti_type: string | null;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
  created_at: string;
}

// User Answer types
export interface UserAnswer {
  id: string;
  test_result_id: string;
  question_id: string;
  answer_option_id: string;
  answer_value: number;
  answered_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface AuthToken {
  sub: string;
  userId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

// Clerk Webhook types
export interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    created_at: number;
    updated_at: number;
  };
}

// MBTI Scoring types
export interface MBTIScores {
  EI: number;  // Extraversion-Introversion
  SN: number;  // Sensing-Intuition
  TF: number;  // Thinking-Feeling
  JP: number;  // Judging-Perceiving
}

// Test Submission types
export interface TestSubmission {
  answers: number[];
  userId?: string;
}

// Health Check types
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
  version?: string;
  uptime?: number;
}
