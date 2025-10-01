-- Remove cricket experience and previous teams fields from registration_fields
DELETE FROM registration_fields 
WHERE name IN ('experience', 'previousTeams');

-- Update playing position to be displayed last (after pincode)
UPDATE registration_fields 
SET display_order = 12 
WHERE name = 'position';

-- Update city field to be a select dropdown with major Indian cities
UPDATE registration_fields 
SET 
    type = 'select',
    options = '[
        "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", 
        "Pune", "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur", 
        "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad",
        "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
        "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar",
        "Varanasi", "Srinagar", "Dhanbad", "Jodhpur", "Amritsar", "Raipur",
        "Allahabad", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada",
        "Madurai", "Guwahati", "Chandigarh", "Hubli-Dharwad", "Mysore"
    ]'::jsonb
WHERE name = 'city';

-- Update town field to be a select dropdown with common town/area types
UPDATE registration_fields 
SET 
    type = 'select',
    options = '[
        "City Center", "Old City", "New City", "Industrial Area", "Residential Area",
        "Commercial Area", "IT Hub", "Airport Area", "Railway Station Area",
        "Bus Stand Area", "Market Area", "Hospital Area", "School Area",
        "College Area", "Government Area", "Cantonment", "Civil Lines",
        "Model Town", "Garden City", "Satellite Town", "Suburb"
    ]'::jsonb
WHERE name = 'town';