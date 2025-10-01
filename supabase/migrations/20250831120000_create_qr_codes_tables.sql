-- QR Codes and Analytics Migration
-- This migration creates tables for QR code generation, management, and analytics tracking

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- QR Codes table
CREATE TABLE IF NOT EXISTS sspl_qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  qr_data_url TEXT, -- Base64 encoded QR code image
  qr_svg TEXT, -- SVG version of QR code
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_scans INTEGER, -- NULL for unlimited
  current_scans INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Additional configuration
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Code Analytics table
CREATE TABLE IF NOT EXISTS sspl_qr_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES sspl_qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  location_data JSONB, -- Geolocation data
  device_info JSONB, -- Device and browser info
  session_id VARCHAR(255),
  scan_source VARCHAR(50) DEFAULT 'direct', -- 'direct', 'gallery', 'social', etc.
  metadata JSONB DEFAULT '{}'
);

-- QR Code Categories table
CREATE TABLE IF NOT EXISTS sspl_qr_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for QR codes and categories
CREATE TABLE IF NOT EXISTS sspl_qr_code_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES sspl_qr_codes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES sspl_qr_categories(id) ON DELETE CASCADE,
  UNIQUE(qr_code_id, category_id)
);

-- QR Code Templates table
CREATE TABLE IF NOT EXISTS sspl_qr_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Template configuration
  preview_image TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Code Channels table (for channel mapping)
CREATE TABLE IF NOT EXISTS sspl_qr_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'link',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add channel_id to QR codes table
ALTER TABLE sspl_qr_codes ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES sspl_qr_channels(id) ON DELETE SET NULL;

