-- Migration: Initial Schema
-- Creates the initial database schema including the schema_migrations table

-- Create schema_migrations table to track migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create calculations table to store calculation history
CREATE TABLE IF NOT EXISTS calculations (
  id SERIAL PRIMARY KEY,
  operation VARCHAR(50) NOT NULL,
  a NUMERIC NOT NULL,
  b NUMERIC NOT NULL,
  result NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Record that this migration has been applied
INSERT INTO schema_migrations (version) 
VALUES ('20230615_143000_initial_schema') 
ON CONFLICT (version) DO NOTHING;
