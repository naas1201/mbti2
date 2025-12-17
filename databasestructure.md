# databasestructure.md - Database Schema Tracking (v2.0)

## Current Database Schema (v2.0)
Last Updated: 2024-12-17
Version: 2.0 - Comprehensive 60-question MBTI with turbulent/assertive scoring

### Users Table
Stores user profiles synced from Clerk authentication system.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Internal user ID
    clerk_id TEXT UNIQUE NOT NULL,          -- Clerk user ID
    email TEXT UNIQUE NOT NULL,             -- User email address
    first_name TEXT,                        -- User first name
    last_name TEXT,                         -- User last name
    image_url TEXT,                         -- Profile image URL
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    last_login INTEGER,                     -- Last login timestamp (unix epoch)
    is_active BOOLEAN DEFAULT TRUE          -- Account status
);
```

### Tests Table
MBTI test definitions and metadata.

```sql
CREATE TABLE tests (
    id TEXT PRIMARY KEY,                    -- Test identifier (e.g., 'mbti-v2')
    title TEXT NOT NULL,                    -- Test title
    description TEXT,                       -- Test description
    version TEXT DEFAULT '2.0',             -- Test version
    question_count INTEGER NOT NULL,        -- Number of questions (60 for v2.0)
    estimated_time_minutes INTEGER,         -- Estimated completion time (10 min)
    is_active BOOLEAN DEFAULT TRUE,         -- Whether test is available
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);
```

### Questions Table
Individual questions for MBTI tests.

```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY,                 -- Question identifier (1-60)
    test_id TEXT NOT NULL,                  -- Reference to tests table ('mbti-v2')
    question_text TEXT NOT NULL,            -- The question text
    dimension TEXT NOT NULL CHECK (dimension IN ('EI', 'SN', 'TF', 'JP')),
    weight DECIMAL(3,2) DEFAULT 1.0,        -- Question weight (-1.3 to +1.3)
    display_order INTEGER NOT NULL,         -- Order within test (1-60)
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
```

### Answer Options Table
Available answer options for questions.

```sql
CREATE TABLE answer_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Answer option identifier
    question_id INTEGER NOT NULL,           -- Reference to questions table
    option_text TEXT NOT NULL,              -- The answer text
    option_value INTEGER NOT NULL CHECK (option_value BETWEEN 1 AND 5),
    display_order INTEGER NOT NULL,         -- Display order (1-5)
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
```

### Test Results Table
User test submissions and overall results.

```sql
CREATE TABLE test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Result identifier
    user_id INTEGER NOT NULL,               -- Reference to users table
    test_id TEXT NOT NULL DEFAULT 'mbti-v2', -- Reference to tests table
    mbti_type TEXT NOT NULL,                -- Full MBTI type (e.g., 'INTJ-A', 'ENFP-T')
    ei_score DECIMAL(5,2),                  -- Extraversion-Introversion score (-40 to +40)
    sn_score DECIMAL(5,2),                  -- Sensing-Intuition score (-40 to +40)
    tf_score DECIMAL(5,2),                  -- Thinking-Feeling score (-40 to +40)
    jp_score DECIMAL(5,2),                  -- Judging-Perceiving score (-40 to +40)
    answer_variance DECIMAL(5,2),           -- Variance of answers (0-4)
    is_turbulent BOOLEAN,                   -- TRUE = Turbulent, FALSE = Assertive
    answers_json TEXT NOT NULL,             -- JSON array of all answers
    started_at INTEGER DEFAULT (unixepoch()),
    completed_at INTEGER,                   -- When test was completed (unix epoch)
    is_completed BOOLEAN DEFAULT FALSE,     -- Whether test is finished
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
```

### User Answers Table
Individual answers to questions within a test.

```sql
CREATE TABLE user_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Answer identifier
    test_result_id INTEGER NOT NULL,        -- Reference to test_results table
    question_id INTEGER NOT NULL,           -- Reference to questions table
    answer_value INTEGER NOT NULL CHECK (answer_value BETWEEN 1 AND 5),
    answered_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
```

## Indexes for Performance
```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Tests table indexes
CREATE INDEX idx_tests_is_active ON tests(is_active);
CREATE INDEX idx_tests_created_at ON tests(created_at);

-- Questions table indexes
CREATE INDEX idx_questions_test_id ON questions(test_id);
CREATE INDEX idx_questions_dimension ON questions(dimension);
CREATE INDEX idx_questions_display_order ON questions(display_order);

-- Answer options indexes
CREATE INDEX idx_answer_options_question_id ON answer_options(question_id);
CREATE INDEX idx_answer_options_display_order ON answer_options(display_order);

-- Test results indexes
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_test_id ON test_results(test_id);
CREATE INDEX idx_test_results_completed_at ON test_results(completed_at);
CREATE INDEX idx_test_results_is_completed ON test_results(is_completed);
CREATE INDEX idx_test_results_created_at ON test_results(created_at);
CREATE INDEX idx_test_results_mbti_type ON test_results(mbti_type);

-- User answers indexes
CREATE INDEX idx_user_answers_test_result_id ON user_answers(test_result_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_answered_at ON user_answers(answered_at);
```

## Relationships
1. **One-to-Many**: Users → Test Results (one user can have multiple test results)
2. **One-to-Many**: Tests → Questions (one test has many questions - 60 for v2.0)
3. **One-to-Many**: Questions → Answer Options (one question has 5 answer options: 1-5 scale)
4. **One-to-Many**: Test Results → User Answers (one test result has 60 answers)

## Scalability Considerations
1. **Partitioning Strategy**: Consider partitioning test_results by user_id for large datasets
2. **Archiving**: Old test results can be moved to archive tables after 2 years
3. **Caching**: Frequently accessed test definitions can be cached in Workers KV
4. **Read Replicas**: Turso supports read replicas for high-traffic scenarios
5. **Question Bank**: 60 questions provide comprehensive coverage while maintaining performance
6. **Answer Storage**: JSON storage of answers for quick retrieval, plus normalized table for analysis

## Data Retention Policy
- **Active user data**: Keep indefinitely while account is active
- **Inactive user data**: Archive after 2 years of inactivity
- **Test results**: Keep for 5 years minimum
- **Detailed answers**: Keep for 3 years, then keep only aggregated results
- **Audit logs**: Keep for 7 years for compliance

## Migration History
### Version 1.0 (Initial Schema)
- Created all core tables: users, tests, questions, answer_options, test_results, user_answers
- Added basic indexes for performance
- Established foreign key relationships
- 20-question MBTI test

### Version 2.0 (Comprehensive MBTI)
- Expanded to 60 questions for better accuracy
- Added turbulent/assertive scoring (T/A suffix)
- Enhanced scoring algorithm with weighted questions
- Added answer variance calculation
- Improved data types and constraints
- Added comprehensive personality descriptions
- Updated all indexes for better performance

## Notes
- All timestamps use Unix epoch integers for consistency
- Integer IDs with AUTOINCREMENT for performance
- Decimal precision optimized for MBTI scoring ranges (-40.00 to +40.00)
- Foreign keys enforce referential integrity with CASCADE delete
- Indexes optimized for common query patterns
- Answer scale: 1 (Strongly Disagree) to 5 (Strongly Agree)
- Turbulent/Assertive determination: variance > 2.5 = Turbulent (-T), else Assertive (-A)
- Question weights range from -1.3 to +1.3 for nuanced scoring
- Comprehensive 60-question test takes approximately 10 minutes to complete