-- QR Code Access Logs table (for security monitoring)
CREATE TABLE IF NOT EXISTS sspl_qr_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES sspl_qr_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'scan', 'download'
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_codes_code ON sspl_qr_codes(code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_codes_created_by ON sspl_qr_codes(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_codes_active ON sspl_qr_codes(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_codes_expires ON sspl_qr_codes(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_codes_channel_id ON sspl_qr_codes(channel_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_channels_category ON sspl_qr_channels(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_channels_active ON sspl_qr_channels(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_analytics_qr_code ON sspl_qr_analytics(qr_code_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_analytics_scanned_at ON sspl_qr_analytics(scanned_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_analytics_ip ON sspl_qr_analytics(ip_address);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_access_logs_qr_code ON sspl_qr_access_logs(qr_code_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sspl_qr_access_logs_action ON sspl_qr_access_logs(action);

-- Create updated_at trigger function (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sspl_qr_codes_updated_at BEFORE UPDATE ON sspl_qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sspl_qr_categories_updated_at BEFORE UPDATE ON sspl_qr_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sspl_qr_templates_updated_at BEFORE UPDATE ON sspl_qr_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sspl_qr_channels_updated_at BEFORE UPDATE ON sspl_qr_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO sspl_qr_categories (name, description, color, icon) VALUES
('Player Registration', 'QR codes for player registration links', '#3B82F6', 'user-plus'),
('Tournament Info', 'QR codes linking to tournament information', '#10B981', 'trophy'),
('Team Pages', 'QR codes for team profile pages', '#F59E0B', 'users'),
('Gallery', 'QR codes for gallery and media content', '#EF4444', 'image'),
('Social Media', 'QR codes for social media links', '#8B5CF6', 'share'),
('General', 'General purpose QR codes', '#6B7280', 'link')
ON CONFLICT (name) DO NOTHING;

-- Insert default channels
INSERT INTO sspl_qr_channels (name, description, category, color, icon) VALUES
('Website', 'QR codes for website integration', 'digital', '#3B82F6', 'globe'),
('Social Media', 'QR codes for social media campaigns', 'marketing', '#10B981', 'share'),
('Email Marketing', 'QR codes for email campaigns', 'marketing', '#F59E0B', 'mail'),
('Print Media', 'QR codes for print advertisements', 'marketing', '#EF4444', 'printer'),
('Events', 'QR codes for event registration', 'events', '#8B5CF6', 'calendar'),
('Internal', 'QR codes for internal use', 'internal', '#6B7280', 'building'),
('Partnerships', 'QR codes for partner campaigns', 'partnerships', '#EC4899', 'handshake')
ON CONFLICT (name) DO NOTHING;

-- Insert default templates
INSERT INTO sspl_qr_templates (name, description, template_data, is_default) VALUES
('Classic', 'Simple black and white QR code', '{"foreground": "#000000", "background": "#FFFFFF", "size": 256, "margin": 4}', true),
('Colored', 'QR code with custom colors', '{"foreground": "#3B82F6", "background": "#FFFFFF", "size": 256, "margin": 4}', false),
('Compact', 'Smaller QR code for limited space', '{"foreground": "#000000", "background": "#FFFFFF", "size": 128, "margin": 2}', false),
('High Contrast', 'High contrast QR code for accessibility', '{"foreground": "#000000", "background": "#FFFFFF", "size": 256, "margin": 4}', false)
ON CONFLICT (name) DO NOTHING;

-- Row Level Security Policies

-- QR Codes policies
ALTER TABLE sspl_qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active QR codes" ON sspl_qr_codes
  FOR SELECT USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "Users can create QR codes" ON sspl_qr_codes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own QR codes" ON sspl_qr_codes
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own QR codes" ON sspl_qr_codes
  FOR DELETE USING (created_by = auth.uid());

-- Analytics policies (read-only for creators, full access for admins)
ALTER TABLE sspl_qr_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "QR code creators can view their analytics" ON sspl_qr_analytics
  FOR SELECT USING (
    qr_code_id IN (
      SELECT id FROM sspl_qr_codes WHERE created_by = auth.uid()
    )
  );

-- Categories policies
ALTER TABLE sspl_qr_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for categories" ON sspl_qr_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin only category management" ON sspl_qr_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Access logs policies
ALTER TABLE sspl_qr_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "QR code creators can view their access logs" ON sspl_qr_access_logs
  FOR SELECT USING (
    qr_code_id IN (
      SELECT id FROM sspl_qr_codes WHERE created_by = auth.uid()
    )
  );

-- Channels policies
ALTER TABLE sspl_qr_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for channels" ON sspl_qr_channels
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin only channel management" ON sspl_qr_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to increment scan count
CREATE OR REPLACE FUNCTION increment_qr_scan_count(qr_code_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE sspl_qr_codes
  SET current_scans = current_scans + 1
  WHERE id = qr_code_uuid AND (max_scans IS NULL OR current_scans < max_scans);
END;
$$ LANGUAGE plpgsql;

-- Function to check if QR code is expired or exceeded scan limit
CREATE OR REPLACE FUNCTION is_qr_code_valid(qr_code_uuid UUID)
RETURNS boolean AS $$
DECLARE
  qr_record RECORD;
BEGIN
  SELECT * INTO qr_record FROM sspl_qr_codes WHERE id = qr_code_uuid;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF NOT qr_record.is_active THEN
    RETURN false;
  END IF;

  IF qr_record.expires_at IS NOT NULL AND qr_record.expires_at < NOW() THEN
    RETURN false;
  END IF;

  IF qr_record.max_scans IS NOT NULL AND qr_record.current_scans >= qr_record.max_scans THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get QR analytics summary
CREATE OR REPLACE FUNCTION get_qr_analytics_summary(
  qr_code_uuid UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_scans BIGINT;
  unique_ips BIGINT;
  top_browser TEXT;
  top_os TEXT;
  top_country TEXT;
  avg_scans_per_day DECIMAL;
BEGIN
  -- Build date filter
  CREATE TEMP TABLE temp_analytics AS
  SELECT * FROM sspl_qr_analytics
  WHERE qr_code_id = qr_code_uuid
    AND (start_date IS NULL OR scanned_at >= start_date)
    AND (end_date IS NULL OR scanned_at <= end_date);

  -- Calculate metrics
  SELECT COUNT(*) INTO total_scans FROM temp_analytics;

  SELECT COUNT(DISTINCT ip_address) INTO unique_ips FROM temp_analytics;

  -- Top browser
  SELECT device_info->>'browser' INTO top_browser
  FROM temp_analytics
  WHERE device_info->>'browser' IS NOT NULL
  GROUP BY device_info->>'browser'
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Top OS
  SELECT device_info->>'os' INTO top_os
  FROM temp_analytics
  WHERE device_info->>'os' IS NOT NULL
  GROUP BY device_info->>'os'
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Top country
  SELECT location_data->>'country' INTO top_country
  FROM temp_analytics
  WHERE location_data->>'country' IS NOT NULL
    AND location_data->>'country' != 'unknown'
  GROUP BY location_data->>'country'
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Average scans per day
  SELECT
    CASE
      WHEN end_date IS NOT NULL AND start_date IS NOT NULL THEN
        total_scans::DECIMAL / GREATEST(1, EXTRACT(EPOCH FROM (end_date - start_date)) / 86400)
      ELSE total_scans::DECIMAL / GREATEST(1, EXTRACT(EPOCH FROM (NOW() - (SELECT MIN(scanned_at) FROM temp_analytics))) / 86400)
    END INTO avg_scans_per_day;

  -- Build result JSON
  result := json_build_object(
    'totalScans', total_scans,
    'uniqueIPs', unique_ips,
    'topBrowser', COALESCE(top_browser, 'unknown'),
    'topOS', COALESCE(top_os, 'unknown'),
    'topCountry', COALESCE(top_country, 'unknown'),
    'avgScansPerDay', ROUND(avg_scans_per_day, 2),
    'dateRange', json_build_object(
      'start', start_date,
      'end', end_date
    )
  );

  DROP TABLE temp_analytics;

  RETURN result;
END;
$$ LANGUAGE plpgsql;