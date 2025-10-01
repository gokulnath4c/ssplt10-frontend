-- Create admin_settings table for storing application configuration
-- This migration creates the admin_settings table that's referenced in the AdminPanel

CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY,
  registration_fee INTEGER NOT NULL DEFAULT 10,
  gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  razorpay_key_id TEXT,
  razorpay_key_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the primary key for better performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_id ON admin_settings(id);

-- Insert default configuration
INSERT INTO admin_settings (id, registration_fee, gst_percentage)
VALUES ('payment_config', 10, 18.00)
ON CONFLICT (id) DO NOTHING;

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Grant necessary permissions
GRANT ALL ON admin_settings TO authenticated;
GRANT ALL ON admin_settings TO anon;