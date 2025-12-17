-- Database Migration Script for MBTI Application v2.0
-- This script creates the comprehensive 60-question MBTI test with turbulent/assertive scoring

-- 1. First, ensure all required tables exist with proper structure

-- Ensure users table has all required columns
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    image_url TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    last_login INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Ensure test_results table has all required columns
CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    test_id TEXT NOT NULL DEFAULT 'mbti-v2',
    mbti_type TEXT NOT NULL,
    ei_score DECIMAL(5,2),
    sn_score DECIMAL(5,2),
    tf_score DECIMAL(5,2),
    jp_score DECIMAL(5,2),
    answer_variance DECIMAL(5,2),
    is_turbulent BOOLEAN,
    answers_json TEXT NOT NULL,
    started_at INTEGER DEFAULT (unixepoch()),
    completed_at INTEGER,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Create all required tables if they don't exist

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    version TEXT DEFAULT '2.0',
    question_count INTEGER NOT NULL,
    estimated_time_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY,
    test_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    dimension TEXT NOT NULL CHECK (dimension IN ('EI', 'SN', 'TF', 'JP')),
    weight DECIMAL(3,2) DEFAULT 1.0,
    display_order INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Create answer_options table
CREATE TABLE IF NOT EXISTS answer_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    option_value INTEGER NOT NULL CHECK (option_value BETWEEN 1 AND 5),
    display_order INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create user_answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_result_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_value INTEGER NOT NULL CHECK (answer_value BETWEEN 1 AND 5),
    answered_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 3. Insert comprehensive test data

-- Insert comprehensive MBTI test v2.0
INSERT OR IGNORE INTO tests (id, title, description, version, question_count, estimated_time_minutes) VALUES
('mbti-v2', 'Comprehensive MBTI Personality Assessment', 'Discover your personality type with 60 questions including turbulent/assertive scoring', '2.0', 60, 10);

-- 4. Insert all 60 questions for comprehensive assessment
INSERT OR IGNORE INTO questions (id, test_id, question_text, dimension, weight, display_order) VALUES
(1, 'mbti-v2', 'After a long week, I''d rather hit up a party with friends than chill alone at home.', 'EI', 1.2, 1),
(2, 'mbti-v2', 'I get energized by being around lots of people and social situations.', 'EI', 1.0, 2),
(3, 'mbti-v2', 'I tend to think out loud and process ideas by talking them through.', 'EI', 0.8, 3),
(4, 'mbti-v2', 'I need alone time to recharge, even if I had fun socializing.', 'EI', -1.0, 4),
(5, 'mbti-v2', 'I''m comfortable striking up conversations with strangers.', 'EI', 1.1, 5),
(6, 'mbti-v2', 'I prefer one-on-one conversations over group discussions.', 'EI', -0.9, 6),
(7, 'mbti-v2', 'Social events drain my energy rather than energize me.', 'EI', -1.2, 7),
(8, 'mbti-v2', 'I enjoy being the center of attention in social settings.', 'EI', 1.3, 8),
(9, 'mbti-v2', 'I process my thoughts internally before sharing them with others.', 'EI', -0.8, 9),
(10, 'mbti-v2', 'I have a wide circle of acquaintances and enjoy meeting new people.', 'EI', 1.0, 10),
(11, 'mbti-v2', 'I prefer deep conversations with a few close friends over small talk with many.', 'EI', -1.1, 11),
(12, 'mbti-v2', 'I often take initiative in social situations and group activities.', 'EI', 1.2, 12),
(13, 'mbti-v2', 'I need time to think before responding in conversations.', 'EI', -0.7, 13),
(14, 'mbti-v2', 'I enjoy networking events and meeting new professional contacts.', 'EI', 1.1, 14),
(15, 'mbti-v2', 'I feel most comfortable and authentic when I''m by myself.', 'EI', -1.3, 15),
(16, 'mbti-v2', 'I trust my gut feelings more than cold, hard facts when making decisions.', 'SN', 1.2, 16),
(17, 'mbti-v2', 'I''m more interested in future possibilities than what''s happening right now.', 'SN', 1.0, 17),
(18, 'mbti-v2', 'I notice small details—like if someone changed their hair or moved furniture.', 'SN', -1.1, 18),
(19, 'mbti-v2', 'I daydream a lot about abstract concepts and big-picture ideas.', 'SN', 1.3, 19),
(20, 'mbti-v2', 'I''m practical and prefer tried-and-true methods over experimental ones.', 'SN', -0.9, 20),
(21, 'mbti-v2', 'I enjoy brainstorming and coming up with creative, unconventional ideas.', 'SN', 1.2, 21),
(22, 'mbti-v2', 'I prefer concrete facts over abstract theories.', 'SN', -1.0, 22),
(23, 'mbti-v2', 'I often see patterns and connections that others miss.', 'SN', 1.1, 23),
(24, 'mbti-v2', 'I focus on what is rather than what could be.', 'SN', -0.8, 24),
(25, 'mbti-v2', 'I enjoy thinking about philosophical questions and existential concepts.', 'SN', 1.3, 25),
(26, 'mbti-v2', 'I prefer step-by-step instructions over figuring things out on my own.', 'SN', -1.1, 26),
(27, 'mbti-v2', 'I''m good at reading between the lines and understanding hidden meanings.', 'SN', 1.0, 27),
(28, 'mbti-v2', 'I trust my five senses more than my intuition.', 'SN', -1.2, 28),
(29, 'mbti-v2', 'I enjoy exploring new theories and concepts just for the sake of learning.', 'SN', 1.1, 29),
(30, 'mbti-v2', 'I prefer dealing with reality as it is rather than imagining alternatives.', 'SN', -0.9, 30),
(31, 'mbti-v2', 'When a friend is upset, I focus on solving their problem rather than just listening.', 'TF', 1.0, 31),
(32, 'mbti-v2', 'I''d rather be respected for my logic than loved for my empathy.', 'TF', 1.2, 32),
(33, 'mbti-v2', 'In an argument, I prioritize being fair over being kind.', 'TF', 1.1, 33),
(34, 'mbti-v2', 'I can set aside my feelings to make the most logical choice.', 'TF', 1.3, 34),
(35, 'mbti-v2', 'People describe me as warm and considerate rather than analytical.', 'TF', -1.0, 35),
(36, 'mbti-v2', 'I make decisions based on objective criteria rather than personal values.', 'TF', 1.2, 36),
(37, 'mbti-v2', 'I''m sensitive to other people''s feelings and emotional states.', 'TF', -1.1, 37),
(38, 'mbti-v2', 'I believe truth is more important than tact in most situations.', 'TF', 1.0, 38),
(39, 'mbti-v2', 'I often consider how my decisions will affect others emotionally.', 'TF', -1.3, 39),
(40, 'mbti-v2', 'I value justice and fairness over harmony and peace.', 'TF', 1.1, 40),
(41, 'mbti-v2', 'I''m good at comforting people and providing emotional support.', 'TF', -0.9, 41),
(42, 'mbti-v2', 'I prefer analyzing problems objectively rather than considering personal factors.', 'TF', 1.2, 42),
(43, 'mbti-v2', 'I often put others'' needs before my own.', 'TF', -1.0, 43),
(44, 'mbti-v2', 'I believe constructive criticism is more valuable than unconditional support.', 'TF', 1.1, 44),
(45, 'mbti-v2', 'I''m motivated by creating positive emotional experiences for others.', 'TF', -1.2, 45),
(46, 'mbti-v2', 'I like to have my day planned out rather than going with the flow.', 'JP', 1.2, 46),
(47, 'mbti-v2', 'Deadlines stress me out—I work better when I can be spontaneous.', 'JP', -1.1, 47),
(48, 'mbti-v2', 'I love making to-do lists and checking things off as I finish them.', 'JP', 1.3, 48),
(49, 'mbti-v2', 'I prefer to keep my options open rather than commit to a strict plan.', 'JP', -1.0, 49),
(50, 'mbti-v2', 'I feel uncomfortable when things are messy or unorganized.', 'JP', 1.1, 50),
(51, 'mbti-v2', 'I enjoy the freedom of last-minute changes and improvisation.', 'JP', -1.2, 51),
(52, 'mbti-v2', 'I prefer clear deadlines and structured schedules.', 'JP', 1.0, 52),
(53, 'mbti-v2', 'I work best under pressure and tight deadlines.', 'JP', -0.9, 53),
(54, 'mbti-v2', 'I like to have a clear plan before starting any project.', 'JP', 1.2, 54),
(55, 'mbti-v2', 'I enjoy exploring new opportunities as they arise rather than sticking to a plan.', 'JP', -1.1, 55),
(56, 'mbti-v2', 'I''m good at following through on commitments and finishing what I start.', 'JP', 1.3, 56),
(57, 'mbti-v2', 'I prefer flexible schedules that allow for spontaneity.', 'JP', -1.0, 57),
(58, 'mbti-v2', 'I feel stressed when things are uncertain or ambiguous.', 'JP', 1.1, 58),
(59, 'mbti-v2', 'I enjoy adapting to new information and changing my approach.', 'JP', -1.2, 59),
(60, 'mbti-v2', 'I believe structure and organization lead to better outcomes.', 'JP', 1.0, 60);

