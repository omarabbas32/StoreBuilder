-- Rename price to unit_price in order_items if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='order_items' AND column_name='price'
    ) THEN
        ALTER TABLE order_items RENAME COLUMN price TO unit_price;
    END IF;
END $$;
