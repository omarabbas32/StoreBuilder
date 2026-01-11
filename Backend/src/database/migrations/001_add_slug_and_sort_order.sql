-- Add slug to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
-- Fill existing categories with a slug based on name if needed (optional but good)
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;
ALTER TABLE categories ADD CONSTRAINT categories_slug_store_id_key UNIQUE (slug, store_id);

-- Add sort_order to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
