-- Step 1: Add new columns (non-breaking)
DO $$ BEGIN
    ALTER TABLE product_reviews ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE product_reviews ADD COLUMN reviewer_name VARCHAR(255);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE product_reviews ADD COLUMN reviewer_email VARCHAR(255);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE product_reviews ADD COLUMN updated_at TIMESTAMP(6) DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Step 2: Migrate existing data from customer to user (if any reviews exist)
DO $$ BEGIN
    -- Only run if customer_id still exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_reviews' AND column_name='customer_id') THEN
        UPDATE product_reviews pr
        SET user_id = (
          SELECT c.user_id 
          FROM customers c 
          WHERE c.id = pr.customer_id
        )
        WHERE customer_id IS NOT NULL;
    END IF;
END $$;

-- Step 3: Drop old foreign key constraint
DO $$ BEGIN
    ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS product_reviews_customer_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Step 4: Drop old index
DROP INDEX IF EXISTS idx_reviews_customer;

-- Step 5: Drop old column
DO $$ BEGIN
    ALTER TABLE product_reviews DROP COLUMN IF EXISTS customer_id;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- Step 6: Add new foreign key with SET NULL on delete
DO $$ BEGIN
    ALTER TABLE product_reviews
      ADD CONSTRAINT product_reviews_user_id_fkey
      FOREIGN KEY (user_id) 
      REFERENCES users(id) 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Step 7: Add new index
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
