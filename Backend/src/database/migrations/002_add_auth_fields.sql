-- ============================================
-- ADD AUTHENTICATION FIELDS TO USERS
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);
        ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
        ALTER TABLE users ADD COLUMN reset_expires TIMESTAMP;
    END IF;
END $$;
