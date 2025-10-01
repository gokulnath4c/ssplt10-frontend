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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const url = new URL(req.url);
    const qrCodeId = url.searchParams.get('qrCodeId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    if (!qrCodeId) {
      throw new Error('QR code ID is required');
    }

    // Verify ownership
    const { data: qrCode, error: qrError } = await supabase
      .from('sspl_qr_codes')
      .select('id, created_by')
      .eq('id', qrCodeId)
      .single();

    if (qrError || !qrCode) {
      throw new Error('QR code not found');
    }

    if (qrCode.created_by !== user.id) {
      throw new Error('Access denied');
    }

    // Build analytics query
    let query = supabase
      .from('sspl_qr_analytics')
      .select('*')
      .eq('qr_code_id', qrCodeId)
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('scanned_at', startDate);
    }

    if (endDate) {
      query = query.lte('scanned_at', endDate);
    }

    const { data: analytics, error: analyticsError } = await query;

    if (analyticsError) {
      throw analyticsError;
    }

    // Get summary statistics
    const { data: summary, error: summaryError } = await supabase
      .rpc('get_qr_analytics_summary', {
        qr_code_uuid: qrCodeId,
        start_date: startDate,
        end_date: endDate
      });

    if (summaryError) {
      console.error('Error getting summary:', summaryError);
    }

    // Get scan trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: trends, error: trendsError } = await supabase
      .from('sspl_qr_analytics')
      .select('scanned_at')
      .eq('qr_code_id', qrCodeId)
      .gte('scanned_at', thirtyDaysAgo.toISOString())
      .order('scanned_at');

    if (trendsError) {
      console.error('Error getting trends:', trendsError);
    }

    // Process trends data
    const scanTrends = trends ? processScanTrends(trends) : [];

    return new Response(JSON.stringify({
      success: true,
      analytics: analytics || [],
      summary: summary || {},
      trends: scanTrends
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting QR analytics:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function processScanTrends(trends: any[]) {
  const dailyCounts: { [key: string]: number } = {};

  trends.forEach(scan => {
    const date = new Date(scan.scanned_at).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  return Object.entries(dailyCounts).map(([date, count]) => ({
    date,
    scans: count
  })).sort((a, b) => a.date.localeCompare(b.date));
}