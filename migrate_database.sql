-- Database Migration Script for MBTI Application
-- This script updates the existing database schema to match the required structure

-- 1. First, check if we need to add columns to existing tables

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN first_name TEXT;
ALTER TABLE users ADD COLUMN last_name TEXT;
ALTER TABLE users ADD COLUMN image_url TEXT;
ALTER TABLE users ADD COLUMN updated_at INTEGER DEFAULT (unixepoch());
ALTER TABLE users ADD COLUMN last_login INTEGER;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Add missing columns to test_results table
ALTER TABLE test_results ADD COLUMN test_id TEXT DEFAULT 'mbti-v1';
ALTER TABLE test_results ADD COLUMN ei_score DECIMAL(5,2);
ALTER TABLE test_results ADD COLUMN sn_score DECIMAL(5,2);
ALTER TABLE test_results ADD COLUMN tf_score DECIMAL(5,2);
ALTER TABLE test_results ADD COLUMN jp_score DECIMAL(5,2);
ALTER TABLE test_results ADD COLUMN started_at INTEGER DEFAULT (unixepoch());
ALTER TABLE test_results ADD COLUMN completed_at INTEGER;
ALTER TABLE test_results ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;

-- 2. Create new tables that don't exist yet

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    question_count INTEGER NOT NULL,
    estimated_time_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    dimension TEXT NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0,
    display_order INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Create answer_options table
CREATE TABLE IF NOT EXISTS answer_options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    option_text TEXT NOT NULL,
    option_value INTEGER NOT NULL,
    display_order INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create user_answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id TEXT PRIMARY KEY,
    test_result_id INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    answer_option_id TEXT NOT NULL,
    answer_value INTEGER NOT NULL,
    answered_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_option_id) REFERENCES answer_options(id) ON DELETE CASCADE
);

-- 3. Insert default test data

-- Insert default MBTI test
INSERT OR IGNORE INTO tests (id, title, description, question_count, estimated_time_minutes) VALUES
('mbti-v1', 'MBTI Personality Assessment', 'Discover your personality type with this comprehensive assessment', 20, 5);

-- 4. Create indexes for performance

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Tests table indexes
CREATE INDEX IF NOT EXISTS idx_tests_is_active ON tests(is_active);
CREATE INDEX IF NOT EXISTS idx_tests_created_at ON tests(created_at);

-- Questions table indexes
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_dimension ON questions(dimension);
CREATE INDEX IF NOT EXISTS idx_questions_display_order ON questions(display_order);

-- Answer options indexes
CREATE INDEX IF NOT EXISTS idx_answer_options_question_id ON answer_options(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_options_display_order ON answer_options(display_order);

-- Test results indexes
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_test_results_is_completed ON test_results(is_completed);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON test_results(created_at);

-- User answers indexes
CREATE INDEX IF NOT EXISTS idx_user_answers_test_result_id ON user_answers(test_result_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at);

-- 5. Update existing data

-- Update existing test_results to have test_id
UPDATE test_results SET test_id = 'mbti-v1' WHERE test_id IS NULL;

-- Set completed_at for existing test results
UPDATE test_results SET completed_at = created_at, is_completed = TRUE WHERE completed_at IS NULL;

-- 6. Verify the migration

-- Show all tables
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';

-- Show users table structure
PRAGMA table_info(users);

-- Show test_results table structure
PRAGMA table_info(test_results);

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'test_results', COUNT(*) FROM test_results
UNION ALL
SELECT 'tests', COUNT(*) FROM tests
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'answer_options', COUNT(*) FROM answer_options
UNION ALL
SELECT 'user_answers', COUNT(*) FROM user_answers;
