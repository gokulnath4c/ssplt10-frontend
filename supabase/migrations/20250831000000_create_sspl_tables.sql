-- Create SSPL Data Tables Migration
-- This migration creates all necessary tables for storing SSPL (Southern Streets Premier League) data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS sspl_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  logo TEXT,
  founded_year INTEGER,
  home_ground VARCHAR(255),
  captain VARCHAR(255),
  coach VARCHAR(255),
  owner VARCHAR(255),
  website VARCHAR(500),
  social_media JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS sspl_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  team_id UUID REFERENCES sspl_teams(id) ON DELETE CASCADE,
  position VARCHAR(50) NOT NULL CHECK (position IN ('batsman', 'bowler', 'all-rounder', 'wicket-keeper')),
  jersey_number INTEGER,
  date_of_birth DATE,
  nationality VARCHAR(100),
  batting_style VARCHAR(50) CHECK (batting_style IN ('right-handed', 'left-handed')),
  bowling_style VARCHAR(100),
  debut_date DATE,
  stats JSONB DEFAULT '{
    "matches": 0,
    "runs": 0,
    "wickets": 0,
    "centuries": 0,
    "fifties": 0,
    "highest_score": 0,
    "best_bowling": "",
    "average": 0.0,
    "strike_rate": 0.0
  }',
  is_captain BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS sspl_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_number INTEGER NOT NULL,
  season VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  team_a_id UUID REFERENCES sspl_teams(id) ON DELETE CASCADE,
  team_b_id UUID REFERENCES sspl_teams(id) ON DELETE CASCADE,
  team_a_score JSONB,
  team_b_score JSONB,
  winner_id UUID REFERENCES sspl_teams(id),
  result VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (result IN ('upcoming', 'live', 'completed', 'cancelled')),
  toss_winner VARCHAR(255),
  toss_decision VARCHAR(10) CHECK (toss_decision IN ('bat', 'bowl')),
  man_of_the_match VARCHAR(255),
  match_type VARCHAR(20) NOT NULL DEFAULT 'league' CHECK (match_type IN ('league', 'playoff', 'final')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure teams are different
  CONSTRAINT different_teams CHECK (team_a_id != team_b_id)
);

-- League standings table
CREATE TABLE IF NOT EXISTS sspl_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES sspl_teams(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  net_run_rate DECIMAL(5,3) DEFAULT 0.000,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique team per season
  UNIQUE(team_id, season)
);

-- News articles table
CREATE TABLE IF NOT EXISTS sspl_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  author VARCHAR(255) NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('match', 'player', 'team', 'league', 'general')),
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS sspl_tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  season VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  total_teams INTEGER NOT NULL,
  total_matches INTEGER NOT NULL,
  winner UUID REFERENCES sspl_teams(id),
  runner_up UUID REFERENCES sspl_teams(id),
  venue VARCHAR(255) NOT NULL,
  prize_money DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  messages JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot settings table
CREATE TABLE IF NOT EXISTS chatbot_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data scraping logs table
CREATE TABLE IF NOT EXISTS scraping_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(255) NOT NULL,
  endpoint VARCHAR(500),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'rate_limited')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  rate_limited BOOLEAN DEFAULT FALSE,
  retry_after INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sspl_players_team_id ON sspl_players(team_id);
CREATE INDEX IF NOT EXISTS idx_sspl_matches_date ON sspl_matches(date);
CREATE INDEX IF NOT EXISTS idx_sspl_matches_season ON sspl_matches(season);
CREATE INDEX IF NOT EXISTS idx_sspl_matches_teams ON sspl_matches(team_a_id, team_b_id);
CREATE INDEX IF NOT EXISTS idx_sspl_standings_season ON sspl_standings(season);
CREATE INDEX IF NOT EXISTS idx_sspl_news_published ON sspl_news(published_date);
CREATE INDEX IF NOT EXISTS idx_sspl_news_category ON sspl_news(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_created ON scraping_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sspl_teams_updated_at BEFORE UPDATE ON sspl_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sspl_players_updated_at BEFORE UPDATE ON sspl_players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sspl_matches_updated_at BEFORE UPDATE ON sspl_matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sspl_standings_updated_at BEFORE UPDATE ON sspl_standings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sspl_news_updated_at BEFORE UPDATE ON sspl_news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sspl_tournaments_updated_at BEFORE UPDATE ON sspl_tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_conversations_updated_at BEFORE UPDATE ON chatbot_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_settings_updated_at BEFORE UPDATE ON chatbot_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default chatbot settings
INSERT INTO chatbot_settings (key, value, description) VALUES
('enabled', 'true', 'Whether the chatbot is enabled'),
('max_history', '50', 'Maximum number of messages to keep in conversation history'),
('confidence_threshold', '0.6', 'Minimum confidence score for query understanding'),
('fallback_responses', '["I apologize, but I don''t have information about that. Could you please rephrase your question?", "I''m still learning about SSPL. Let me know if you have questions about teams, players, or matches!"]', 'Default responses when chatbot cannot understand query'),
('supported_languages', '["en"]', 'Supported languages for the chatbot')
ON CONFLICT (key) DO NOTHING;

-- Insert sample data for testing (optional)
-- You can uncomment these inserts to add sample data for development

/*
-- Sample teams
INSERT INTO sspl_teams (name, city, founded_year, home_ground) VALUES
('Chennai Champions', 'Chennai', 2020, 'Chennai Cricket Ground'),
('Bangalore Blasters', 'Bangalore', 2020, 'Bangalore Stadium'),
('Mumbai Mavericks', 'Mumbai', 2020, 'Mumbai Cricket Club');

-- Sample players
INSERT INTO sspl_players (name, team_id, position, jersey_number, is_active) VALUES
('Rahul Sharma', (SELECT id FROM sspl_teams WHERE name = 'Chennai Champions' LIMIT 1), 'batsman', 7, true),
('Vikram Singh', (SELECT id FROM sspl_teams WHERE name = 'Bangalore Blasters' LIMIT 1), 'bowler', 15, true);
*/