-- Drop constraints on review_helpful_votes
ALTER TABLE "review_helpful_votes" DROP CONSTRAINT IF EXISTS "review_helpful_votes_review_id_customer_id_key";
ALTER TABLE "review_helpful_votes" DROP CONSTRAINT IF EXISTS "ReviewHelpfulVote_customer_id_fkey";

-- Drop constraints on product_reviews
ALTER TABLE "product_reviews" DROP CONSTRAINT IF EXISTS "ProductReview_customer_id_fkey";
ALTER TABLE "product_reviews" DROP CONSTRAINT IF EXISTS "product_reviews_product_id_customer_id_key";

-- Drop indexes if they exist
DROP INDEX IF EXISTS "review_helpful_votes_review_id_customer_id_key";
DROP INDEX IF EXISTS "product_reviews_product_id_customer_id_key";
