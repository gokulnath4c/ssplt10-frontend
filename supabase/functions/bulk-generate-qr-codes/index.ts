// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkQRRequest {
  qrCodes: Array<{
    title: string;
    description?: string;
    targetUrl: string;
    channelId?: string;
    templateId?: string;
    expiresAt?: string;
    maxScans?: number;
    tags?: string[];
    metadata?: Record<string, any>;
  }>;
  options?: {
    batchSize?: number;
    skipDuplicates?: boolean;
    notifyOnComplete?: boolean;
  };
}

interface BulkQRResponse {
  success: boolean;
  results: Array<{
    success: boolean;
    qrCode?: any;
    error?: string;
    index: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { qrCodes, options = {} }: BulkQRRequest = await req.json();
    const { batchSize = 10, skipDuplicates = true } = options;

    if (!qrCodes || !Array.isArray(qrCodes) || qrCodes.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No QR codes provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (qrCodes.length > 100) {
      return new Response(
        JSON.stringify({ success: false, error: 'Maximum 100 QR codes allowed per request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: BulkQRResponse['results'] = [];
    let successful = 0;
    let failed = 0;

    // Process QR codes in batches
    for (let i = 0; i < qrCodes.length; i += batchSize) {
      const batch = qrCodes.slice(i, i + batchSize);

      // Process batch concurrently
      const batchPromises = batch.map(async (qrData, batchIndex) => {
        const index = i + batchIndex;

        try {
          // Validate input
          if (!qrData.title || !qrData.targetUrl) {
            return {
              success: false,
              error: 'Title and target URL are required',
              index
            };
          }

          // Validate URL
          try {
            new URL(qrData.targetUrl);
          } catch {
            return {
              success: false,
              error: 'Invalid target URL',
              index
            };
          }

          // Check for duplicates if requested
          if (skipDuplicates) {
            const { data: existing } = await supabase
              .from('sspl_qr_codes')
              .select('id')
              .eq('target_url', qrData.targetUrl)
              .eq('created_by', user.id)
              .single();

            if (existing) {
              return {
                success: false,
                error: 'QR code with this URL already exists',
                index
              };
            }
          }

          // Generate unique code
          const code = `SSPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Generate QR code data (simplified - in production use a QR library)
          const qrDataUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`; // Placeholder
          const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#ffffff"/><text x="128" y="140" text-anchor="middle" font-family="Arial" font-size="12" fill="#000000">${code}</text></svg>`;

          // Create QR code record
          const { data: qrCode, error: insertError } = await supabase
            .from('sspl_qr_codes')
            .insert({
              code,
              title: qrData.title,
              description: qrData.description,
              target_url: qrData.targetUrl,
              qr_data_url: qrDataUrl,
              qr_svg: qrSvg,
              channel_id: qrData.channelId,
              created_by: user.id,
              expires_at: qrData.expiresAt,
              max_scans: qrData.maxScans,
              tags: qrData.tags || [],
              metadata: qrData.metadata || {}
            })
            .select()
            .single();

          if (insertError) {
            console.error('Database insert error:', insertError);
            return {
              success: false,
              error: 'Failed to create QR code',
              index
            };
          }

          // Log creation
          await supabase
            .from('sspl_qr_access_logs')
            .insert({
              qr_code_id: qrCode.id,
              user_id: user.id,
              action: 'create',
              details: { bulk: true, batchIndex: index }
            });

          successful++;
          return {
            success: true,
            qrCode,
            index
          };

        } catch (error) {
          console.error(`Error processing QR code ${index}:`, error);
          failed++;
          return {
            success: false,
            error: error.message || 'Unknown error',
            index
          };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < qrCodes.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const processingTime = Date.now() - startTime;

    const response: BulkQRResponse = {
      success: failed === 0,
      results,
      summary: {
        total: qrCodes.length,
        successful,
        failed,
        processingTime
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Bulk QR generation error:', error);

    const processingTime = Date.now() - startTime;

    const errorResponse: BulkQRResponse = {
      success: false,
      results: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 1,
        processingTime
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});