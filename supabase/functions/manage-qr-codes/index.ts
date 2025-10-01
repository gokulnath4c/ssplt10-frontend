import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const method = req.method;

    // GET - List QR codes
    if (method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search');
      const category = url.searchParams.get('category');
      const isActive = url.searchParams.get('isActive');

      let query = supabase
        .from('sspl_qr_codes')
        .select(`
          *,
          categories:sspl_qr_code_categories(
            category:sspl_qr_categories(*)
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      let countQuery = supabase
        .from('sspl_qr_codes')
        .select(`
          *,
          categories:sspl_qr_code_categories(
            category:sspl_qr_categories(*)
          )
        `, { count: 'exact', head: true })
        .eq('created_by', user.id);

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (category) {
        query = query.eq('categories.category.id', category);
        countQuery = countQuery.eq('categories.category.id', category);
      }

      if (isActive !== null) {
        query = query.eq('is_active', isActive === 'true');
        countQuery = countQuery.eq('is_active', isActive === 'true');
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { count } = await countQuery;
      const { data: qrCodes, error: listError } = await query
        .range(from, to);

      if (listError) {
        throw listError;
      }

      return new Response(JSON.stringify({
        success: true,
        qrCodes: qrCodes || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create QR code (handled by generate-qr-code function)
    if (method === 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Use /generate-qr-code endpoint to create QR codes'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT - Update QR code
    if (method === 'PUT') {
      const { id, title, description, isActive, tags, metadata } = await req.json();

      if (!id) {
        throw new Error('QR code ID is required');
      }

      // Verify ownership
      const { data: existingQr, error: ownershipError } = await supabase
        .from('sspl_qr_codes')
        .select('created_by')
        .eq('id', id)
        .single();

      if (ownershipError || existingQr.created_by !== user.id) {
        throw new Error('Access denied');
      }

      const { data: updatedQr, error: updateError } = await supabase
        .from('sspl_qr_codes')
        .update({
          title,
          description,
          is_active: isActive,
          tags,
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Log access
      await supabase
        .from('sspl_qr_access_logs')
        .insert({
          qr_code_id: id,
          user_id: user.id,
          action: 'update',
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          details: { fields_updated: ['title', 'description', 'is_active', 'tags', 'metadata'] }
        });

      return new Response(JSON.stringify({
        success: true,
        qrCode: updatedQr
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Delete QR code
    if (method === 'DELETE') {
      const qrCodeId = url.searchParams.get('id');

      if (!qrCodeId) {
        throw new Error('QR code ID is required');
      }

      // Verify ownership
      const { data: existingQr, error: ownershipError } = await supabase
        .from('sspl_qr_codes')
        .select('created_by')
        .eq('id', qrCodeId)
        .single();

      if (ownershipError || existingQr.created_by !== user.id) {
        throw new Error('Access denied');
      }

      const { error: deleteError } = await supabase
        .from('sspl_qr_codes')
        .delete()
        .eq('id', qrCodeId);

      if (deleteError) {
        throw deleteError;
      }

      // Log access
      await supabase
        .from('sspl_qr_access_logs')
        .insert({
          qr_code_id: qrCodeId,
          user_id: user.id,
          action: 'delete',
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent')
        });

      return new Response(JSON.stringify({
        success: true,
        message: 'QR code deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error managing QR codes:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});