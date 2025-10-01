-- MANUAL MIGRATION: Create/Update admin_settings table
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)

-- Check if table exists and handle accordingly
DO $$
BEGIN
    -- If table exists but doesn't have config_key column, drop and recreate
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'admin_settings'
        AND table_schema = 'public'
    ) THEN
        -- Check if config_key column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'admin_settings'
            AND column_name = 'config_key'
            AND table_schema = 'public'
        ) THEN
            -- Drop existing table and recreate with correct schema
            DROP TABLE admin_settings;
            RAISE NOTICE 'Dropped existing admin_settings table without config_key column';
        END IF;
    END IF;
END $$;

-- Create admin_settings table for storing application configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  registration_fee INTEGER NOT NULL DEFAULT 699,
  gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  razorpay_key_id TEXT,
  razorpay_key_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the config_key for better performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_config_key ON admin_settings(config_key);

-- Insert default configuration (only if table is empty)
INSERT INTO admin_settings (config_key, registration_fee, gst_percentage)
SELECT 'payment_config', 699, 18.00
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE config_key = 'payment_config');

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Grant necessary permissions
GRANT ALL ON admin_settings TO authenticated;
GRANT ALL ON admin_settings TO anon;

-- Verify the table was created successfully
SELECT 'admin_settings table created/updated successfully' as status;