-- Insert sample pages for the CMS
INSERT INTO public.pages (title, slug, content, is_published, meta_title, meta_description) VALUES 
('About SSPL T10', 'about-us', '{
    "title": "About SSPL T10 Cricket League",
    "content": "SSPL T10 is the ultimate cricket league that brings together talent from across South India. Our innovative T10 format ensures fast-paced, exciting matches that keep spectators on the edge of their seats.",
    "sections": [
        {
            "heading": "Our Mission",
            "content": "To provide a platform for cricket enthusiasts to showcase their talent and compete at the highest level."
        },
        {
            "heading": "Tournament Format",
            "content": "T10 format ensures quick, thrilling matches with maximum entertainment value."
        }
    ]
}', true, 'About SSPL T10 Cricket League', 'Learn about the SSPL T10 cricket tournament, its mission, format, and vision for cricket in South India'),

('Tournament Rules', 'rules', '{
    "title": "Tournament Rules & Regulations",
    "content": "Complete guide to SSPL T10 tournament rules and regulations.",
    "rules": [
        "Each match consists of 10 overs per side",
        "Maximum 5 bowlers per team",
        "Powerplay: First 3 overs",
        "No bowler can bowl more than 2 overs"
    ]
}', true, 'SSPL T10 Tournament Rules', 'Official rules and regulations for the SSPL T10 cricket tournament'),

('Contact Us', 'contact', '{
    "title": "Contact SSPL T10",
    "content": "Get in touch with us for any queries about the tournament.",
    "contact": {
        "email": "info@ssplt10.co.in",
        "phone": "+91 98765 43210",
        "address": "Sports City, India 560001"
    }
}', true, 'Contact SSPL T10', 'Contact information for SSPL T10 cricket tournament organizers');