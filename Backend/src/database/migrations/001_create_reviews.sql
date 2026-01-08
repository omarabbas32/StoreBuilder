-- ============================================
-- ADD PRODUCT RATINGS & REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- only verified purchases
  
  -- Review Content
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  
  -- Media
  images JSONB DEFAULT '[]', -- [{url: "...", alt: "..."}]
  
  -- Moderation
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, flagged
  is_verified_purchase BOOLEAN DEFAULT false,
  
  -- Store Owner Response
  owner_response TEXT,
  owner_response_at TIMESTAMP,
  
  -- Helpful votes (optional feature)
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_store ON product_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

-- Track who found review helpful
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(review_id, customer_id)
);

-- Add aggregated rating stats to products table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='average_rating') THEN
        ALTER TABLE products ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0;
        ALTER TABLE products ADD COLUMN reviews_count INT DEFAULT 0;
        ALTER TABLE products ADD COLUMN ratings_distribution JSONB DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}';
    END IF;
END $$;

-- Add reviews feature flag to store_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_settings' AND column_name='reviews_enabled') THEN
        ALTER TABLE store_settings ADD COLUMN reviews_enabled BOOLEAN DEFAULT false;
        ALTER TABLE store_settings ADD COLUMN reviews_require_approval BOOLEAN DEFAULT true;
        ALTER TABLE store_settings ADD COLUMN reviews_verified_only BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Function to update product rating stats
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND status = 'approved'
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND status = 'approved'
    ),
    ratings_distribution = (
      SELECT jsonb_build_object(
        '1', COUNT(*) FILTER (WHERE rating = 1),
        '2', COUNT(*) FILTER (WHERE rating = 2),
        '3', COUNT(*) FILTER (WHERE rating = 3),
        '4', COUNT(*) FILTER (WHERE rating = 4),
        '5', COUNT(*) FILTER (WHERE rating = 5)
      )
      FROM product_reviews
      WHERE product_id = NEW.product_id AND status = 'approved'
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats
DROP TRIGGER IF EXISTS trigger_update_rating_stats ON product_reviews;
CREATE TRIGGER trigger_update_rating_stats
AFTER INSERT OR UPDATE OF status, rating ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating_stats();
