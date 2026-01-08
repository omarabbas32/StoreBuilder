-- Add store_id to carts table for isolation
ALTER TABLE carts ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_carts_store ON carts(store_id);
