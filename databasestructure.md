# databasestructure.md - Database Schema Tracking

## Current Database Schema
Last Updated: 2024-12-15

### Users Table
Stores user profiles synced from Clerk authentication system.

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,                    -- Clerk user ID
    email TEXT UNIQUE NOT NULL,            -- User email address
    first_name TEXT,                       -- User first name
    last_name TEXT,                        -- User last name
    image_url TEXT,                        -- Profile image URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,                  -- Last login timestamp
    is_active BOOLEAN DEFAULT TRUE         -- Account status
);
```

### Tests Table
MBTI test definitions and metadata.

```sql
CREATE TABLE tests (
    id TEXT PRIMARY KEY,                    -- Test identifier
    title TEXT NOT NULL,                   -- Test title
    description TEXT,                      -- Test description
    version INTEGER DEFAULT 1,             -- Test version
    question_count INTEGER NOT NULL,       -- Number of questions
    estimated_time_minutes INTEGER,        -- Estimated completion time
    is_active BOOLEAN DEFAULT TRUE,        -- Whether test is available
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Questions Table
Individual questions for MBTI tests.

```sql
CREATE TABLE questions (
    id TEXT PRIMARY KEY,                    -- Question identifier
    test_id TEXT NOT NULL,                 -- Reference to tests table
    question_text TEXT NOT NULL,           -- The question text
    question_type TEXT NOT NULL,           -- 'multiple_choice', 'likert_scale', etc.
    dimension TEXT NOT NULL,               -- MBTI dimension: 'EI', 'SN', 'TF', 'JP'
    weight DECIMAL(3,2) DEFAULT 1.0,      -- Question weight (1.0 = normal)
    display_order INTEGER NOT NULL,        -- Order within test
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
```

### Answer Options Table
Available answer options for questions.

```sql
CREATE TABLE answer_options (
    id TEXT PRIMARY KEY,                    -- Answer option identifier
    question_id TEXT NOT NULL,             -- Reference to questions table
    option_text TEXT NOT NULL,             -- The answer text
    option_value INTEGER NOT NULL,         -- Numerical value (-2 to +2 typically)
    display_order INTEGER NOT NULL,        -- Display order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
```

### Test Results Table
User test submissions and overall results.

```sql
CREATE TABLE test_results (
    id TEXT PRIMARY KEY,                    -- Result identifier
    user_id TEXT NOT NULL,                 -- Reference to users table
    test_id TEXT NOT NULL,                 -- Reference to tests table
    ei_score DECIMAL(5,2),                 -- Extraversion-Introversion score
    sn_score DECIMAL(5,2),                 -- Sensing-Intuition score
    tf_score DECIMAL(5,2),                 -- Thinking-Feeling score
    jp_score DECIMAL(5,2),                 -- Judging-Perceiving score
    mbti_type TEXT,                        -- Final MBTI type (e.g., 'INTJ')
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,                -- When test was completed
    is_completed BOOLEAN DEFAULT FALSE,    -- Whether test is finished
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
```

### User Answers Table
Individual answers to questions within a test.

```sql
CREATE TABLE user_answers (
    id TEXT PRIMARY KEY,                    -- Answer identifier
    test_result_id TEXT NOT NULL,          -- Reference to test_results table
    question_id TEXT NOT NULL,             -- Reference to questions table
    answer_option_id TEXT NOT NULL,        -- Selected answer option
    answer_value INTEGER NOT NULL,         -- Numerical value of answer
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_option_id) REFERENCES answer_options(id) ON DELETE CASCADE
);
```

## Indexes for Performance
```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);

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

-- User answers indexes
CREATE INDEX idx_user_answers_test_result_id ON user_answers(test_result_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_answered_at ON user_answers(answered_at);
```

## Relationships
1. **One-to-Many**: Users → Test Results (one user can have multiple test results)
2. **One-to-Many**: Tests → Questions (one test has many questions)
3. **One-to-Many**: Questions → Answer Options (one question has multiple answer options)
4. **One-to-Many**: Test Results → User Answers (one test result has many answers)

## Scalability Considerations
1. **Partitioning Strategy**: Consider partitioning test_results by user_id for large datasets
2. **Archiving**: Old test results can be moved to archive tables after 2 years
3. **Caching**: Frequently accessed test definitions can be cached in Workers KV
4. **Read Replicas**: Turso supports read replicas for high-traffic scenarios

## Data Retention Policy
- **Active user data**: Keep indefinitely while account is active
- **Inactive user data**: Archive after 2 years of inactivity
- **Test results**: Keep for 5 years minimum
- **Audit logs**: Keep for 7 years for compliance

## Migration History
### Version 1.0 (Initial Schema)
- Created all core tables: users, tests, questions, answer_options, test_results, user_answers
- Added basic indexes for performance
- Established foreign key relationships

## Notes
- All timestamps are in UTC
- Text IDs use UUID v4 format for global uniqueness
- Decimal precision is optimized for MBTI scoring ranges (-100.00 to +100.00)
- Foreign keys enforce referential integrity
- Indexes are optimized for common query patterns
