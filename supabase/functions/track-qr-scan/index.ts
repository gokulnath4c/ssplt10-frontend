// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const qrCode = url.searchParams.get('code');

    if (!qrCode) {
      throw new Error('QR code parameter is required');
    }

    // Get QR code details
    const { data: qrData, error: qrError } = await supabase
      .from('sspl_qr_codes')
      .select('*')
      .eq('code', qrCode)
      .single();

    if (qrError || !qrData) {
      throw new Error('QR code not found');
    }

    // Check if QR code is valid
    const { data: isValid, error: validError } = await supabase
      .rpc('is_qr_code_valid', { qr_code_uuid: qrData.id });

    if (validError || !isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'QR code is expired or inactive'
      }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract client information
    const ipAddress = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     req.headers.get('cf-connecting-ip') ||
                     'unknown';

    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent);

    // Get location data (simplified - in production you'd use a geolocation service)
    const locationData = {
      ip: ipAddress,
      country: req.headers.get('cf-ipcountry') || 'unknown',
      city: 'unknown',
      region: 'unknown'
    };

    // Track the scan
    const { error: analyticsError } = await supabase
      .from('sspl_qr_analytics')
      .insert({
        qr_code_id: qrData.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        location_data: locationData,
        device_info: deviceInfo,
        scan_source: url.searchParams.get('source') || 'direct'
      });

    if (analyticsError) {
      console.error('Error tracking analytics:', analyticsError);
    }

    // Increment scan count
    await supabase.rpc('increment_qr_scan_count', {
      qr_code_uuid: qrData.id
    });

    // Log access
    await supabase
      .from('sspl_qr_access_logs')
      .insert({
        qr_code_id: qrData.id,
        action: 'scan',
        ip_address: ipAddress,
        user_agent: userAgent,
        details: {
          scan_source: url.searchParams.get('source') || 'direct',
          location: locationData
        }
      });

    // Redirect to target URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': qrData.target_url,
        'Cache-Control': 'no-cache'
      },
    });

  } catch (error) {
    console.error('Error tracking QR scan:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)|Tablet/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  let browser = 'unknown';
  let os = 'unknown';

  // Detect browser
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return {
    browser,
    os,
    isMobile,
    isTablet,
    isDesktop,
    userAgent
  };
}