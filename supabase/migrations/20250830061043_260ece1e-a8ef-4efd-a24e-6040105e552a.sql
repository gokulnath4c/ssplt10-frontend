-- Add city, town, and pincode fields to registration_fields table
INSERT INTO registration_fields (
  name, 
  label, 
  type, 
  placeholder, 
  required, 
  is_active, 
  display_order
) VALUES 
  ('city', 'City', 'text', 'Enter your city', true, true, 9),
  ('town', 'Town/Area', 'text', 'Enter your town or area', false, true, 10),
  ('pincode', 'PIN Code', 'text', 'Enter your PIN code', true, true, 11);

-- Add corresponding columns to player_registrations table
ALTER TABLE player_registrations 
ADD COLUMN city TEXT,
ADD COLUMN town TEXT,
ADD COLUMN pincode TEXT;