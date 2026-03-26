SELECT to_tsvector('english', 'The quick brown foxes are running fast');

CREATE TABLE lectures (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT
    );

INSERT INTO lectures (title, content) VALUES
('Physics 101', 'Today we are running through the basics of quantum mechanics.'),
('Biology 202', 'The fox is a fascinating creature.'),
('Math 303', 'Calculus requires you to run calculations quickly.');

ALTER TABLE lectures AND COLUMN search_vector tsvector
GENERATED ALWAYS AS (to_tsvector(
english', title ||' ' || content)) STORED;

CREATE INDEX idx_lectures_search ON lectures USING GIN (search_vetor);

EXPLAIN ANALYZE
SELECT title, content
FROM lectures
WHERE search_vector @@ plainto_tempory('english', 'run')
