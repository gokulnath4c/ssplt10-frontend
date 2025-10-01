-- Create Google Analytics Configuration Tables Migration
-- This migration creates tables for storing Google Analytics configuration and settings

-- Google Analytics configuration table
CREATE TABLE IF NOT EXISTS google_analytics_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  measurement_id VARCHAR(50) NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT FALSE,
  debug_mode BOOLEAN DEFAULT FALSE,
  tracking_enabled BOOLEAN DEFAULT TRUE,
  exclude_admin_users BOOLEAN DEFAULT TRUE,
  sample_rate DECIMAL(3,2) DEFAULT 1.00 CHECK (sample_rate >= 0.01 AND sample_rate <= 1.00),
  custom_dimensions JSONB DEFAULT '{}',
  custom_metrics JSONB DEFAULT '{}',
  event_tracking JSONB DEFAULT '{
    "page_views": true,
    "button_clicks": true,
    "form_submissions": true,
    "social_interactions": true,
    "registration_events": true,
    "payment_events": true,
    "user_interactions": true
  }',
  privacy_settings JSONB DEFAULT '{
    "anonymize_ip": true,
    "respect_do_not_track": true,
    "cookie_expiry_days": 730
  }',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Analytics events log table (for custom tracking)
CREATE TABLE IF NOT EXISTS google_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_label VARCHAR(255),
  event_value INTEGER,
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  page_path VARCHAR(500),
  page_title VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  referrer VARCHAR(500),
  custom_parameters JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Analytics goals/funnels table
CREATE TABLE IF NOT EXISTS google_analytics_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('destination', 'duration', 'pages_per_session', 'event')),
  goal_value VARCHAR(255),
  goal_conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Analytics reports cache table
CREATE TABLE IF NOT EXISTS google_analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type VARCHAR(50) NOT NULL,
  report_name VARCHAR(100) NOT NULL,
  date_range VARCHAR(50) NOT NULL,
  parameters JSONB DEFAULT '{}',
  data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
  created_by UUID REFERENCES auth.users(id)
);

-- Google Analytics user consent table
CREATE TABLE IF NOT EXISTS google_analytics_consent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMP WITH TIME ZONE,
  consent_type VARCHAR(20) DEFAULT 'analytics' CHECK (consent_type IN ('analytics', 'marketing', 'functional')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, consent_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ga_config_enabled ON google_analytics_config(enabled);
CREATE INDEX IF NOT EXISTS idx_ga_events_timestamp ON google_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_ga_events_category ON google_analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_ga_events_user ON google_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ga_goals_active ON google_analytics_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_ga_reports_type ON google_analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_ga_reports_expires ON google_analytics_reports(expires_at);
CREATE INDEX IF NOT EXISTS idx_ga_consent_user ON google_analytics_consent(user_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ga_config_updated_at BEFORE UPDATE ON google_analytics_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ga_goals_updated_at BEFORE UPDATE ON google_analytics_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ga_consent_updated_at BEFORE UPDATE ON google_analytics_consent FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default GA configuration
INSERT INTO google_analytics_config (
  measurement_id,
  enabled,
  debug_mode,
  tracking_enabled,
  exclude_admin_users,
  sample_rate
) VALUES (
  'GA_MEASUREMENT_ID',
  false,
  false,
  true,
  true,
  1.00
) ON CONFLICT (measurement_id) DO NOTHING;

-- Insert default goals
INSERT INTO google_analytics_goals (
  name,
  description,
  goal_type,
  goal_value,
  goal_conditions
) VALUES
(
  'Player Registration',
  'Track successful player registrations',
  'event',
  'registration_complete',
  '{"event_category": "registration", "event_action": "form_submit_success"}'
),
(
  'Payment Completion',
  'Track successful payment transactions',
  'event',
  'payment_success',
  '{"event_category": "ecommerce", "event_action": "payment_success"}'
),
(
  'Social Media Engagement',
  'Track social media interactions',
  'event',
  'social_interaction',
  '{"event_category": "social"}'
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE google_analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_analytics_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_analytics_consent ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Allow admin full access to GA config" ON google_analytics_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Allow admin full access to GA events" ON google_analytics_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Allow admin full access to GA goals" ON google_analytics_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Allow admin full access to GA reports" ON google_analytics_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow users to manage their own consent
CREATE POLICY "Users can manage their own GA consent" ON google_analytics_consent
  FOR ALL USING (auth.uid() = user_id);

-- Allow anonymous consent creation
CREATE POLICY "Allow anonymous GA consent creation" ON google_analytics_consent
  FOR INSERT WITH (true);