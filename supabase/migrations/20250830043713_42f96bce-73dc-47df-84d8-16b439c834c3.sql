-- Insert sample registration form fields
INSERT INTO public.registration_fields (name, label, type, required, display_order, placeholder, is_active) VALUES 
('full_name', 'Full Name', 'text', true, 1, 'Enter your full name', true),
('email', 'Email Address', 'email', true, 2, 'Enter your email address', true),
('phone', 'Phone Number', 'tel', true, 3, 'Enter your phone number', true),
('date_of_birth', 'Date of Birth', 'date', true, 4, null, true),
('position', 'Playing Position', 'select', true, 5, 'Select your position', true),
('state', 'State/Region', 'select', true, 6, 'Select your state', true),
('experience', 'Cricket Experience (Years)', 'text', false, 7, 'Enter years of experience', true),
('previous_teams', 'Previous Teams/Clubs', 'textarea', false, 8, 'List any previous teams or clubs', true);

-- Update the options for select fields
UPDATE public.registration_fields 
SET options = '["Batsman", "Bowler", "All-rounder", "Wicket Keeper"]'::jsonb
WHERE name = 'position';

UPDATE public.registration_fields 
SET options = '["Tamil Nadu", "Karnataka", "Telangana", "Kerala", "Andhra Pradesh", "Puducherry", "Goa"]'::jsonb
WHERE name = 'state';

-- Add a new theme that matches the original ssplt10.co.in color scheme
INSERT INTO public.theme_settings (theme_name, colors, is_active) VALUES
('SSPL Original Site', '{
    "primary": "210 100% 30%",
    "primaryForeground": "0 0% 100%",
    "secondary": "55 100% 70%",
    "secondaryForeground": "222.2 84% 4.9%",
    "cricketBlue": "210 100% 30%",
    "cricketYellow": "56 100% 45%",
    "cricketLightBlue": "200 100% 95%",
    "cricketDarkBlue": "220 100% 20%",
    "cricketGreen": "68 100% 75%",
    "cricketOrange": "25 100% 60%"
}', false);