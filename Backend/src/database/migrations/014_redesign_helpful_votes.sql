-- Step 1: Add user_id column
DO $$ BEGIN
    ALTER TABLE review_helpful_votes ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Step 2: Migrate data (if any)
UPDATE review_helpful_votes rv
SET user_id = (
  SELECT c.user_id 
  FROM customers c 
  WHERE c.id = rv.customer_id
)
WHERE customer_id IS NOT NULL;

-- Step 3: Drop old unique constraint and foreign key
DO $$ BEGIN
    ALTER TABLE review_helpful_votes DROP CONSTRAINT IF EXISTS review_helpful_votes_review_id_customer_id_key;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE review_helpful_votes DROP CONSTRAINT IF EXISTS review_helpful_votes_customer_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Step 4: Drop customer_id column
DO $$ BEGIN
    ALTER TABLE review_helpful_votes DROP COLUMN IF EXISTS customer_id;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- Step 5: Add new unique constraint and foreign key
DO $$ BEGIN
    ALTER TABLE review_helpful_votes
      ADD CONSTRAINT review_helpful_votes_review_id_user_id_key UNIQUE (review_id, user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE review_helpful_votes
      ADD CONSTRAINT review_helpful_votes_user_id_fkey
      FOREIGN KEY (user_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
