// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore
import QRCode from 'https://esm.sh/qrcode@1.5.3';

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

    const { title, description, targetUrl, templateId, expiresAt, maxScans, tags, metadata } = await req.json();

    if (!title || !targetUrl) {
      throw new Error('Title and target URL are required');
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch {
      throw new Error('Invalid target URL format');
    }

    // Generate unique code
    const code = `SSPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get template configuration
    let qrOptions = {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256,
      margin: 4,
      errorCorrectionLevel: 'M' as const
    };

    if (templateId) {
      const { data: template } = await supabase
        .from('sspl_qr_templates')
        .select('template_data')
        .eq('id', templateId)
        .single();

      if (template) {
        qrOptions = { ...qrOptions, ...template.template_data };
      }
    }

    // Generate QR code data URLs
    const qrDataUrl = await QRCode.toDataURL(targetUrl, qrOptions);
    const qrSvg = await QRCode.toString(targetUrl, { ...qrOptions, type: 'svg' });

    // Create QR code record
    const { data: qrCode, error: insertError } = await supabase
      .from('sspl_qr_codes')
      .insert({
        code,
        title,
        description,
        target_url: targetUrl,
        qr_data_url: qrDataUrl,
        qr_svg: qrSvg,
        created_by: user.id,
        expires_at: expiresAt,
        max_scans: maxScans,
        tags: tags || [],
        metadata: metadata || {}
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Log access
    await supabase
      .from('sspl_qr_access_logs')
      .insert({
        qr_code_id: qrCode.id,
        user_id: user.id,
        action: 'create',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
        details: { template_id: templateId }
      });

    return new Response(JSON.stringify({
      success: true,
      qrCode: {
        id: qrCode.id,
        code: qrCode.code,
        title: qrCode.title,
        description: qrCode.description,
        targetUrl: qrCode.target_url,
        qrDataUrl: qrCode.qr_data_url,
        qrSvg: qrCode.qr_svg,
        isActive: qrCode.is_active,
        expiresAt: qrCode.expires_at,
        maxScans: qrCode.max_scans,
        currentScans: qrCode.current_scans,
        tags: qrCode.tags,
        createdAt: qrCode.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});