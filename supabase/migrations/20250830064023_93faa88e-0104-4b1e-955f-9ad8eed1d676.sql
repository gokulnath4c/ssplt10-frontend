-- Remove experience and previous_teams columns from player_registrations table
ALTER TABLE public.player_registrations 
DROP COLUMN IF EXISTS experience,
DROP COLUMN IF EXISTS previous_teams;