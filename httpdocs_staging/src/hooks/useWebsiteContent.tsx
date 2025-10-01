import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WebsiteContent = Database['public']['Tables']['website_content']['Row'];
type ThemeSetting = Database['public']['Tables']['theme_settings']['Row'];

export const useWebsiteContent = () => {
  const [content, setContent] = useState<Record<string, any>>({});
  const [theme, setTheme] = useState<ThemeSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
    
    // Subscribe to real-time updates
    const contentSubscription = supabase
      .channel('website_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'website_content'
        },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    const themeSubscription = supabase
      .channel('theme_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'theme_settings'
        },
        () => {
          fetchTheme();
        }
      )
      .subscribe();

    return () => {
      contentSubscription.unsubscribe();
      themeSubscription.unsubscribe();
    };
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*');

      if (error) throw error;

      const contentMap: Record<string, any> = {};
      data?.forEach(item => {
        contentMap[item.section_name] = item.content;
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching website content:', error);
    }
  };

  const fetchTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setTheme(data);
    } catch (error) {
      console.error('Error fetching theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (section: string, fallback: any = {}) => {
    return content[section] || fallback;
  };

  return {
    content,
    theme,
    loading,
    getContent
  };
};

export default useWebsiteContent;