-- Migration: Extend Store Info
ALTER TABLE stores 
ADD COLUMN tagline VARCHAR(255),
ADD COLUMN business_hours JSONB DEFAULT '{}',
ADD COLUMN contact_email VARCHAR(255),
ADD COLUMN contact_phone VARCHAR(50),
ADD COLUMN address TEXT,
ADD COLUMN facebook_url VARCHAR(500),
ADD COLUMN instagram_url VARCHAR(500),
ADD COLUMN twitter_url VARCHAR(500),
ADD COLUMN linkedin_url VARCHAR(500),
ADD COLUMN tiktok_url VARCHAR(500);
