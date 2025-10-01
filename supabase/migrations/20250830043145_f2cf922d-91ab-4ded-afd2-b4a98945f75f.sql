-- Create website_content table for CMS functionality
CREATE TABLE public.website_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create theme_settings table for color scheme management
CREATE TABLE public.theme_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_name TEXT NOT NULL UNIQUE,
    colors JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pages table for dynamic page management
CREATE TABLE public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policies for website_content
CREATE POLICY "Anyone can view website content" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "Anyone can manage website content" ON public.website_content FOR ALL USING (true) WITH CHECK (true);

-- Create policies for theme_settings
CREATE POLICY "Anyone can view theme settings" ON public.theme_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can manage theme settings" ON public.theme_settings FOR ALL USING (true) WITH CHECK (true);

-- Create policies for pages
CREATE POLICY "Anyone can view published pages" ON public.pages FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can manage pages" ON public.pages FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_website_content_updated_at
    BEFORE UPDATE ON public.website_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_theme_settings_updated_at
    BEFORE UPDATE ON public.theme_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default theme based on current SSPL colors
INSERT INTO public.theme_settings (theme_name, colors, is_active) VALUES
('SSPL Original', '{
    "primary": "210 100% 50%",
    "primaryForeground": "0 0% 100%",
    "secondary": "45 100% 50%",
    "secondaryForeground": "222.2 84% 4.9%",
    "cricketBlue": "210 100% 50%",
    "cricketYellow": "56 100% 45%",
    "cricketLightBlue": "210 100% 95%",
    "cricketDarkBlue": "210 100% 35%"
}', true);

-- Insert default website content
INSERT INTO public.website_content (section_name, content) VALUES 
('hero', '{
    "title": "SSPL",
    "tagline": "#gully2glory",
    "stats": {
        "prizeMoney": "Prize Money: 3 Crores*",
        "playerPrize": "Player Prize: 3 Lakhs*",
        "finalsAt": "Finals At: Sharjah",
        "franchisees": "Franchisees: 12"
    }
}'),
('teams', '{
    "title": "Participating Regions",
    "subtitle": "7 powerhouse cricket regions competing for glory",
    "regions": ["Tamil Nadu", "Karnataka", "Telangana", "Kerala", "Andhra Pradesh", "Puducherry", "Goa"]
}');