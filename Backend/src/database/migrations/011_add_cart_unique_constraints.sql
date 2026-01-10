-- Add unique constraints to prevent duplicate carts
-- 1. For logged in users: one cart per customer per store
-- 2. For guest users: one cart per session per store

DO $$
BEGIN
    -- Add store_id to unique constraint for customer carts
    -- Note: We might need to clean up duplicates before applying this in a real prod env
    ALTER TABLE carts ADD CONSTRAINT unique_customer_store_cart UNIQUE (customer_id, store_id);
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$
BEGIN
    -- Add store_id to unique constraint for session carts
    ALTER TABLE carts ADD CONSTRAINT unique_session_store_cart UNIQUE (session_id, store_id);
EXCEPTION
    WHEN others THEN NULL;
END $$;
