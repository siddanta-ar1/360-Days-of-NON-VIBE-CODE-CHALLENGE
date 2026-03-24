CREATE TABLE massive_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
    );

INSERT INTO massive_users (email)
SELECT 'student_' ||seq ||'@noteacher.com'
FROM generate_series(1, 1000000) seq;

EXPLAIN ANALYZE
SELECT * FROM massive_users WHERE email = 'student_999999@noteacher.com';

CREATE INDEX idx_massive_users_email ON massive_users(email);

EXPLAIN ANALYZE
SELECT * FROM massive_users WHERE email = 'student_999999@noteacher.com';
