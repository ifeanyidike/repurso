-- Drop the index if it exists
DROP INDEX IF EXISTS unique_email_idx;

-- Drop the table if it exists
DROP TABLE IF EXISTS users;

-- Drop the extension if it exists
DROP EXTENSION IF EXISTS citext;