-- Insert answer options for all questions (1-5 scale)
-- We'll create a function to insert options for all 60 questions
INSERT OR IGNORE INTO answer_options (question_id, option_text, option_value, display_order)
SELECT q.id, 'Strongly Disagree', 1, 1 FROM questions q WHERE q.test_id = 'mbti-v2'
UNION ALL
SELECT q.id, 'Disagree', 2, 2 FROM questions q WHERE q.test_id = 'mbti-v2'
UNION ALL
SELECT q.id, 'Neutral', 3, 3 FROM questions q WHERE q.test_id = 'mbti-v2'
UNION ALL
SELECT q.id, 'Agree', 4, 4 FROM questions q WHERE q.test_id = 'mbti-v2'
UNION ALL
SELECT q.id, 'Strongly Agree', 5, 5 FROM questions q WHERE q.test_id = 'mbti-v2';

-- 5. Create indexes for performance

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
CREATE INDEX IF NOT EXISTS idx_test_results_mbti_type ON test_results(mbti_type);

-- User answers indexes
CREATE INDEX IF NOT EXISTS idx_user_answers_test_result_id ON user_answers(test_result_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at);

-- 6. Update existing data to new format

-- Update existing test_results to use new test_id format
UPDATE test_results SET test_id = 'mbti-v2' WHERE test_id IS NULL OR test_id = 'mbti-v1';

-- Set completed_at for existing test results
UPDATE test_results SET completed_at = created_at, is_completed = TRUE WHERE completed_at IS NULL;

-- 7. Verify the migration

-- Show all tables
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';

-- Show users table structure
PRAGMA table_info(users);

-- Show test_results table structure
PRAGMA table_info(test_results);

-- Show questions count
SELECT 'questions' as table_name, COUNT(*) as record_count FROM questions WHERE test_id = 'mbti-v2';

-- Show answer options count
SELECT 'answer_options' as table_name, COUNT(*) as record_count FROM answer_options 
WHERE question_id IN (SELECT id FROM questions WHERE test_id = 'mbti-v2');

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

-- 8. Migration completion message
SELECT '✅ Database migration to MBTI v2.0 completed successfully!' as migration_status;
