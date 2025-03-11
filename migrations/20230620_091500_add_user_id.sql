-- Migration: Add User ID to Calculations
-- Adds a user_id column to track which user performed the calculation

-- Add user_id column
ALTER TABLE calculations 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) NULL;

-- Add index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_calculations_user_id 
ON calculations (user_id);

-- Record that this migration has been applied
INSERT INTO schema_migrations (version) 
VALUES ('20230620_091500_add_user_id') 
ON CONFLICT (version) DO NOTHING;