// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createHmac } from 'https://deno.land/std@0.168.0/crypto/mod.ts';
// @ts-ignore
import { encodeHex } from 'https://deno.land/std@0.168.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentId, orderId, signature, key_secret } = await req.json();

    // Get secret from environment or request body
    // @ts-ignore
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET') || key_secret || '';

    if (!secret) {
      throw new Error('Razorpay secret not configured. Please provide key_secret in request body or set RAZORPAY_KEY_SECRET environment variable.');
    }

    // Create the signature verification string
    const text = orderId + '|' + paymentId;
    const hmac = createHmac('sha256', secret);
    const generatedSignature = encodeHex(hmac.update(text).digest());

    // Verify the signature
    const isValid = generatedSignature === signature;

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    return new Response(JSON.stringify({ verified: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
