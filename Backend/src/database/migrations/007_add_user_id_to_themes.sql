-- Add user_id to themes to allow personal design templates
ALTER TABLE themes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Add index for faster lookup of user templates
CREATE INDEX IF NOT EXISTS idx_themes_user_id ON themes(user_id);
